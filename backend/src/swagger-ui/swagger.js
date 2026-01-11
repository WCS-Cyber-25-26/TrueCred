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
        SessionAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "SessionToken",
          description: "Paste the session token only (no 'Bearer ' needed)",
        },
      },
    },
    security: [
      {
        SessionAuth: [],
      },
    ],
    paths: swaggerDefinitions.paths,
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
