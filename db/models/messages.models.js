import mongoose from 'mongoose';




const { Schema, Types } = mongoose;

const messageSchema = new Schema({
  sender: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiver: [{
    type: Types.ObjectId,
    ref: 'User',
    // optional: can be null for group chats
  }],
  roomId: {
    type: Types.ObjectId,
    ref: 'Room',
    default: null,  // null for direct messages, ObjectId for group chats
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  read: {
    type: Boolean,
    default: false,
  },

  messageType: {
    type: String,
    enum: ['message' , 'notification'],
    trim: true,
    default: 'message'
  },

  messageFormat: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text',
  },

  deletedForSome: [{
    type: Types.ObjectId,
    ref: 'User'
  }],

  deletedForAll: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,  // adds createdAt and updatedAt automatically
});

const Message = mongoose.model('Message', messageSchema);
export default Message;
