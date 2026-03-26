import { createClient } from '@insforge/sdk';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const url = process.env.VITE_INSFORGE_URL;
const key = process.env.VITE_INSFORGE_ANON_KEY;

if (!url || !key) {
  console.error('Credentials missing');
  process.exit(1);
}

const client = createClient({ baseUrl: url, anonKey: key });

async function checkId() {
  const id = 'cff87c26-c0d1-4438-8246-2e94072f674f';
  console.log(`Checking for ID: ${id}`);

  const { data, error } = await client.database
    .from('analyses')
    .select('*')
    .eq('id', id);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Result:', JSON.stringify(data, null, 2));
  }
}

checkId();
