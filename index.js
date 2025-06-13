import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';


import connectDB from './db/connection/dbConnection.js';
import errorHandler from './middlewares/errorHandler.middlewares.js';
import userRouter from './routes/users.routes.js';
import { socketConnect } from './controllers/websockets.server.js';
import { app , server } from './controllers/websockets.server.js';
import chatRouter from './routes/chats.routes.js';

import dotenv from 'dotenv';
dotenv.config(); // load .env variables


const PORT = 8080;
 // ✅ Use .env in production

// Replace this with your Vercel frontend URL
const allowedOrigins = [
  "https://chat-app-rho-ashy.vercel.app", // ✅ No trailing slash
  "http://localhost:5173"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));


app.use(express.json());
app.use(cookieParser());


app.use('/api/v1/user', userRouter);
app.use('/api/v1/chat', chatRouter);
app.use(errorHandler);

// Connect to DB
const dbConnect = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.log('❌ Error while connecting to DB:', error);
  }
};


dbConnect();
socketConnect();


// Routes
app.get('/', (req, res) => {
  res.send('Hello from the home route!');
});

// Start Server
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
