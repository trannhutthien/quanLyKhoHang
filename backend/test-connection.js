// Script test kết nối SQL Server đơn giản
require('dotenv').config();
const sql = require('mssql');

console.log('🔍 Testing SQL Server connection...');
console.log('Server:', process.env.DB_SERVER);
console.log('Database:', process.env.DB_DATABASE);
console.log('Trusted Connection:', process.env.DB_TRUSTED_CONNECTION);
console.log('Encrypt:', process.env.DB_ENCRYPT);
console.log('Trust Certificate:', process.env.DB_TRUST_CERTIFICATE);
console.log('---');

const config = {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_TRUST_CERTIFICATE === 'true',
        enableArithAbort: true,
        instanceName: 'SQLNHUTTHIEN'
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

// Windows Authentication
if (process.env.DB_TRUSTED_CONNECTION === 'true') {
    config.options.trustedConnection = true;
    console.log('✅ Using Windows Authentication');
} else {
    config.user = process.env.DB_USER;
    config.password = process.env.DB_PASSWORD;
    console.log('✅ Using SQL Server Authentication');
}

console.log('\n🔄 Connecting...\n');

sql.connect(config)
    .then(pool => {
        console.log('✅ SUCCESS! Connected to SQL Server');
        console.log('Database:', pool.config.database);
        console.log('Server:', pool.config.server);
        
        // Test query
        return pool.request().query('SELECT @@VERSION AS Version, DB_NAME() AS CurrentDB');
    })
    .then(result => {
        console.log('\n📊 SQL Server Info:');
        console.log(result.recordset[0]);
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Connection FAILED!');
        console.error('Error:', err.message);
        console.error('\n💡 Possible solutions:');
        console.error('1. Check SQL Server Browser service is running');
        console.error('2. Enable TCP/IP in SQL Server Configuration Manager');
        console.error('3. Restart SQL Server service after enabling TCP/IP');
        console.error('4. Check Windows Firewall (port 1433 or dynamic port)');
        process.exit(1);
    });
