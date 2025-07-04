import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../db/models/users.models.js';
import multer from 'multer';

import dotenv from 'dotenv';
dotenv.config(); // load .env variables

const jwt_secret_key = process.env.JWT_SECRET_KEY;


import addVerificationEmailJob from '../utils/bullmq/producer.bullmq.js';

const upload = multer();


export const signup = async (req, res, next) => {
  try {
    const { emailid, password, name } = req.body;
    if (!emailid || !password || !name) throw new Error('Missing required fields');

    const email = emailid.toLowerCase().trim();
    const existingUser = await User.findOne({ emailid: email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      password: hashedPassword,
      emailid: email,
    });

    const verifyToken = jwt.sign(
      { _id: newUser._id, emailid: newUser.emailid, name: newUser.name },
      jwt_secret_key,
      { expiresIn: '1h' }
    );

    await addVerificationEmailJob({ to: emailid, token: verifyToken, username: name });

    console.log(`verification email added to the bullmq from signup controller`);

    return res.status(201).json({ 
      message: 'Signup successful. Please check your email to verify your account.' 
    });

  } catch (error) {
    console.log('Signup error:', error.message);
    if (error.code === 11000) {
      return res.status(409).json({ message: 'User already exists with this email (dup)' });
    }
    next(error);
  }
};





export const signin = async (req, res, next) => {
  try {
    const { emailid, password } = req.body;
    if (!emailid || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const email = emailid.toLowerCase().trim();
    const user = await User.findOne({ emailid: email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isVerified = user.isVerified;

    if(!isVerified) {
      console.log('email not verified yet...');
      return res.status(401).json({ error: 'emailid is not verified' });
    }

    // FIX: Make JWT payload consistent - use both _id and userId for compatibility
    const token = jwt.sign(
      { 
        _id: user._id, 
        userId: user._id,  // Add userId for WebSocket compatibility
        emailid: user.emailid,
        name: user.name    // Add name to token payload
      },
      jwt_secret_key,
      { expiresIn: '1d' }
    );

res.cookie('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',  // ✅ secure only in production
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 24 * 60 * 60 * 1000,
});


    return res.status(200).json({
      message: 'Signin successful',
      token,
      user: {
        emailid: user.emailid,
        name: user.name,
        _id: user._id,
        userId: user._id  // Include both for consistency
      }
    });
  } catch (error) {
    console.error('Signin error:', error.message);
    next(error);
  }
};





export const logout = (req, res, next) => {
  try {
res.clearCookie('token', {
  httpOnly: true,
  sameSite: 'none',
  secure: process.env.NODE_ENV === 'production',
});

    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(401).json({ loggedIn: false , message: error.message });
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ loggedIn: false });

    const decoded = jwt.verify(token, jwt_secret_key);

    // FIX: Fetch full user data to ensure we have complete user object
    const userFull = await User.findById(decoded._id);
    
    if (!userFull) {
      return res.status(401).json({ loggedIn: false, message: 'User not found' });
    }

    return res.status(200).json({
      loggedIn: true,
      token,
      message: "Log in persists after refresh...",
      user: {
        _id: userFull._id,
        userId: userFull._id,  // Include both for consistency
        emailid: userFull.emailid,
        name: userFull.name
      },
    });
  } catch (error) {
    console.error('Refresh error:', error.message);
    res.status(401).json({ loggedIn: false, message: error.message });
    next(error);
  }
};






export const getUserList = async (req, res, next) => {
  try {
    const { name } = req.params;

    // Bad Request: Missing name parameter
    if (!name) {
      return res.status(400).json({ message: "Missing 'name' parameter in URL." });
    }

    // FIX: Add validation to ensure req.user exists
    if (!req.user || !req.user.emailid) {
      return res.status(401).json({ message: "User not authenticated." });
    }

    // Fetch users matching the name
    const userList = await User.find(
     { name, emailid: { $ne: req.user.emailid } },
     { password: 0 }  // Exclude password field for security
    );

    userList.forEach((x) => {
      console.log("userId: ", x._id);
    });

    // Not Found: No users with the given name
    if (userList.length === 0) {
      return res.status(404).json({ message: "No users found with this name." });
    }

    // OK: Users found
    return res.status(200).json({
      message: "Successfully fetched users.",
      userList
    });

  } catch (error) {
    console.error("Error in getUserList:", error.message);
    res.status(500).json({ message: "Internal Server Error." });
    next(error);
  }
};



export const verify = async (req, res) => {
  try {
    console.log('🔍 Verify route hit');
    console.log('📝 Full request URL:', req.url);
    console.log('📝 Query params:', req.query);
    console.log('📝 Request method:', req.method);
    
    const { token } = req.query;
    console.log('🎫 Token received:', token ? 'Yes' : 'No');
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(400).json({ message: "Token is required." });
    }

    console.log('🔐 Attempting to verify JWT token...');
    const decoded = jwt.verify(token, jwt_secret_key);
    console.log('✅ JWT decoded successfully:', decoded);

    console.log('👤 Looking for user with ID:', decoded._id);
    const user = await User.findById(decoded._id);
    
    if (!user) {
      console.log('❌ User not found in database');
      return res.status(404).json({ message: "User not found." });
    }

    console.log('👤 User found:', user.emailid);
    console.log('✅ User verification status:', user.isVerified);

    if (user.isVerified) {
      console.log('ℹ️ User already verified');
      return res.status(200).json({ message: "Email already verified." });
    }

    console.log('🔄 Updating user verification status...');
    user.isVerified = true;
    await user.save();
    console.log('✅ User verification updated successfully');

    // Create new token
    const token2 = jwt.sign(
      { 
        _id: user._id, 
        userId: user._id,
        emailid: user.emailid,
        name: user.name
      },
      jwt_secret_key,
      { expiresIn: '1d' }
    );

    res.cookie('token', token2, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    }); 

    console.log('🎉 Verification completed successfully');
    return res.json({ message: `User verified successfully` });

  } catch (error) {
    console.error("❌ Error in email verification handler:", error);
    
    if (error.name === 'JsonWebTokenError') {
      console.log('🚫 Invalid JWT token');
      return res.status(400).json({ message: "Invalid token." });
    }
    
    if (error.name === 'TokenExpiredError') {
      console.log('⏰ JWT token expired');
      return res.status(400).json({ message: "Token expired." });
    }
    
    return res.status(500).json({ message: "Internal Server Error." });
  }
};