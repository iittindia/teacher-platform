const { execSync } = require('child_process');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Set the DATABASE_URL environment variable for Prisma
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in .env.local');
}

console.log('Pushing database schema...');
console.log(`Database: ${process.env.DATABASE_URL.split('@')[1]?.split('?')[0]}`);

try {
  // Push schema to database
  console.log('Pushing schema to database...');
  execSync('npx prisma db push --accept-data-loss', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      FORCE_COLOR: '1',
    },
  });
  
  console.log('Schema pushed successfully!');
} catch (error) {
  console.error('Failed to push schema:', error);
  process.exit(1);
}
