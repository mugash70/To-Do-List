// const { Pool } = require('pg');
// const fs = require('fs');
// require("dotenv").config();


// const proConfig = {
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: true,
//     ca: fs.readFileSync(process.env.PG_SSL_CA).toString(),
//   },
// };
// const pool =new Pool(proConfig);
// module.exports = pool;


const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const dbPath = path.resolve(__dirname, "temp.sqlite");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {console.error("Failed to connect to the SQLite database:", err.message);}
});
module.exports = db;

