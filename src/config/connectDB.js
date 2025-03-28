const mysql = require('mysql2/promise');

const connection = mysql.createPool({
    host: 'localhost',
    user: 'cluu',
    password: 'cluu',
    database: 'cluu',
});

export default connection;