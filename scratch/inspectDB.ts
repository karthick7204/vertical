import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function inspect() {
  if (!MONGODB_URI) {
    console.error('No MONGODB_URI found in env');
    return;
  }
  console.log('Connecting to:', MONGODB_URI);
  try {
    await mongoose.connect(MONGODB_URI, { family: 4 });
    console.log('Connected!');

    const db = mongoose.connection.db;
    if (!db) {
      console.error('No database connection object');
      return;
    }

    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));

    // Get count of users and organizations
    const usersCount = await db.collection('users').countDocuments();
    const orgsCount = await db.collection('organizations').countDocuments();
    console.log(`Users count: ${usersCount}`);
    console.log(`Organizations count: ${orgsCount}`);

    // Print first 5 users
    const users = await db.collection('users').find({}).limit(5).toArray();
    console.log('Users:', JSON.stringify(users, null, 2));

    // Print first 5 organizations
    const orgs = await db.collection('organizations').find({}).limit(5).toArray();
    console.log('Organizations:', JSON.stringify(orgs, null, 2));

  } catch (error) {
    console.error('Error during inspection:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

inspect();
