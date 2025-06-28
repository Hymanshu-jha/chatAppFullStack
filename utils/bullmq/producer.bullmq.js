import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { createClient } from 'redis';

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
// TEST REDIS WITH createClient
// -----------------------------
const client = createClient({
    username: 'default',
    password: '94KbuOGipWXT3vYOsmVFEaNOBEEjXzv3',
    socket: {
        host: 'redis-16766.c90.us-east-1-3.ec2.redns.redis-cloud.com',
        port: 16766
    }
});


client.on('error', (err) => console.log('Redis Client Error', err));

await client.connect();

await client.set('foo', 'bar');
const result = await client.get('foo');
console.log(result); // bar

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
