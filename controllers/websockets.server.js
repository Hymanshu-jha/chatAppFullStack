import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import url from 'url';
import cookie from 'cookie'; // ✅ import this
import cookieParser from 'cookie-parser';
import { handleMessage } from './websockets.handlers.js';

import dotenv from 'dotenv';
dotenv.config(); // load .env variables

const jwt_secret_key = process.env.JWT_SECRET_KEY;

export const app = express();
export const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// userId -> WebSocket
export const onlineUsers = new Map();

export const socketConnect = () => {
  try {
    wss.on('connection', async (ws, req) => {
      let token = null;

      // ✅ Extract token from cookies
      const cookies = cookie.parse(req.headers.cookie || '');
      token = cookies.token;


      if (!token) {
        console.log('❌ Token not found');
        ws.close(1008, 'Unauthorized: No token');
        return;
      }

      try {
        const decoded = jwt.verify(token, jwt_secret_key);
        ws.user = decoded;
        console.log(`✅ ${ws.user.emailid} connected`);
      } catch (err) {
        console.log('❌ Invalid token:', err.message);
        ws.close(1008, 'Unauthorized: Invalid token');
        return;
      }

      // Store user in memory
      onlineUsers.set(ws.user._id.toString(), ws);

      ws.on('message', async (data) => {
        let msg;
        try {
          msg = JSON.parse(data);
          console.log(`📩 Message from ${ws.user.emailid}:`, msg);
        } catch (err) {
          return ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid JSON',
          }));
        }
        await handleMessage(ws, msg);
      });

      ws.on('close', () => {
        const email = ws.user?.emailid;
        onlineUsers.delete(ws.user._id.toString());
        if (email) console.log(`❌ ${email} disconnected`);
      });
    });
  } catch (error) {
    console.log('WebSocket error:', error.message);
  }
};
