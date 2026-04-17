## Description

REST API that simulates 3 football matches  with WebSocket updates.
## Matches
- Germany vs Poland
- Brazil vs Mexico
- Argentina vs Uruguay

## Notes
- For now data is stored in memory.
- Simulations can only be started once per every 5 seconds
- Each simulation lasts 9 seconds unless manually finished
- One goal is scored every second by a randomly selected team

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## API Endpoints

### Start simulation
``POST /simulation/start``

Body: { "name": "Qatar 2022" }

Name rules:
- 8-30 characters
- Letters, digits and spaces only

### Get simulation
``GET /simulation/:id``

### Finish simulation
``PATCH /simulation/:id/finish``

### Restart simulation
``PATCH /simulation/:id/restart``

## WebSocket Events

Connect to Socket.io: http://localhost:3000

| Event | Description |
|-------|-------------|
| simulation:start | Emitted when simulation starts or restarts |
| simulation:score-update | Emitted every second with updated match score |
| simulation:finish | Emitted when simulation finishes |

