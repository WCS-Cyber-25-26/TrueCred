const swaggerJsdoc = require("swagger-jsdoc");
const swaggerDefinitions = require("./swaggerDefinition");

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
        url: "http://localhost:8080",
      },
    ],
    components: {
      securitySchemes: {
        SessionAuth: {
          type: "apiKey",
          in: "header",
          name: "X-Session-Token",
          description: "Session token returned after login",
        },
      },
    },
    paths: swaggerDefinitions.paths,
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
