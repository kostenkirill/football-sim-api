# Football Sim API Documentation

This document outlines the available REST endpoints, how to use Swagger UI, how to configure Postman, and how to connect to the WebSocket server for real-time updates.

## Base Configuration
- **Base URL:** `http://localhost:3000`
- **Swagger UI:** `http://localhost:3000/api`

---

## Swagger UI
Swagger UI is built into the application. Once you run the server (`npm run start:dev`), open your browser and navigate to `http://localhost:3000/api`. 
You can view all routes, DTO schemas, and test the endpoints directly from the interface.

---

## REST Endpoints

### Teams (`/teams`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/teams` | Get all teams and their players |
| **GET** | `/teams/:id` | Get a specific team by its ID |
| **POST** | `/teams` | Create a new team. Requires JSON body with `name`, `shortName`, and `countryCode` |
| **PATCH**| `/teams/:id` | Update an existing team |

### Players (`/players`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/players` | Get all players |
| **GET** | `/players/:id` | Get a specific player by ID |
| **GET** | `/players/team/:teamId`| Get all players belonging to a specific team |
| **POST** | `/players` | Create a new player. Requires JSON body with `teamId`, `firstName`, `lastName`, `shirtNumber`, `position` |
| **PATCH**| `/players/:id` | Update an existing player |

### Simulation (`/simulation`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET** | `/simulation` | Get all historical and running simulations |
| **GET** | `/simulation/:id` | Get a specific simulation by ID |
| **POST** | `/simulation/start` | Starts a new simulation. Requires JSON body: `{ "name": "Simulation Name" }`. **Note:** Has a cooldown period (CooldownGuard). |
| **PATCH**| `/simulation/:id/finish`| Prematurely stop and finish a running simulation |
| **PATCH**| `/simulation/:id/restart`| Restart a completed simulation |

---

## WebSocket Setup (Real-Time Events)

The API uses `Socket.io` to broadcast real-time simulation events.

### Connection
- **URL:** `ws://localhost:3000` (or `http://localhost:3000` if using a Socket.io client)
- **Transport:** Polling or WebSocket

### Server-Emitted Events
Listen to these events on your client to update your UI:

1. `simulation:start`
   - **Trigger:** When a new simulation is started or restarted.
   - **Payload:** The full `Simulation` object.

2. `simulation:score-update`
   - **Trigger:** Every 1 second (tick) when a random goal is scored.
   - **Payload:** An object containing the `simulationId` and the updated `Match` object.
   - **Example:** `{ simulationId: "sim-123", homeTeam: {...}, awayTeam: {...}, homeScore: 1, awayScore: 0, status: "live" }`

3. `simulation:finish`
   - **Trigger:** When the simulation reaches 9 seconds (duration) or is manually finished.
   - **Payload:** The full `Simulation` object with `status: 'completed'`.

---

## Postman Setup Guide
1. Create a new collection named "Football Sim API".
2. Add a collection variable `baseUrl` set to `http://localhost:3000`.
3. Use `{{baseUrl}}/teams`, `{{baseUrl}}/simulation/start`, etc., to create your requests.
4. Set the `Content-Type` header to `application/json` for POST/PATCH requests.
5. To test WebSockets in Postman:
   - Click "New" > "WebSocket".
   - Select "Socket.io" from the dropdown.
   - Enter `ws://localhost:3000` and click "Connect".
   - In the "Events" tab, add `simulation:start`, `simulation:score-update`, and `simulation:finish` to listen to them.
