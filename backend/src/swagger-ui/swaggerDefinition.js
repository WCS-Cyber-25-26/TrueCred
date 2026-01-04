const swaggerDefinitions = {
  paths: {
    "/helloworld": {
      get: {
        summary: "Returns Hello World",
        tags: ["Test"],
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Hello World!" },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/auth/register": {
      post: {
        summary: "Register a university",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Western University" },
                  email: { type: "string", example: "test@western.ca" },
                  password: { type: "string", example: "StrongPassword123" },
                },
                required: ["name", "email", "password"],
              },
            },
          },
        },
        responses: {
          201: {
            description: "University registered successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "University registered" },
                    userId: { type: "integer", example: 1 },
                  },
                },
              },
            },
          },
          400: { description: "Bad request / validation error" },
        },
      },
    },

    "/auth/login": {
      post: {
        summary: "Login a university",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", example: "test@western.ca" },
                  password: { type: "string", example: "StrongPassword123" },
                },
                required: ["email", "password"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Login successful" },
                    token: { type: "string", example: "jwt.token.here" },
                  },
                },
              },
            },
          },
          400: { description: "Invalid credentials" },
        },
      },
    },

    "/students": {
      post: {
        summary: "Add a new student",
        tags: ["Student"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "John Doe" },
                  studentId: { type: "string", example: "123456" },
                },
                required: ["name", "studentId"],
              },
            },
          },
        },
        responses: {
          201: {
            description: "Student added successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Student added" },
                    student: { type: "object" }, // You can expand this later
                  },
                },
              },
            },
          },
          400: { description: "Bad request" },
        },
      },
    },

    "/students/{id}": {
      get: {
        summary: "Get student by ID",
        tags: ["Student"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer", example: 1 },
            description: "ID of the student to retrieve",
          },
        ],
        responses: {
          200: {
            description: "Student retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Student retrieval successful" },
                  },
                },
              },
            },
          },
          404: { description: "Student not found" },
        },
      },
    },
  },
};

module.exports = swaggerDefinitions;
