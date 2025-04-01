import * as dotenv from 'dotenv';
dotenv.config();
import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

async function runSql() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  const sql = fs.readFileSync(path.join(__dirname, './init-db.sql')).toString();

  try {
    await client.connect();
    await client.query(sql);
    console.log('SQL script executed successfully');
  } catch (error) {
    console.error('Error executing SQL script:', error);
  } finally {
    await client.end();
  }
}

runSql();
