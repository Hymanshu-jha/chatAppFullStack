import { generateToken04 } from '../utils/zego/zegoTokenGenerator.js';
import dotenv from 'dotenv';

dotenv.config();

const appID = Number(process.env.ZEGO_APP_ID);
const serverSecret = process.env.ZEGO_SERVER_SECRET;

export const getZegoToken = (req, res) => {
  try {
    

    const { roomID, userID } = req.body;

    console.log('getZegoToken invoked', userID , roomID);

    if (!roomID || !userID) {
      return res.status(400).json({ error: 'Missing roomID or userID' });
    }

const token = generateToken04(appID, userID, serverSecret, 3600, JSON.stringify({
  room_id: roomID,
}));


    return res.status(200).json({ token });
  } catch (error) {
    console.error(
      'Error while generating ZEGOCLOUD token from backend:',
      error.message
    );
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
