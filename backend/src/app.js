const express = require('express');
const helmet = require('helmet');
// CORS is removed
require('dotenv').config();

const app = express();

// Security & Middleware
app.use(helmet()); 
app.use(express.json());

// Placeholder Route
// We prefix with /api so the proxy knows what to forward
app.get('/api/helloworld', (req, res) => res.send('Hello World!'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));