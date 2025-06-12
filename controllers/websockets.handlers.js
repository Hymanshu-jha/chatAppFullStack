// socket/socket.controller.js
import Room from '../db/models/rooms.models.js';
import User from '../db/models/users.models.js';
import mongoose from 'mongoose';
import Message from '../db/models/messages.models.js';
import { onlineUsers } from './websockets.server.js';
import WebSocket from 'ws';

export const handleMessage = async (ws, msg) => {

  switch (msg.type) {




case 'group_create': {
  try {
    const { name, description, members } = msg;
    
    // Check if group name is provided
    if (!name) {
      ws.send(JSON.stringify({
        type: 'error',
        message: "Group name is missing"
      }));
      break;
    }
    
    console.log('inside backend group_create');
    
    // Extract member IDs from the members array
    // Assuming members is an array of user objects with _id property
    const memberIds = members ? members.map(member => member._id) : [];
    
    // FIX: Use consistent user ID field - use _id consistently
    const currentUserId = ws?.user?._id || ws?.user?.userId;
    
    // Add the current user to members array if not already included
    if (!memberIds.includes(currentUserId.toString())) {
      memberIds.push(currentUserId);
    }
    
    // Set current user as admin
    const adminIds = [currentUserId];
    
    console.log('Creating group with:', {
      name,
      memberIds,
      adminIds
    });
    
    // Call the static method correctly on the Room model (not roomSchema)
    const saveResponse = await Room.createGroup(name, memberIds, adminIds);
    
    if (!saveResponse) {
      console.log('error while inserting room in database from websocket handler backend...');
      ws.send(JSON.stringify({
        type: 'error',
        message: "Failed to create group"
      }));
      break;
    }
    
    console.log('room saved to database successfully...!!!');
    
    // Send success response back to client
    ws.send(JSON.stringify({
      type: 'group_create_success',
      message: "Group created successfully",
      room: saveResponse
    }));
    
    // Optionally notify other members about the new group
    // You might want to implement this based on your application logic
    
  } catch (error) {
    console.error('Error creating group:', error.message);
    ws.send(JSON.stringify({
      type: 'error',
      message: error.message || "Failed to create group"
    }));
  }
  
  break;
}

case 'group_message': {
  try {
    console.log('inside group_message backend');
    
    const { to, name, message } = msg;

    // FIX: Add proper validation
    if (!message) {
      return ws.send(JSON.stringify({
        type: 'error',
        message: 'Message is required',
      }));
    }

    if (!name) {
      return ws.send(JSON.stringify({
        type: 'error',
        message: 'Room name is required',
      }));
    }

    if (to && to.length === 0) {
      console.log('to is a required field');
    }

    let chatRoom;
    
    // FIX: Use consistent user ID field
    const currentUserId = ws?.user?._id || ws?.user?.userId;
    
    console.log('Looking for room:', name);
    console.log('User ID:', currentUserId);

    // Fetch room from DB
    try {
      chatRoom = await Room.findOne({
        roomName: name,
        members: { $in: [new mongoose.Types.ObjectId(currentUserId)] },
        isGroup: true
      });

      if (!chatRoom) {
        return ws.send(JSON.stringify({
          type: 'error',
          message: 'Room not found or access denied--group',
        }));
      }
    } catch (error) {
      return ws.send(JSON.stringify({
        type: 'error',
        message: error.message,
      }));
    }

    // After storing message in DB
    for (const memberId of chatRoom.members) {
      const memberIdStr = memberId.toString();
      const memberSocket = onlineUsers.get(memberIdStr);

      if (memberSocket && memberSocket.readyState === WebSocket.OPEN) {
        memberSocket.send(JSON.stringify({
          type: 'group_message',
          room: chatRoom?.roomName,
          sender: ws?.user,
          message: message,
          to: memberIdStr,
          timestamp: new Date().toISOString()
        }));
      }
    }




    console.log('sent to all group members...');

    // FIX: Use sender ObjectId instead of full object and remove redundant fallback
    try {
      await Message.create({
        message,
        roomId: chatRoom?._id,
        sender: currentUserId
      });
    } catch (error) {
      return ws.send(JSON.stringify({
        type: 'error',
        message: error.message,
      }));
    }

  } catch (error) {
    ws.send(JSON.stringify({
      type: 'error',
      message: error.message,
    }));
  }

  break;
}

case 'direct_message': {

    // const payload = {
    //   type: "direct_message",
    //   to: foundUser?.emailid,
    //   message: `Hey ${foundUser?.name}, this is ${user?.name}`,
    //   purpose: "roomJoin"
    // };


  try {
    const { to, message, roomId } = msg;

    if (to?.length === 0 || !message) {
      return ws.send(JSON.stringify({
        type: 'error',
        message: '"to" and "message" are required fields',
      }));
    }

    const existingReceiver = await User.findOne({ emailid: to[0] });
    if (!existingReceiver) {
      return ws.send(JSON.stringify({
        type: 'error',
        message: 'No receiver found for direct message',
      }));
    }

    const sender = ws?.user;
    const receiverId = existingReceiver._id.toString();
    
    // FIX: Use consistent user ID field
    const currentUserId = ws?.user?._id || ws?.user?.userId;

    const sortedMemberIds = [currentUserId.toString(), receiverId].sort();
    const membersObjIds = sortedMemberIds.map(id => new mongoose.Types.ObjectId(id));
    const membersHash = sortedMemberIds.join('|');

    let toJoinRoom;

    if (!roomId) {
      toJoinRoom = await Room.findOne({
        isGroup: false,
        membersHash: membersHash
      }).populate('members');

      if (!toJoinRoom) {
        try {
          toJoinRoom = await Room.create({
            members: membersObjIds,
            isGroup: false,
            membersHash: membersHash
          });

          // Refetch with populated members
          toJoinRoom = await Room.findById(toJoinRoom._id).populate('members');

        } catch (error) {
          if (error.code === 11000) {
            toJoinRoom = await Room.findOne({
              isGroup: false,
              membersHash: membersHash
            }).populate('members');

            if (!toJoinRoom) {
              console.error('Failed to find room after duplicate error');
              return ws.send(JSON.stringify({
                type: 'error',
                message: 'Could not create or find direct message room',
              }));
            }
          } else {
            throw error;
          }
        }
      }
    } else {
      toJoinRoom = await Room.findById(roomId).populate('members');
      if (!toJoinRoom) {
        return ws.send(JSON.stringify({
          type: 'error',
          message: 'Room not found',
        }));
      }
    }

    ws.room = toJoinRoom;
    const toJoinRoomObject = toJoinRoom.toObject();

    // FIX: Use consistent user ID field
    const newMessage = await Message.create({
      sender,
      receiver: [receiverId],
      roomId: toJoinRoom._id,
      message,
      createdAt: new Date().toISOString()
    });

    const plainMessage = newMessage.toObject();

    if (!newMessage) {
      return ws.send(JSON.stringify({
        type: 'error',
        message: 'Error while creating direct_message in database',
        room: toJoinRoomObject
      }));
    }

    // Acknowledge sender
    ws.send(JSON.stringify({
      type: 'direct_message',
      message: plainMessage,
      room: toJoinRoomObject,
      sender,
      createdAt: plainMessage.createdAt
    }));

    if (msg.purpose === "roomJoin") {
      ws.send(JSON.stringify({
        type: 'direct_message',
        message: plainMessage,
        room: toJoinRoomObject,
        sender,
        createdAt: plainMessage.createdAt,
        purpose: "roomJoin",
        roomName: existingReceiver.name
      }));
    }

    const recipientSocket = onlineUsers.get(receiverId);
    if (recipientSocket) {
      recipientSocket.send(JSON.stringify({
        type: 'direct_message',
        sender,
        message: plainMessage,
        room: toJoinRoomObject
      }));

      if (msg.purpose === "roomJoin") {
        recipientSocket.send(JSON.stringify({
          type: 'direct_message',
          sender,
          message: plainMessage,
          room: toJoinRoomObject,
          purpose: "roomJoin",
          roomName: existingReceiver.name,
          existingReceiverEmailId: existingReceiver
        }));
      }

      console.log("newMessage: ", newMessage);
    } else {
      console.log(`📪 user ${receiverId} is offline`);
    }

    console.log('✅ Message saved to DB for direct_message');

  } catch (error) {
    console.error('❌ direct_message error:', error.message);
    ws.send(JSON.stringify({
      type: 'error',
      message: error.message,
    }));
  }

  break;
}




case 'join': {
  const roomName = msg.roomName;
  const roomId = msg.roomId;

  // User will send 'join' request for creating a new group room
  // He will send emailid, room name, room id
  // We check roomid in db if exists then we add the user else we create one with same name and add this member
  // If user creates the room he is admin then

  if (!roomName) {
    return ws.send(JSON.stringify({
      type: 'error',
      message: 'Room name is required',
    }));
  }

  try {
    // FIX: Use consistent user ID field
    const currentUserId = ws.user._id || ws.user.userId;
    
    const existingRooms = await Room.find({
      roomId: roomId,
      roomName: roomName,
      isGroup: true
    });
    
    let toJoinRoom = existingRooms[0] || null;
    if (existingRooms.length === 0) {
      const roomCreated = await Room.create({
        members: [currentUserId],
        roomName: roomName,
        isGroup: true,
      });

      if (!roomCreated) {
        return ws.send(JSON.stringify({
          type: 'error',
          message: 'Error creating room',
        }));
      }

      toJoinRoom = roomCreated;
    } else {
      toJoinRoom = existingRooms[0];
      await Room.updateOne(
        { _id: toJoinRoom._id },
        { 
          $addToSet: { members: currentUserId },
          roomName: roomName
        }
      );
    }

    ws.room = toJoinRoom;

    ws.send(JSON.stringify({
      type: 'info',
      message: `Joined room: ${toJoinRoom.roomName}`,
      roomId: toJoinRoom._id,
    }));
  } catch (error) {
    console.error('Join room error:', error.message);
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Internal server error while joining room',
    }));
  }

  break;
}

case 'notification': {
  // We want to accept notification type msg and store that in db and also send it to the 
  // room where it belongs  
  // We need roomName, roomid, sender id, notificationContent, type: notification
  
  // TODO: Implement notification logic
  ws.send(JSON.stringify({
    type: 'info',
    message: 'Notification handling not yet implemented',
  }));
  
  break;
}

default:
  ws.send(JSON.stringify({
    type: 'error',
    message: 'Unsupported message type',
  }));
  }
};