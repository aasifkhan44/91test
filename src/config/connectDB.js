const mysql = require('mysql2/promise');

const connection = mysql.createPool({
    host: 'localhost',
    user: 'new_db_am',
    password: 'new_db_am',
    database: 'new_db_am',
});

export default connection;