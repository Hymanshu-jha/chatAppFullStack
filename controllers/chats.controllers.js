import mongoose from 'mongoose';


import Message from "../db/models/messages.models.js";
import Room from "../db/models/rooms.models.js";




export const getRooms = async (req, res , next) => {

    try {

        console.log('trying rooms retrieval');
        
        const {_id , emailid} = req.user;
        if(!_id || !emailid) {
            return res.json({ "type":"error" , "message":"fields missing"})
        }

            const rooms = await Room.find({ members: new mongoose.Types.ObjectId(_id) })
            .populate('members', 'name emailid _id')
            .exec();


        if (rooms.length === 0) {
            return res.status(404).json({ type: "error", message: "No rooms for current user" });
        }


        
        res.status(200).json({
          rooms, 
          message: "rooms successfully fetched"
        });


    } catch (error) {
        next(error);
    }

}






export const getMessages = async (req, res, next) => {
  try {
    const { _id, emailid } = req.user;
    const { roomId } = req.params;


    const userObjectId = new mongoose.Types.ObjectId(_id);

    if (!_id || !emailid) {
      return res.status(400).json({
        type: "error",
        message: "Missing user credentials",
      });
    }

    if (!roomId) {
      return res.status(400).json({
        type: "error",
        message: "Missing roomId parameter",
      });
    }

    console.log("Fetching messages for room ID:", roomId);
    
    // Check if roomId is valid ObjectId format
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      return res.status(400).json({
        type: "error",
        message: "Invalid roomId format",
      });
    }

    const objectRoomId = mongoose.Types.ObjectId.createFromHexString(roomId);
    console.log("MongoDB ObjectId used:", objectRoomId);

    // Use consistent ObjectId for room lookup
    const room = await Room.findById(objectRoomId);
    
    if (!room) {
      return res.status(404).json({
        type: "error",
        message: "Room not found",
      });
    }

    console.log("Room found:", { id: room._id, isGroup: room.isGroup });

    let messages = [];

    if (room.isGroup) {
      console.log('Fetching group messages...');
      
      // Add debugging to see what's in the database
      const messageCount = await Message.countDocuments({ roomId: objectRoomId });
      console.log(`Total messages in room ${roomId}:`, messageCount);
      
      // Also check with string roomId in case that's how they're stored
      const messageCountStr = await Message.countDocuments({ roomId: roomId });
      console.log(`Total messages with string roomId:`, messageCountStr);

      

      messages = await Message.find({ roomId: objectRoomId , deletedForAll: { $ne: true } , deletedForSome: { $ne: userObjectId }}, {})
        .sort({ createdAt: 1 })
        .populate('sender', 'name emailid _id'); // Add populate for group messages too

      console.log(`Fetched ${messages.length} group messages`);

    } else {
      console.log('Fetching direct messages...');
       messages = await Message.find({ roomId: objectRoomId , deletedForAll: { $ne: true } , deletedForSome: { $ne: userObjectId }}, {})
        .sort({ createdAt: 1 })
        .populate('sender', 'name emailid _id')
        .populate('receiver', 'name emailid _id')
        .exec();
    }

    if (messages.length === 0) {
      return res.json({
        type: "info", // Changed from "error" since no messages isn't necessarily an error
        message: "No messages found for this room",
        messages: [],
      });
    }

    res.status(200).json({
      type: "success",
      message: "Messages fetched successfully",
      messages,
    });

  } catch (error) {
    console.error("Error in getMessages:", error);
    next(error);
  }
};




export const deleteMessage = async (req, res, next) => {
  try {
    
    const messageId = req?.params?.id;

    const {deleteType} = req.query;

    if(!messageId) {
      return res.json({message: "no id received" , type: 'error'});
    }

    // fetch message from db
    // if delete type === 'me' then add user's ref to the deletedFor array
    // if delete type === 'everyone' then add refs to all the members into the deletedFor array


  } catch (error) {
        console.error("Error in getMessages:", error);
        next(error);
  }
}