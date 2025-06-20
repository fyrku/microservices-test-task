# Microservices Test Task

A microservices architecture project with Node.js services, RabbitMQ message broker, and MongoDB database.

## Services

- **Users Service** (Port 3001) - Manages user data with MongoDB
- **Notification Service** (Port 3002) - Handles notifications via RabbitMQ
- **RabbitMQ** (Port 5672, Management UI: 15672) - Message broker
- **MongoDB** (Port 27017) - Database for users

## Quick Start

1. Clone the repository
2. Run with Docker Compose:

   ```bash
   docker-compose up -d
   ```

3. API Documentation: [Swagger UI](http://localhost:3001/api/docs)
