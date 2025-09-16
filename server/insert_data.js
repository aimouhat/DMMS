import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a new database connection
const db = new sqlite3.Database(join(__dirname, 'daily_meeting.db'), (err) => {
  if (err) {
    console.error('Error opening database:', err);
    return;
  }
  console.log('Connected to the database.');
});

try {
  // Read and execute the SQL file
  const sql = readFileSync(join(__dirname, 'insert_data.sql'), 'utf8');
  
  db.exec(sql, (err) => {
    if (err) {
      console.error('Error executing SQL:', err);
    } else {
      console.log('Data inserted successfully!');
    }
    
    // Close the database connection
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('Database connection closed.');
      }
    });
  });
} catch (error) {
  console.error('Error reading SQL file:', error);
  db.close();
} 