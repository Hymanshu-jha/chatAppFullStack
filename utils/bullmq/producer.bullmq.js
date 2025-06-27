import { Queue } from 'bullmq';
import IORedis from 'ioredis';

// Shared Redis connection
const connection = new IORedis();

const emailQueue = new Queue('verifyEmail', { connection });

// Exported function to dynamically add jobs
export async function addVerificationEmailJob({ to, token, username }) {
  if (!to || !token || !username) {
    throw new Error('Missing required parameters');
  }

  await emailQueue.add('verifyEmail', { to, token, username });
  console.log(`Verification email job added for ${to}`);
}


export default addVerificationEmailJob;