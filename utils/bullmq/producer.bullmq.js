import { Queue } from 'bullmq';
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_TOKEN = process.env.REDIS_TOKEN;
console.log('connection initiated in bullmq producer');
const connection = new Redis(`rediss://default:${REDIS_TOKEN}@tender-chipmunk-14111.upstash.io:6379`);
console.log('connected to cloud redis from upstash');
const emailQueue = new Queue('verifyEmail', { connection });


export async function addVerificationEmailJob({ to, token, username }) {
  if (!to || !token || !username) {
    throw new Error('Missing required parameters');
  }

  console.log('add queue invoked');

  const qAddResponse = await emailQueue.add('verifyEmail', { to, token, username });
  if(!qAddResponse) {
    console.log('could not add to the queue');
  } else{
    console.log(`Verification email job added for ${to}`);
  }
}

export default addVerificationEmailJob;
