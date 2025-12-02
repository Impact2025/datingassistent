const { sql } = require('@vercel/postgres'); async function check() { const r = await sql\; r.rows.forEach(row => console.log(JSON.stringify(row))); } check();
