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

let pool;
let connectionString;

// Hỗ trợ cả Windows Authentication và SQL Authentication
if (process.env.DB_TRUSTED_CONNECTION === 'true') {
    // Windows Authentication với msnodesqlv8
    connectionString = `Driver={SQL Server Native Client 11.0};Server=${process.env.DB_SERVER};Database=${process.env.DB_DATABASE};Trusted_Connection=yes;`;
    console.log('🔐 Using Windows Authentication');
    console.log('   Server:', process.env.DB_SERVER);
    console.log('   Database:', process.env.DB_DATABASE);
} else if (process.env.DB_USER && process.env.DB_PASSWORD) {
    // SQL Server Authentication
    config.user = process.env.DB_USER;
    config.password = process.env.DB_PASSWORD;
    console.log('🔐 Using SQL Server Authentication');
    console.log('   User:', process.env.DB_USER);
    console.log('   Server:', process.env.DB_SERVER);
} else {
    throw new Error('❌ Either set DB_TRUSTED_CONNECTION=true or provide DB_USER and DB_PASSWORD');
}

async function getConnection() {
    if (!pool) {
        if (connectionString) {
            // Windows Authentication
            pool = await sql.connect(connectionString);
        } else {
            // SQL Authentication
            pool = await sql.connect(config);
        }
        console.log('✅ Connected to SQL Server:', process.env.DB_DATABASE);
    }
    return pool;
}

module.exports = { getConnection, sql };