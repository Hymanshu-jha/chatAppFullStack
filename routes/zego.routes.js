import express from 'express';
import { getZegoToken } from '../controllers/zego.controllers.js';
import authorized from '../middlewares/authorized.middlewares.js';

export const zegoRouter = express.Router();


zegoRouter.post('/getZegoToken',  authorized, getZegoToken);