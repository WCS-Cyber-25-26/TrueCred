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
                    message: { type: "string", example: "Hello World!" }
                  }
                }
              }
            }
          }
        }
      }
    },

    "/auth/login": {
      post: {
        summary: "Authenticate user (Admin / University / Student)",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", example: "dev@western.ca" },
                  password: { type: "string", example: "dev" }
                },
                required: ["email", "password"]
              }
            }
          }
        },
        responses: {
          200: {
            description: "Login successful and JWT returned",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Login successful" },
                    token: {
                      type: "string",
                      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    }
                  }
                }
              }
            }
          },
          400: { description: "Invalid credentials" }
        }
      }
    },

    "/auth/logout": {
      post: {
        summary: "Logout current user",
        tags: ["Auth"],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Logout successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Logged out successfully" }
                  }
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

    "/universities/invite/accept": {
      post: {
        summary: "Accept university invitation",
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
          200: { description: "University account activated successfully" },
          400: { description: "Invalid or expired token" }
        }
      }
    },

    "/admin/universities": {
      get: {
        summary: "Get all universities",
        tags: ["Admin"],
        security: [{ BearerAuth: [] }],
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
                      id: { type: "string", format: "uuid", example: "60ec527b-c251-44fb-8664-be8eeb59cc3d" },
                      name: { type: "string", example: "Western University" },
                      domain: { type: "string", example: "western.ca" },
                      domainVerified: { type: "boolean", example: true },
                      chainEnabled: { type: "boolean", example: false },
                      createdAt: { type: "string", format: "date-time", example: "2026-02-08T03:04:19.716Z" }
                    }
                  }
                }
              }
            }
          },
          401: { description: "Unauthorized" }
        }
      }
    },

    "/admin/universities/{id}": {
      get: {
        summary: "Get specific university",
        tags: ["Admin"],
        security: [{ BearerAuth: [] }],
        parameters: [{
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          example: "60ec527b-c251-44fb-8664-be8eeb59cc3d"
        }],
        responses: {
          200: {
            description: "University retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "string", format: "uuid", example: "60ec527b-c251-44fb-8664-be8eeb59cc3d" },
                    name: { type: "string", example: "Western University" },
                    domain: { type: "string", example: "western.ca" },
                    domainVerified: { type: "boolean", example: true },
                    chainEnabled: { type: "boolean", example: false },
                    createdAt: { type: "string", format: "date-time", example: "2026-02-08T03:04:19.716Z" }
                  }
                }
              }
            }
          },
          404: { description: "University not found" }
        }
      },
      patch: {
        summary: "Update university information",
        tags: ["Admin"],
        security: [{ BearerAuth: [] }],
        parameters: [{
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          example: "60ec527b-c251-44fb-8664-be8eeb59cc3d"
        }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Western University Updated" },
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
                    message: { type: "string", example: "University updated successfully" },
                    university: {
                      type: "object",
                      properties: {
                        id: { type: "string", format: "uuid" },
                        name: { type: "string" },
                        domain: { type: "string" },
                        domainVerified: { type: "boolean" },
                        chainEnabled: { type: "boolean" },
                        updatedAt: { type: "string", format: "date-time" }
                      }
                    }
                  },
                  required: ["message", "university"]
                }
              }
            }
          },
          400: { description: "Bad request" },
          404: { description: "University not found" },
          401: { description: "Unauthorized" }
        }
      }
    },

    "/admin/universities/invite": {
      post: {
        summary: "Send university invitation",
        tags: ["Admin"],
        security: [{ BearerAuth: [] }],
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
                    message: { type: "string", example: "University invitation sent successfully" },
                    inviteToken: { type: "string", example: "f636c46d0592d58e4f6479fea0a35cec9cd3af13af3a59f2fc2919b4458dc43b" }
                  },
                  required: ["message", "inviteToken"]
                }
              }
            }
          },
          400: { description: "Bad request / domain mismatch / already exists" },
          401: { description: "Unauthorized" }
        }
      }
    },

    "/admin/universities/{id}/revoke": {
      post: {
        summary: "Revoke a university",
        tags: ["Admin"],
        security: [{ BearerAuth: [] }],
        parameters: [{
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          example: "60ec527b-c251-44fb-8664-be8eeb59cc3d"
        }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  reason: { type: "string", example: "Violation of policy" }
                },
                required: ["reason"]
              }
            }
          }
        },
        responses: {
          200: {
            description: "University revoked successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "University revoked successfully" },
                    revokedAt: { type: "string", format: "date-time", example: "2026-02-17T10:00:00Z" },
                    revokedBy: { type: "string", format: "uuid", example: "admin-uuid" }
                  },
                  required: ["message", "revokedAt", "revokedBy"]
                }
              }
            }
          },
          400: { description: "Bad request / already revoked" },
          401: { description: "Unauthorized" }
        }
      }
    },

    "/universities/me": {
      get: {
        summary: "Get own university profile",
        tags: ["University"],
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "University profile retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "string", format: "uuid", example: "60ec527b-c251-44fb-8664-be8eeb59cc3d" },
                    name: { type: "string", example: "Western University" },
                    domain: { type: "string", example: "western.ca" },
                    domainVerified: { type: "boolean", example: true },
                    chainEnabled: { type: "boolean", example: true },
                    createdAt: { type: "string", format: "date-time", example: "2026-02-08T03:04:19.716Z" }
                  }
                }
              }
            }
          },
          401: { description: "Unauthorized" }
        }
      }
    },

    "/universities/me/students": {
      get: {
        summary: "Get all students for this university",
        tags: ["University"],
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "List of students retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string", format: "uuid", example: "a1f5e3d2-7c8b-4f11-9f1a-2b3d4e5f6789" },
                      firstName: { type: "string", example: "John" },
                      lastName: { type: "string", example: "Doe" },
                      email: { type: "string", example: "john.doe@student.com" },
                      enrolledAt: { type: "string", format: "date-time", example: "2023-09-01T08:00:00Z" }
                    }
                  }
                }
              }
            }
          },
          401: { description: "Unauthorized" }
        }
      }
    },

    "/universities/me/credentials": {
      get: {
        summary: "Get all credentials issued by this university",
        tags: ["University"],
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "List of credentials retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string", format: "uuid", example: "c2f3e1b4-d5f6-4a1b-8c7d-9e2f3a4b5c6d" },
                      studentId: { type: "string", format: "uuid", example: "a1f5e3d2-7c8b-4f11-9f1a-2b3d4e5f6789" },
                      title: { type: "string", example: "Bachelor of Science" },
                      description: { type: "string", example: "Computer Science degree" },
                      issuedAt: { type: "string", format: "date-time", example: "2026-02-01T12:00:00Z" }
                    }
                  }
                }
              }
            }
          },
          401: { description: "Unauthorized" }
        }
      }
    },

    "/universities/students/{studentId}": {
      get: {
        summary: "Get specific student",
        tags: ["University"],
        security: [{ BearerAuth: [] }],
        parameters: [{
          name: "studentId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          example: "a1f5e3d2-7c8b-4f11-9f1a-2b3d4e5f6789"
        }],
        responses: {
          200: {
            description: "Student retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "string", format: "uuid" },
                    firstName: { type: "string" },
                    lastName: { type: "string" },
                    email: { type: "string" },
                    enrolledAt: { type: "string", format: "date-time" }
                  }
                }
              }
            }
          },
          404: { description: "Student not found" },
          401: { description: "Unauthorized" }
        }
      }
    },

    "/universities/students/{studentId}/credentials": {
      get: {
        summary: "Get credentials for a specific student",
        tags: ["University"],
        security: [{ BearerAuth: [] }],
        parameters: [{
          name: "studentId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          example: "a1f5e3d2-7c8b-4f11-9f1a-2b3d4e5f6789"
        }],
        responses: {
          200: {
            description: "Student credentials retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string", format: "uuid" },
                      title: { type: "string" },
                      description: { type: "string" },
                      issuedAt: { type: "string", format: "date-time" }
                    }
                  }
                }
              }
            }
          },
          404: { description: "Student not found" },
          401: { description: "Unauthorized" }
        }
      }
    },

    "/universities/credentials": {
      post: {
        summary: "Issue a single credential",
        tags: ["University"],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  studentId: { type: "string", format: "uuid", example: "a1f5e3d2-7c8b-4f11-9f1a-2b3d4e5f6789" },
                  title: { type: "string", example: "Bachelor of Science" },
                  description: { type: "string", example: "Computer Science degree" },
                  issuedAt: { type: "string", format: "date-time", example: "2026-02-01T12:00:00Z" }
                },
                required: ["studentId", "title", "description"]
              }
            }
          }
        },
        responses: {
          201: {
            description: "Credential issued successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "string", format: "uuid" },
                    studentId: { type: "string", format: "uuid" },
                    title: { type: "string" },
                    description: { type: "string" },
                    issuedAt: { type: "string", format: "date-time" }
                  }
                }
              }
            }
          },
          400: { description: "Bad request" },
          401: { description: "Unauthorized" }
        }
      }
    },

    "/universities/credentials/bulk": {
      post: {
        summary: "Bulk issue credentials",
        tags: ["University"],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    studentId: { type: "string", format: "uuid" },
                    title: { type: "string" },
                    description: { type: "string" },
                    issuedAt: { type: "string", format: "date-time" }
                  },
                  required: ["studentId", "title", "description"]
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: "Bulk credentials issued successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    count: { type: "integer", example: 5 },
                    credentials: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string", format: "uuid" },
                          studentId: { type: "string", format: "uuid" },
                          title: { type: "string" },
                          description: { type: "string" },
                          issuedAt: { type: "string", format: "date-time" }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          400: { description: "Bad request" },
          401: { description: "Unauthorized" }
        }
      }
    },

    "/universities/credentials/{id}": {
      get: {
        summary: "Get specific credential",
        tags: ["University"],
        security: [{ BearerAuth: [] }],
        parameters: [{
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          example: "c2f3e1b4-d5f6-4a1b-8c7d-9e2f3a4b5c6d"
        }],
        responses: {
          200: {
            description: "Credential retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "string", format: "uuid" },
                    studentId: { type: "string", format: "uuid" },
                    title: { type: "string" },
                    description: { type: "string" },
                    issuedAt: { type: "string", format: "date-time" }
                  }
                }
              }
            }
          },
          404: { description: "Credential not found" },
          401: { description: "Unauthorized" }
        }
      },
      patch: {
        summary: "Update credential",
        tags: ["University"],
        security: [{ BearerAuth: [] }],
        parameters: [{
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          example: "c2f3e1b4-d5f6-4a1b-8c7d-9e2f3a4b5c6d"
        }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string", example: "Bachelor of Science Updated" },
                  description: { type: "string", example: "Updated description" }
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
                    message: { type: "string", example: "Credential updated successfully" },
                    credential: {
                      type: "object",
                      properties: {
                        id: { type: "string", format: "uuid" },
                        studentId: { type: "string", format: "uuid" },
                        title: { type: "string" },
                        description: { type: "string" },
                        issuedAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" }
                      }
                    }
                  }
                }
              }
            }
          },
          400: { description: "Bad request" },
          404: { description: "Credential not found" },
          401: { description: "Unauthorized" }
        }
      }
    },

    "/universities/credentials/{id}/revoke": {
      post: {
        summary: "Revoke credential",
        tags: ["University"],
        security: [{ BearerAuth: [] }],
        parameters: [{
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          example: "c2f3e1b4-d5f6-4a1b-8c7d-9e2f3a4b5c6d"
        }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  reason: { type: "string", example: "Student request / policy violation" }
                },
                required: ["reason"]
              }
            }
          }
        },
        responses: {
          200: {
            description: "Credential revoked successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Credential revoked successfully" },
                    revokedAt: { type: "string", format: "date-time", example: "2026-02-17T10:00:00Z" },
                    revokedBy: { type: "string", format: "uuid", example: "admin-uuid" }
                  },
                  required: ["message", "revokedAt", "revokedBy"]
                }
              }
            }
          },
          400: { description: "Bad request / already revoked" },
          401: { description: "Unauthorized" }
        }
      }
    },

    "/universities/credentials/{credentialId}/revocation-status": {
      get: {
        summary: "Get credential revocation status",
        tags: ["University"],
        security: [{ BearerAuth: [] }],
        parameters: [{
          name: "credentialId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          example: "c2f3e1b4-d5f6-4a1b-8c7d-9e2f3a4b5c6d"
        }],
        responses: {
          200: {
            description: "Revocation status retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    credentialId: { type: "string", format: "uuid" },
                    revoked: { type: "boolean", example: false },
                    revokedAt: { type: "string", format: "date-time", nullable: true },
                    revokedBy: { type: "string", format: "uuid", nullable: true }
                  }
                }
              }
            }
          },
          404: { description: "Credential not found" },
          401: { description: "Unauthorized" }
        }
      }
    },

    "/students/me": {
      get: {
        tags: ["Student"],
        summary: "Get logged-in student profile",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Student profile retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "string", example: "stu_12345" },
                    firstName: { type: "string", example: "John" },
                    lastName: { type: "string", example: "Doe" },
                    email: { type: "string", example: "john@example.com" },
                    createdAt: { type: "string", format: "date-time" }
                  }
                }
              }
            }
          },
          401: {
            description: "Unauthorized - Invalid or missing token"
          }
        }
      }
    },

    "/students/me/credentials": {
      get: {
        tags: ["Student"],
        summary: "Get all credentials for logged-in student",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "List of student credentials",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string", example: "cred_67890" },
                      degree: { type: "string", example: "BSc Computer Science" },
                      university: { type: "string", example: "Harvard University" },
                      issuedAt: { type: "string", format: "date-time" },
                      status: {
                        type: "string",
                        example: "ACTIVE",
                        enum: ["ACTIVE", "REVOKED"]
                      }
                    }
                  }
                }
              }
            }
          },
          401: {
            description: "Unauthorized - Invalid or missing token"
          }
        }
      }
    },
  }
};

export default swaggerDefinitions;
