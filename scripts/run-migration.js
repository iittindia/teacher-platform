const { config } = require('dotenv');
const { execSync } = require('child_process');
const path = require('path');

// Load environment variables from .env.local in the project root
const envPath = path.resolve(__dirname, '../.env.local');
const result = config({ path: envPath });

if (result.error) {
  console.error('❌ Error loading .env.local:', result.error);
  process.exit(1);
}

console.log('Running database migrations...');
console.log('Using database:', process.env.DATABASE_URL ? '✅ Found' : '❌ Missing');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set in .env.local');
  process.exit(1);
}

try {
  // Generate Prisma client
  console.log('\nGenerating Prisma client...');
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    env: { ...process.env, FORCE_COLOR: '1' }
  });

  // Push schema to database
  console.log('\nPushing schema to database...');
  execSync('npx prisma db push --accept-data-loss', { 
    stdio: 'inherit',
    env: { ...process.env, FORCE_COLOR: '1' }
  });

  console.log('\n✅ Database migration completed successfully');} catch (error) {
  console.error('\n❌ Migration failed:', error.message);
  process.exit(1);
}
