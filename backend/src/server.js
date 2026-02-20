import 'dotenv/config';

import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger-ui/swagger.js";
import authRoutes from './routes/auth.route.js';
import studentRoutes from './routes/student.route.js';
import adminRoutes from './routes/admin.route.js';
import UniversityRoutes from './routes/university.route.js';
import credentialRoutes from './routes/credential.route.js';

import express from 'express';
import cookieParser from 'cookie-parser';

const app = express();
app.use(express.json());

app.use(cookieParser());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/api/helloworld', (req, res) => res.send('Hello World!'));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/universities', UniversityRoutes);
app.use('/api/universities/credentials', credentialRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));