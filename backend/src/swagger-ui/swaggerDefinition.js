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
      "post": {
        "summary": "Register a university",
        "tags": ["Auth"],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "email": { "type": "string", "example": "test3@western.ca" },
                  "password": { "type": "string", "example": "TestPassword123" }
                },
                "required": ["email", "password"],
                "description": "The university will be registered. The role is automatically set to 'UNIVERSITY'."
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "University registered successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": { "type": "string", "example": "University registered successfully" },
                    "userId": { "type": "string", "example": "uuid-of-user" }
                  }
                }
              }
            }
          },
          "400": { "description": "Bad request / validation error" }
        }
      }
    },
    "/auth/login": {
      "post": {
        "summary": "Login a university",
        "tags": ["Auth"],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "email": { "type": "string", "example": "test@western.ca" },
                  "password": { "type": "string", "example": "StrongPassword123" }
                },
                "required": ["email", "password"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Login successful and session token created",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": { "type": "string", "example": "Login successful" },
                    "sessionToken": { "type": "string", "example": "a1b2c3d4e5f6g7h8i9j0" }
                  }
                }
              }
            }
          },
          "400": { "description": "Invalid credentials or login failed" }
        }
      }
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
                    student: { type: "object" },
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

export default swaggerDefinitions;
