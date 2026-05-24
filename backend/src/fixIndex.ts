import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function fix() {
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

    const collection = db.collection('organizations');
    
    // List indexes
    const indexes = await collection.indexes();
    console.log('Current indexes on organizations:', indexes);

    // Check if domain_1 exists
    const hasDomainIndex = indexes.some(idx => idx.name === 'domain_1');
    if (hasDomainIndex) {
      console.log('Dropping index domain_1...');
      await collection.dropIndex('domain_1');
      console.log('Index domain_1 dropped successfully!');
    } else {
      console.log('No domain_1 index found.');
    }

    // List indexes again to verify
    const newIndexes = await collection.indexes();
    console.log('New indexes on organizations:', newIndexes);

  } catch (error) {
    console.error('Error during index drop:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

fix();
