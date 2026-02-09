require('dotenv').config();
const mysql = require('mysql');
const { URL } = require('url');

const databaseUrl = new URL(process.env.DATABASE_URL);

const db = mysql.createConnection({
    host: databaseUrl.hostname,
    user: databaseUrl.username,
    password: databaseUrl.password,
    database: databaseUrl.pathname.replace('/', ''),
    port: databaseUrl.port || 3306,
});

db.connect((err) => {
    if (err) {
        console.error('❌ Erreur de connexion à MySQL ', err);
        return;
    }
    console.log('✅ Connected to MySQL successfully');
});

module.exports = db;
