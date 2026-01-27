import swaggerJsdoc from "swagger-jsdoc";
import swaggerDefinitions from "./swaggerDefinition.js";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TrueCred API",
      version: "1.0.0",
      description: "API documentation",
    },
    servers: [
      {
        url: "http://localhost:8080/api",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Paste JWT here (only for testing, actual app uses HTTP-only cookie)."
        }
      }
    },
    security: [
      { BearerAuth: [] }
    ],
    paths: swaggerDefinitions.paths,
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
