import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger-ui/swagger.js";
import authRoutes from './routes/auth.route.js';
import studentRoutes from './routes/student.route.js';

import express from 'express';
import 'dotenv/config';

const app = express();
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/api/helloworld', (req, res) => res.send('Hello World!'));

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));