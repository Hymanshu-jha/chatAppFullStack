import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomName: {
    type: String,
    trim: true,
    default: null,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  isGroup: {
    type: Boolean,
    default: false,
  },
  // Hash for all room types to make querying and uniqueness easier
  // No index here - we use explicit indexes below for better control
  membersHash: {
    type: String,
  },
  groupAdmin: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }]
}, { 
  timestamps: true
});

// Pre-save middleware to sort members and create hash
roomSchema.pre('save', function(next) {
  // Sort members consistently for all room types
  this.members.sort((a, b) => a.toString().localeCompare(b.toString()));
  
  // Create a hash for all rooms (both direct messages and groups)
  this.membersHash = this.members.map(m => m.toString()).join('|');
  
  // Validation: Direct messages must have exactly 2 members
  if (!this.isGroup && this.members.length !== 2) {
    return next(new Error('Direct message rooms must have exactly 2 members'));
  }
  
  // Validation: Groups must have at least 2 members (can be 2+ for groups)
  if (this.isGroup && this.members.length < 2) {
    return next(new Error('Group rooms must have at least 2 members'));
  }
  
  // Validation: Group rooms should have a name
  if (this.isGroup && !this.roomName) {
    return next(new Error('Group rooms must have a name'));
  }
  
  next();
});

// Unique constraint for direct messages only (exactly 2 members)
roomSchema.index(
  { membersHash: 1 },
  { 
    unique: true, 
    partialFilterExpression: { 
      isGroup: false
    }
  }
);

// For groups, we might want to allow duplicate member combinations 
// (same people can create multiple group chats), but if you want uniqueness:
// Uncomment the following index if you want groups with same members to be unique
/*
roomSchema.index(
  { membersHash: 1 },
  { 
    unique: true, 
    partialFilterExpression: { 
      isGroup: true
    }
  }
);
*/

// Compound indexes for better query performance
roomSchema.index({ isGroup: 1, membersHash: 1 });
roomSchema.index({ members: 1 }); // For finding rooms by member
roomSchema.index({ groupAdmin: 1 }); // For finding rooms by admin

// Instance method to check if user is admin
roomSchema.methods.isAdmin = function(userId) {
  return this.groupAdmin.some(adminId => adminId.toString() === userId.toString());
};

// Instance method to check if user is member
roomSchema.methods.isMember = function(userId) {
  return this.members.some(memberId => memberId.toString() === userId.toString());
};

// Static method to find or create direct message room
roomSchema.statics.findOrCreateDirectMessage = async function(user1Id, user2Id) {
  // Sort member IDs lexicographically
  const sortedMemberIds = [user1Id.toString(), user2Id.toString()].sort();
  const membersObjIds = sortedMemberIds.map(id => new mongoose.Types.ObjectId(id));
  const membersHash = sortedMemberIds.join('|');
  
  // Try to find existing direct message room
  let room = await this.findOne({
    isGroup: false,
    membersHash: membersHash
  }).populate('members', 'username email');
  
  // Create new room if doesn't exist
  if (!room) {
    room = new this({
      members: membersObjIds,
      isGroup: false,
      membersHash: membersHash
    });
    await room.save();
    await room.populate('members', 'username email');
  }
  
  return room;
};

// Static method to create group room
roomSchema.statics.createGroup = async function(roomName, memberIds, adminIds = []) {
  // Ensure all member IDs are strings for consistent sorting
  const memberIdStrings = memberIds.map(id => id.toString());
  const sortedMemberIds = [...new Set(memberIdStrings)].sort(); // Remove duplicates and sort
  const membersObjIds = sortedMemberIds.map(id => new mongoose.Types.ObjectId(id));
  const membersHash = sortedMemberIds.join('|');
  
  // Validate admin IDs are subset of member IDs
  const adminIdStrings = adminIds.map(id => id.toString());
  for (const adminId of adminIdStrings) {
    if (!sortedMemberIds.includes(adminId)) {
      throw new Error('Admin must be a member of the group');
    }
  }
  
  const room = new this({
    roomName,
    members: membersObjIds,
    isGroup: true,
    membersHash: membersHash,
    groupAdmin: adminIds.map(id => new mongoose.Types.ObjectId(id))
  });
  
  await room.save();
  return room;
};

const Room = mongoose.model('Room', roomSchema);
export default Room;