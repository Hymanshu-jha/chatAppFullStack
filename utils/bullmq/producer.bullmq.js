import { Queue } from 'bullmq';
import IORedis from 'ioredis';


// -----------------------------
// BULLMQ CONNECTION FIXED HERE
// -----------------------------
const connection = new IORedis(
  'rediss://default:94KbuOGipWXT3vYOsmVFEaNOBEEjXzv3@redis-16766.c90.us-east-1-3.ec2.redns.redis-cloud.com:16766',
  {
    tls: {
      rejectUnauthorized: false
    }
  }
);




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
