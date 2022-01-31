const http = require('http');
const express = require('express');
const path = require('path');
const socketio = require('socket.io');

// importing RpsGame
const RpsGame = require('./game-logic');

//
const app = express();

// path to client folder
const clientPath = path.join(__dirname, '../client');
console.log(`Serving static from ${clientPath}`);

// use static files
app.use(express.static(clientPath));

// creating the http server
const server = http.createServer(app);

// initialize socket.io
const io = socketio(server);

// connect first two connected players
let waitingPlayer = null;

io.on('connection', (socket) => {
  let playerId = getRandomInt(100, 999);
  if (waitingPlayer) {
    // start a game

    new RpsGame(waitingPlayer, socket);
    waitingPlayer = null;
  } else {
    waitingPlayer = socket;
    waitingPlayer.emit('message', 'Waiting for an opponent');
  }

  // playerId

  socket.on('message', (text) => {
    io.emit('message', `User:${playerId} ${text}`);
  });
});

// listening to error
server.on('error', (err) => {
  console.log('Server error:', err);
});

// listening on port 5000
server.listen(process.env.PORT || 5000, () => {
  console.log('Server started on port: 5000');
});

// get random Id
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}
