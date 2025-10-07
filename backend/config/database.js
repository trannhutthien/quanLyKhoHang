const sql = require('mssql');
require('dotenv').config();

const config = {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_TRUST_CERTIFICATE === 'true',
        enableArithAbort: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

// Nếu dùng Windows Authentication
if (process.env.DB_TRUSTED_CONNECTION === 'true') {
    config.options.trustedConnection = true;
} else {
    config.user = process.env.DB_USER;
    config.password = process.env.DB_PASSWORD;
}

let pool;

async function getConnection() {
    if (!pool) {
        pool = await sql.connect(config);
        console.log('✅ Connected to SQL Server:', config.database);
    }
    return pool;
}

module.exports = { getConnection, sql };