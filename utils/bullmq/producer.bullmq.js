import { Queue } from 'bullmq';
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_TOKEN = process.env.REDIS_TOKEN;

const connection = new Redis(`rediss://default:${REDIS_TOKEN}@tender-chipmunk-14111.upstash.io:6379`);

const emailQueue = new Queue('verifyEmail', { connection });

export async function addVerificationEmailJob({ to, token, username }) {
  if (!to || !token || !username) {
    throw new Error('Missing required parameters');
  }

  await emailQueue.add('verifyEmail', { to, token, username });
  console.log(`Verification email job added for ${to}`);
}

export default addVerificationEmailJob;
