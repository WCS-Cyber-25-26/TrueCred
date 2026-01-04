const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger-ui/swagger");
const authRoutes = require('./routes/auth.route');
const studentRoutes = require('./routes/student.route');

const express = require('express');
require('dotenv').config();

const app = express();
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/api/helloworld', (req, res) => res.send('Hello World!'));

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));