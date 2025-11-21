require('dotenv').config();

console.log('POSTGRES_URL:', process.env.POSTGRES_URL);
console.log('POSTGRES_PRISMA_URL:', process.env.POSTGRES_PRISMA_URL);
console.log('All env vars with POSTGRES:', Object.keys(process.env).filter(key => key.includes('POSTGRES')));