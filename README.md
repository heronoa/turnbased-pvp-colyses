# PvP Game Server

This repository contains the code for a PvP (Player vs Player) game server developed using the [Colyseus.js](https://colyseus.io/) framework, WebSocket, Express, TypeScript, and the object-oriented programming paradigm.

## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Available Scripts](#available-scripts)
- [Environment Configuration](#environment-configuration)
- [Contribution](#contribution)
- [License](#license)

## About the Project

This project implements a server for a turn-based PvP multiplayer game. It uses Colyseus to create and manage game rooms in real time, allowing multiple players to join matches and compete against each other. Communication between the client and server is done via WebSocket abstracted by Colyseus.js framework, ensuring low-latency interactions.

## Features

- Creation and management of game rooms.
- Support for multiple players in real-time.
- State synchronization between clients.
- Matchmaking system to find opponents.
- Object-oriented implementation of game logic.
- The backend is in Express for APIs and configuration of auxiliary routes.

## Project Structure

The project follows a modular structure, organized into folders:

- **prisma/**: Responsible for Prisma ORM configuration and management.
  - **repositories/**: Contains repositories for accessing and manipulating database data.
    - **dto/**: Directory for Data Transfer Objects (DTOs) to facilitate data transfer between application layers.
    - **entities/**: Contains classes and interfaces representing database entities.
      - **characters.repository.ts**: Repository for manipulating data related to the character entity.
      - **game.repository.ts**: Repository for manipulating data related to the game entity.
      - **player.repository.ts**: Repository for manipulating data related to the player entity.
      - **prismaClient.ts**: Prisma client configuration and instance for database connection.
      - **user.repository.ts**: Repository for manipulating data related to the user entity.
  - **schema.prisma**: Prisma schema definition file for the database.

- **src/**: Main source code directory.
  - **controllers/**: Contains controllers to manage application requests and responses.
  - **middlewares/**: Contains middlewares to intercept and process requests before reaching the controllers.
  - **rooms/**: Directory for game room logic (likely using Colyseus for managing multiplayer game sessions).
  - **routes/**: Defines application routes and maps URLs to controllers.
  - **services/**: Contains services that encapsulate application business logic.
  - **utils/**: Contains utilities and helper functions used across the application.
  - **app.config.ts**: Main application configuration file.
  - **index.ts**: Application entry point.

## Technologies Used

- **Colyseus.js** - Framework for developing multiplayer games.
- **WebSocket** - Communication protocol for real-time data exchange.
- **Express** - Web server framework for managing API routes.
- **TypeScript** - A programming language for static typing and better code maintenance.
- **Object-Oriented Programming** - Programming paradigm for modeling game world using classes and objects.

## Prerequisites

- Node.js (>=16.x), preferably Node.js 21.2.0
- MongoDB (for game data storage)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/turnbased-pvp-colyseus.git
   cd turnbased-pvp-colyseus
   ```
2. Install dependencies:

  ```bash
  npm install
  ```

## Usage

1. **Configure environment variables**: Create a `.env` file in the project's root directory and add the necessary settings for the database, server port, and other project-specific variables (see [Environment Configuration](#environment-configuration)).

2. **Start the server**: To run the server in development mode, use the following command:

   ```
   npm run dev
   ```

   The server will be available on port **2567**.

3. **Access the server**: You can interact with the server's routes and functionalities using tools like Postman or the game frontend.

## Available Scripts

The following scripts are available to simplify development and server execution:

- **`npm start`**: Runs the server in development mode with automatic restart using Nodemon.
- **`npm run build`**: Compiles TypeScript code to JavaScript, generating output in the `dist` folder.
- **`node dist/src/index.js`**: Starts the server from the compiled JavaScript code in the `dist` folder.

## Environment Configuration

To configure the environment, create `.env`, `.env.production`, and `.env.development` files in the project's root directory and add the following environment variables as needed:

```
SAMPLE=development or production
DATABASE_URL=mongodb://localhost:27017/my-database # MongoDB connection URLretryWrites=true&w=majority&appName=colyseus-turngame
SECRET=your-secret-key # Secret key for authentication and security
```

## License

This project is licensed under the MIT License. See the LICENSE file for more details.
