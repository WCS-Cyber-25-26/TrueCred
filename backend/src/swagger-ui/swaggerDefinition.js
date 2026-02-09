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
                  "email": { "type": "string", "example": "dev@western.ca" },
                  "password": { "type": "string", "example": "dev" }
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
                    "token": {
                      "type": "string",
                      "example": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMjAyNWNlYS1mYmRkLTQxOTItYjBhNi05OGIwODc5OGFlNDMiLCJyb2xlIjoiQURNSU4iLCJlbWFpbCI6ImRldkB3ZXN0ZXJuLmNhIiwiaWF0IjoxNzcwNTQyMTg0LCJleHAiOjE3NzA1NDMwODR9.x8YoR7r5DCUy44Qd64FFhyQemeyx8c4diGQZKPwvFi0"
                    }
                  },
                  "required": ["message", "token"]
                }
              }
            }
          },
          "400": { "description": "Invalid credentials or login failed" }
        }

      }
    },

    "/auth/logout": {
      "post": {
        "summary": "Logout the currently logged-in university",
        "tags": ["Auth"],
        "security": [
          { "bearerAuth": [] }
        ],
        "requestBody": {
          "required": false,
          "description": "No body required. Send the JWT token in the Authorization header as 'Bearer <token>'."
        },
        "responses": {
          "200": {
            "description": "Logout successful and token invalidated",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": { "type": "string", "example": "Logged out successfully" }
                  },
                  "required": ["message"]
                }
              }
            }
          },
          "401": {
            "description": "Unauthorized - JWT missing, invalid, or already revoked"
          },
          "500": { "description": "Server error" }
        }
      }
    },

    "/universities/invitations/accept": {
      post: {
        summary: "Accept a university invitation and create a password",
        tags: ["Public"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  token: { type: "string", example: "f636c46d0592d58e4f6479fea0a35cec9cd3af13af3a59f2fc2919b4458dc43b" },
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

    //legacy
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

    //legacy
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
      "get": {
        "summary": "Get all universities",
        "tags": ["Admin"],
        "security": [{ "bearerAuth": [] }],
        "responses": {
          "200": {
            "description": "List of universities",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "id": { "type": "string", "example": "60ec527b-c251-44fb-8664-be8eeb59cc3d" },
                      "name": { "type": "string", "example": "Western University" },
                      "domain": { "type": "string", "example": "western.ca" },
                      "domainVerified": { "type": "boolean", "example": true },
                      "chainEnabled": { "type": "boolean", "example": false },
                      "createdAt": { "type": "string", "format": "date-time", "example": "2026-02-08T03:04:19.716Z" },
                      "userId": { "type": "string", "example": "b1fe0142-8213-45be-be1e-b8871ed92401" },
                      "revocation": {
                        "type": "object",
                        "properties": {
                          "status": { "type": "string", "example": "Active" }
                        },
                        "nullable": true
                      }
                    },
                    "required": ["id", "name", "domain", "domainVerified", "chainEnabled", "createdAt", "userId", "revocation"]
                  }
                }
              }
            }
          },
          "401": { "description": "Unauthorized" },
          "403": { "description": "Admin access required" }
        }
      }
    },

    //needs changes
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

    //needs updates
    "/admin/universities/{id}": {
      put: {
        summary: "Update university information",
        tags: ["Admin"],
        security: [{ SessionAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", example: "uuid-of-university" },
            description: "ID of the university to update",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Western University" },
                  domain: { type: "string", example: "western.ca" },
                  domainVerified: { type: "boolean", example: true },
                  chainEnabled: { type: "boolean", example: false }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "University updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "University updated successfully" }
                  }
                }
              }
            }
          },
          400: { description: "Bad request" },
          401: { description: "Unauthorized" },
          403: { description: "Admin access required" },
          404: { description: "University not found" }
        }
      }
    },

    "/universities/credentials": {
      "post": {
        "summary": "Create a single credential for a student",
        "tags": ["University"],
        "security": [{ "bearerAuth": [] }],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "studentId": { "type": "string", "example": "student-uuid" },
                  "universityId": { "type": "string", "example": "university-uuid" },
                  "degreeName": { "type": "string", "example": "Bachelor of Science in Computer Science" },
                  "program": { "type": "string", "example": "Computer Science" },
                  "canonicalHash": { "type": "string", "example": "abc123def456hash" },
                  "awardedDate": { "type": "string", "format": "date", "example": "2026-01-15" }
                },
                "required": ["studentId", "universityId", "degreeName", "awardedDate"]
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Credential created successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": { "type": "string", "example": "Credential created successfully" }
                  },
                  "required": ["message"]
                }
              }
            }
          },
          "400": { "description": "Bad request" },
          "401": { "description": "Unauthorized" },
          "403": { "description": "Admin access required" }
        }
      }
    },

    "/universities/credentials/{id}": {
      put: {
        summary: "Update an existing credential",
        tags: ["University"],
        security: [{ SessionAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", example: "credential-uuid" },
            description: "Credential ID to update",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  programName: { type: "string", example: "Bachelor of Science in Computer Science" },
                  issueDate: { type: "string", format: "date", example: "2026-01-15" },
                  credentialType: { type: "string", example: "degree" }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Credential updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Credential updated successfully" }
                  }
                }
              }
            }
          },
          400: { description: "Bad request" },
          401: { description: "Unauthorized" },
          403: { description: "Admin access required" },
          404: { description: "Credential not found" }
        }
      }
    },

    "/universities/credentials/bulk": {
      "post": {
        "summary": "Create multiple credentials in bulk",
        "tags": ["University"],
        "security": [{ "bearerAuth": [] }],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "credentials": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "studentId": { "type": "string", "example": "student-uuid" },
                        "universityId": { "type": "string", "example": "university-uuid" },
                        "degreeName": {
                          "type": "string",
                          "example": "Bachelor of Science in Computer Science"
                        },
                        "program": {
                          "type": "string",
                          "example": "Computer Science"
                        },
                        "canonicalHash": {
                          "type": "string",
                          "example": "abc123def456hash"
                        },
                        "awardedDate": {
                          "type": "string",
                          "format": "date",
                          "example": "2026-01-15"
                        }
                      },
                      "required": [
                        "studentId",
                        "universityId",
                        "degreeName",
                        "awardedDate"
                      ]
                    }
                  }
                },
                "required": ["credentials"]
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Bulk credentials created successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": {
                      "type": "string",
                      "example": "Bulk credential creation successful"
                    },
                    "createdCount": {
                      "type": "integer",
                      "example": 5
                    },
                    "credentialIds": {
                      "type": "array",
                      "items": { "type": "string" }
                    }
                  },
                  "required": ["message", "createdCount", "credentialIds"]
                }
              }
            }
          },
          "400": { "description": "Bad request" },
          "401": { "description": "Unauthorized" },
          "403": { "description": "Admin access required" }
        }
      }
    },

    "/universities/credentials/{id}/revoke": {
      "post": {
        "summary": "Revoke a credential",
        "tags": ["University"],
        "security": [{ "bearerAuth": [] }],
        "parameters": [
          {
            "name": "credentialId",
            "in": "path",
            "required": true,
            "description": "UUID of the credential to revoke",
            "schema": {
              "type": "string",
              "format": "uuid"
            },
            "example": "60ec527b-c251-44fb-8664-be8eeb59cc3d"
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "reason": {
                    "type": "string",
                    "example": "Fraud detected"
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Credential revoked successfully",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "message": {
                      "type": "string",
                      "example": "Credential revoked successfully"
                    },
                    "revokedAt": {
                      "type": "string",
                      "format": "date-time",
                      "example": "2026-01-16T15:00:00Z"
                    }
                  },
                  "required": ["message", "revokedAt"]
                }
              }
            }
          },
          "400": {
            "description": "Bad request or credential already revoked"
          },
          "401": {
            "description": "Unauthorized"
          },
          "403": {
            "description": "Admin access required"
          },
          "404": {
            "description": "Credential not found"
          }
        }
      }
    },

    "/credentials/student/{studentId}": {
      "get": {
        "summary": "Get all credentials for a student",
        "tags": ["Credential"],
        "security": [{ "bearerAuth": [] }],
        "parameters": [
          {
            "name": "studentId",
            "in": "path",
            "required": true,
            "description": "UUID of the student",
            "schema": {
              "type": "string",
              "format": "uuid"
            },
            "example": "b1fe0142-8213-45be-be1e-b8871ed92401"
          }
        ],
        "responses": {
          "200": {
            "description": "List of credentials for the student",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "string",
                        "format": "uuid"
                      },
                      "universityId": {
                        "type": "string",
                        "format": "uuid"
                      },
                      "degreeName": {
                        "type": "string",
                        "example": "Bachelor of Science in Computer Science"
                      },
                      "program": {
                        "type": "string",
                        "example": "Computer Science"
                      },
                      "canonicalHash": {
                        "type": "string",
                        "example": "abc123def456hash"
                      },
                      "awardedDate": {
                        "type": "string",
                        "format": "date"
                      },
                      "revocation": {
                        "type": "object",
                        "nullable": true,
                        "properties": {
                          "status": {
                            "type": "string",
                            "example": "Active"
                          },
                          "revokedAt": {
                            "type": "string",
                            "format": "date-time",
                            "nullable": true
                          },
                          "reason": {
                            "type": "string",
                            "nullable": true
                          }
                        }
                      }
                    },
                    "required": [
                      "id",
                      "studentId",
                      "universityId",
                      "degreeName",
                      "awardedDate"
                    ]
                  }
                }
              }
            }
          },
          "401": { "description": "Unauthorized" },
          "403": { "description": "Admin access required" },
          "404": { "description": "Student not found" }
        }
      }
    },

    "/credentials/{credentialId}/revocation-status": {
      "get": {
        "summary": "Check credential revocation status",
        "tags": ["Credential"],
        "security": [{ "bearerAuth": [] }],
        "parameters": [
          {
            "name": "credentialId",
            "in": "path",
            "required": true,
            "description": "UUID of the credential",
            "schema": {
              "type": "string",
              "format": "uuid"
            },
            "example": "60ec527b-c251-44fb-8664-be8eeb59cc3d"
          }
        ],
        "responses": {
          "200": {
            "description": "Credential revocation status",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "revoked": {
                      "type": "boolean",
                      "example": false
                    }
                  },
                  "required": ["revoked"]
                }
              }
            }
          },
          "401": { "description": "Unauthorized" },
          "403": { "description": "Admin access required" },
          "404": { "description": "Credential not found" }
        }
      }
    },
  }
};

export default swaggerDefinitions;
