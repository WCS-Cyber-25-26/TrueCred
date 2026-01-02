const express = require('express');
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
require('dotenv').config();

const app = express();

app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


/**
 * @swagger
 * /api/helloworld:
 *   get:
 *     summary: Returns a hello world message
 *     tags:
 *       - Test
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hello World!
 */

app.get('/api/helloworld', (req, res) => res.send('Hello World!'));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
