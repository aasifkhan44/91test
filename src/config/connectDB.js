const mysql = require('mysql2/promise');
require('dotenv').config();

const connection = mysql.createPool({
    host: process.env.DATABASE_HOST || 'localhost',
    user: process.env.DATABASE_USER || 'cluu',
    password: process.env.DATABASE_PASSWORD || 'cluu',
    database: process.env.DATABASE_NAME || 'cluu',
});

export default connection;