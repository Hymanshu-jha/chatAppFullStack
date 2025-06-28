import { Queue } from 'bullmq';
import IORedis from 'ioredis';


// -----------------------------
// BULLMQ CONNECTION FIXED HERE
// -----------------------------
const connection = new IORedis({
  host: 'redis-16766.c90.us-east-1-3.ec2.redns.redis-cloud.com',
  port: 16766,
  username: 'default',
  password: '94KbuOGipWXT3vYOsmVFEaNOBEEjXzv3',
  tls: {}, // required for Redis Cloud
});



// -----------------------------
// BULLMQ QUEUE SETUP
// -----------------------------
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
