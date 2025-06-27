import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import sendVerificationMail from './utils/nodemailer/transporter.nodemailer.js';

import dotenv from 'dotenv';
dotenv.config();


const connection = new IORedis({ maxRetriesPerRequest: null });

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

