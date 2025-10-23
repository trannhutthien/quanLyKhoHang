require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { getConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/healthz', (req, res) => {
    res.json({ status: 'ok', database: 'QuanLyKho_JSON' });
});

// Routes
app.use('/warehouses', require('./routes/warehouses'));
app.use('/items', require('./routes/items'));
app.use('/auth', require('./routes/auth'));
app.use('/receipts', require('./routes/receipts'));

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    res.status(500).json({ 
        error: err.message,
        code: err.code 
    });
});

// Start server
getConnection()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📊 Database: ${process.env.DB_DATABASE}`);
        });
    })
    .catch(err => {
        console.error('❌ Failed to connect to database:', err.message);
        process.exit(1);
    });