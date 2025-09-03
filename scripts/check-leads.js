const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

async function checkLeads() {
  try {
    console.log('Connecting to database...');
    await prisma.$connect();
    
    console.log('\nFetching latest leads...');
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    console.log(`\nFound ${leads.length} leads in the database:`);
    console.log('----------------------------------------');
    leads.forEach((lead, index) => {
      console.log(`\nLead #${index + 1}:`);
      console.log('----------------------------------------');
      console.log(`ID: ${lead.id}`);
      console.log(`Name: ${lead.name}`);
      console.log(`Email: ${lead.email}`);
      console.log(`Phone: ${lead.phone || 'N/A'}`);
      console.log(`Role: ${lead.role || 'N/A'}`);
      console.log(`Experience: ${lead.experience || 'N/A'}`);
      console.log(`Status: ${lead.status}`);
      console.log(`Created: ${lead.createdAt}`);
      console.log('----------------------------------------');
    });
    
  } catch (error) {
    console.error('Error checking leads:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLeads();
