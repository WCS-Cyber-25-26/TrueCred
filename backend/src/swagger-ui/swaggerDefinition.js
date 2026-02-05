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

    "/auth/logout": {
      post: {
        summary: "Logout the currently logged-in university",
        tags: ["Auth"],
        security: [
          { SessionAuth: [] }
        ],
        requestBody: {
          required: false,
          description: "No body required. Authorization header with session token is used."
        },
        responses: {
          200: {
            description: "Logout successful and session revoked",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Logged out successfully" },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized – session token missing, invalid, or already revoked"
          },
          500: { description: "Server error" }
        },
      },
    },

    "/students": {
      post: {
        summary: "Add a new student",
        tags: ["Student"],
        security: [
          { SessionAuth: [] }
        ],
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
          401: { description: "Unauthorized" },
        },
      },
    },

    "/students/{id}": {
      get: {
        summary: "Get student by ID",
        tags: ["Student"],
        security: [
          { SessionAuth: [] }
        ],
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
          401: { description: "Unauthorized" },
          404: { description: "Student not found" },
        },
      },
    },

    "/admin/universities": {
      get: {
        summary: "Get all universities",
        tags: ["Admin"],
        security: [{ SessionAuth: [] }],
        responses: {
          200: {
            description: "List of universities",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string", example: "uuid-of-university" },
                      name: { type: "string", example: "Western University" },
                      domain: { type: "string", example: "western.ca" },
                      domainVerified: { type: "boolean", example: true },
                      chainEnabled: { type: "boolean", example: false },
                      createdAt: { type: "string", format: "date-time", example: "2026-01-16T12:00:00Z" },
                      revocation: {
                        type: "object",
                        nullable: true,
                        properties: {
                          revokedAt: { type: "string", format: "date-time", example: "2026-01-16T15:00:00Z" },
                          reason: { type: "string", example: "Violation of policy" },
                          revokedBy: { type: "string", example: "admin-uuid" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
          403: { description: "Admin access required" },
        },
      },
    },

    "/admin/universities/{id}/revoke": {
      post: {
        summary: "Revoke a university",
        tags: ["Admin"],
        security: [{ SessionAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", example: "uuid-of-user" },
            description: "User ID of the university account to revoke (userId of the User linked to the University)",
          },
        ],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  reason: { type: "string", example: "Violation of policy" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "University revoked successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "University revoked successfully" },
                    data: {
                      type: "object",
                      properties: {
                        universityId: { type: "string", example: "uuid-of-university" },
                        revokedAt: { type: "string", format: "date-time", example: "2026-01-16T15:00:00Z" },
                        reason: { type: "string", example: "Violation of policy" },
                        revokedBy: { type: "string", example: "admin-uuid" },
                      },
                    },
                  },
                },
              },
            },
          },
          400: { description: "Bad request – body must only include reason" },
          401: { description: "Unauthorized" },
          403: { description: "Admin access required" },
          404: { description: "University not found or invalid user ID" },
          409: { description: "University already revoked" },
        },
      },
    },

    "/admin/universities/invite": {
      post: {
        summary: "Send an invitation to a university",
        tags: ["Admin"],
        security: [{ SessionAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Western University" },
                  domain: { type: "string", example: "western.ca" },
                  email: { type: "string", example: "admin@western.ca" }
                },
                required: ["name", "domain", "email"]
              }
            }
          }
        },
        responses: {
          201: {
            description: "Invitation sent successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "University invitation sent successfully" }
                  }
                }
              }
            }
          },
          400: { description: "Bad request / domain mismatch / already exists" },
          401: { description: "Unauthorized" },
          403: { description: "Admin access required" }
        }
      }
    },
    
    "/universities/invitations/accept": {
      post: {
        summary: "Accept a university invitation and create a password",
        tags: ["University"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  token: { type: "string", example: "a1b2c3d4e5f6g7h8i9j0" },
                  password: { type: "string", example: "StrongPassword123!" }
                },
                required: ["token", "password"]
              }
            }
          }
        },
        responses: {
          200: {
            description: "University account activated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "University account activated successfully" }
                  }
                }
              }
            }
          },
          400: { description: "Invalid token, expired, or already used" },
          404: { description: "Invite token not found" }
        }
      }
    },
  }
};

export default swaggerDefinitions;
