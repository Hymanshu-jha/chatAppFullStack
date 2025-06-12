import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  emailid: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  rooms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    default: []
  }],
  websocketid: {
    type: String,
    default: null,
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
