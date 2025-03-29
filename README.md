# Gaming Platform

A real-time gaming platform built with Node.js, Express, and Socket.IO featuring multiple games, user management, and payment processing.

## Features

- User Authentication & Authorization
- Real-time Gaming (Wingo, K3, 5D)
- Multi-level User System with Referrals
- Payment Processing
- Admin Management
- Real-time Updates via Socket.IO

## Tech Stack

- Node.js & Express
- Socket.IO for real-time communication
- EJS for templating
- MySQL for database
- JWT for authentication

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── models/         # Database models
├── public/         # Static assets
├── routes/         # Route definitions
├── views/          # EJS templates
└── server.js       # Application entry point
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`

3. Initialize database:
```bash
npm run database
```

4. Start the server:
```bash
npm start
```

## Games

### Wingo
- Multiple time intervals (1, 3, 5, 10 minutes)
- Real-time results and betting

### K3
- Fast-paced number betting game
- Multiple betting options

### 5D
- Five-digit number prediction
- Various betting combinations

## Security

- JWT-based authentication
- Secure password hashing
- Rate limiting
- Input validation

## Admin Features

- User management
- Game result management
- Payment processing
- Statistics and reports
- Commission system