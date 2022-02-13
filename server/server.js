const express = require('express');
const path = require('path');
const http = require('http');
const PORT = process.env.PORT || 5000;
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, '../client')));

// Start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Track all connections
let numSockets = 0;
// Pair two connections to a game
let waitingPlayer = null;

io.on('connection', (socket) => {
  const player = [socket, waitingPlayer];

  if (waitingPlayer) {
    // Start the game

    // Chat section
    player.forEach((socket) => {
      socket.emit('message', 'Opponent found! Game Starts!');
    });
    // Inform players wich color they are
    player[0].emit('message', 'You are with Black Checkers!');
    player[1].emit('message', 'You are with White Checkers!');
    // Chat between the two connected players
    player[0].on('message', (text) => {
      player[0].emit('message', `You: ${text}`);
      player[1].emit('message', `Opponent: ${text}`);
    });
    player[1].on('message', (text) => {
      player[0].emit('message', `Opponent: ${text}`);
      player[1].emit('message', `You: ${text}`);
    });
    player[1].emit('message', "Opponent's turn, please wait!");
    player[0].emit('message', 'Your turn, please Roll!');
    // End of Chat section

    ////////////////////////////
    // Turns section
    blackTurn = true;
    rollLimit = 0;

    // First Player

    // Send turn color
    player[0].emit('player-color', 'black');
    player[0].emit('enemy-color', 'white');
    // Listen for Roll btn and send numbers

    player[0].on('roll', () => {
      if (rollLimit === 0 && blackTurn) {
        rollLimit = null;
        let numbers = rollTheDice();
        // numbers = [2, 2];
        player.forEach((p) => p.emit('rolled-dice', numbers));
        player[0].emit('message', `You rolled: ${numbers} please move!`);
        player[0].emit('turn', true);
      }
    });

    // Listen for End Turn
    player[0].on('endTurn', () => {
      // Turn information
      player[0].emit('message', "Opponent's turn, please wait!");
      player[1].emit('message', 'Your turn, please Roll!');
      player[0].emit('turn', false);
      blackTurn = !blackTurn;
      rollLimit = 1;
    });

    ///////////////////

    // Second Player

    // Send turn color
    player[1].emit('player-color', 'white');
    player[1].emit('enemy-color', 'black');
    // Listen for Roll btn
    player[1].on('roll', () => {
      if (rollLimit === 1 && !blackTurn) {
        rollLimit = null;
        const numbers = rollTheDice();
        player.forEach((p) => p.emit('rolled-dice', numbers));
        player[1].emit('message', `You rolled: ${numbers} please move!`);
        player[1].emit('turn', true);
      }
    });

    // Listen for End Turn
    player[1].on('endTurn', () => {
      // Turn information
      player[0].emit('message', 'Your turn, please Roll!');
      player[1].emit('message', "Opponent's turn, please wait!");
      player[1].emit('turn', false);
      blackTurn = !blackTurn;
      rollLimit = 0;
    });

    // Listen for enemyMoves
    player.forEach((p) =>
      p.on('enemyMove', (moveFrom, moveTo) => {
        player.forEach((p) => p.emit('enemyMoveReceive', moveFrom, moveTo));
      })
    );

    waitingPlayer = null;
  }
  ///////////////////////////////////////////////////////////
  else {
    // First connected to the game is waiting
    waitingPlayer = socket;
    waitingPlayer.emit('message', 'Waiting for an opponent');
  }

  // Track the connected players
  numSockets += 1;
  // Track disconnected players/sockets
  socket.on('disconnect', () => {
    numSockets -= 1;
  });
  // Inform client how many players are connected
  setInterval(() => {
    io.emit('connected-players', numSockets);
  }, 100);

  const rollTheDice = () => {
    let randomNums = [null, null];
    randomNums = randomNums.map(
      (num) => (num = Math.floor(Math.random() * 6) + 1)
    );
    return randomNums;
  };
});
