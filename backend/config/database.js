const sql = require('mssql');
require('dotenv').config();

const config = {
    server: process.env.DB_SERVER,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_TRUST_CERTIFICATE === 'true',
        enableArithAbort: true,
        instanceName: process.env.DB_INSTANCE || undefined
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

// Nếu dùng Windows Authentication
if (process.env.DB_TRUSTED_CONNECTION === 'true') {
    // Dùng msnodesqlv8 driver cho Windows Authentication
    config.driver = 'msnodesqlv8';
    config.options.trustedConnection = true;
} else if (process.env.DB_USER && process.env.DB_PASSWORD) {
    // SQL Server Authentication (khuyến nghị)
    config.user = process.env.DB_USER;
    config.password = process.env.DB_PASSWORD;
    console.log('🔐 Using SQL Server Authentication');
} else {
    console.warn('⚠️ No authentication method specified, using Windows Authentication');
    config.driver = 'msnodesqlv8';
    config.options.trustedConnection = true;
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