import { Worker } from 'bullmq';
import Redis from 'ioredis';
import sendVerificationMail from './utils/nodemailer/transporter.nodemailer.js';

import dotenv from 'dotenv';
dotenv.config();


const REDIS_TOKEN = process.env.REDIS_TOKEN;
const connection = new Redis(`rediss://default:${REDIS_TOKEN}@tender-chipmunk-14111.upstash.io:6379`, {
  maxRetriesPerRequest: null
});

const worker = new Worker(
  'verifyEmail',
  async job => {
    try {
      const { to, token, username } = job.data;
      await sendVerificationMail({ to, token, username });
      console.log('verification mail sent from worker');
    } catch (err) {
      console.error('Worker error:', err);
      throw err;
    }
  },
  { connection }
);


worker.on('completed', job => {
  console.log(`${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
  console.error(`${job.id} failed: ${err.message}`);
});

