import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Set the DATABASE_URL environment variable for Prisma
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in .env.local');
}

console.log('Running database migration...');
console.log(`Database: ${process.env.DATABASE_URL.split('@')[1]?.split('?')[0]}`);

try {
  // Reset and run Prisma migration
  console.log('Resetting database schema...');
  execSync('npx prisma migrate reset --force', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      FORCE_COLOR: '1',
    },
  });
  
  console.log('Running migrations...');
  execSync('npx prisma migrate dev --name init', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      // Ensure Prisma uses the loaded environment variables
      FORCE_COLOR: '1',
    },
  });
  
  console.log('Migration completed successfully!');
} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
}
