import express from 'express';

import authorized from '../middlewares/authorized.middlewares.js';
import { getRooms , getMessages } from '../controllers/chats.controllers.js';

const chatRouter = express.Router();

chatRouter.get('/rooms', authorized , getRooms);
chatRouter.get('/messages/:roomId', authorized , getMessages);

export default chatRouter;