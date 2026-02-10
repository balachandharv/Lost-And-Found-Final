# Spring Boot Backend for College Lost & Found

This is the Java Spring Boot backend replacement for the Node.js server.

## Prerequisites

1. **Java JDK 17+** - Download from: https://adoptium.net/
2. **MySQL 8.0+** - Download from: https://dev.mysql.com/downloads/mysql/
3. **Maven 3.6+** - Download from: https://maven.apache.org/download.cgi

## Quick Start

### Option 1: Using Maven Wrapper (Recommended)
```bash
cd spring-boot-backend
.\mvnw.cmd spring-boot:run
```

### Option 2: Using Maven (if installed globally)
```bash
cd spring-boot-backend
mvn spring-boot:run
```

### Option 3: Using IDE
1. Open the project in IntelliJ IDEA or Eclipse
2. Run `LostFoundApplication.java`

## MySQL Setup

The database will be created automatically when you run the application.
Make sure MySQL is running with:
- **Host**: localhost
- **Port**: 3306 (default)
- **Username**: root
- **Password**: BALARAMA007@

The database `lost_and_found_db` will be created automatically.

## API Endpoints

All endpoints are the same as the Node.js backend:

- **Auth**: `/api/auth/*` (login, register, OTP, Google OAuth)
- **Users**: `/api/users/*` (admin only)
- **Reports**: `/api/reports/*` (CRUD for lost/found items)
- **Notifications**: `/api/notifications/*`
- **Health**: `/api/health`

The server runs on **port 5000** (same as Node.js).

## Switching from Node.js to Spring Boot

1. Stop the Node.js server (if running)
2. Start this Spring Boot server
3. The React frontend will work without any changes!
