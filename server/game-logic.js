// _ (underscore) indicates that this variables are private.

class DiceRoll {
  constructor(p1, p2) {
    this._players = [p1, p2];

    // roll faze

    this._player1Faze = true;
    this._player2Faze = false;
    this._checkDiceRollWinner = [];

    this._sendToPlayers('Game started!');
    this._sendToPlayer(0, 'You are player one');
    this._sendToPlayer(1, 'You are player two');

    if (this._player1Faze) {
      this._rollTheDice();
    }
  }

  _sendToPlayers(msg) {
    this._players.forEach((player) => player.emit('message', msg));
  }
  _sendToPlayersDiceInfo(info) {
    this._players.forEach((player) => player.emit('dice-info', info));
  }

  _sendToPlayer(playerIndex, msg) {
    this._players[playerIndex].emit('message', msg);
  }

  _rollDice() {
    const randomDice1 = Math.floor(Math.random() * 6 + 1);
    const randomDice2 = Math.floor(Math.random() * 6 + 1);
    this._players.forEach((player) =>
      player.emit('rolledDice', randomDice1, randomDice2)
    );
    const sum = randomDice1 + randomDice2;
    this._checkDiceRollWinner.push(sum);
  }

  _player1Roll() {
    this._sendToPlayersDiceInfo('Player one roll!');
    this._players[0].on('roll', (btnClicked) => {
      if (btnClicked && this._player1Faze) {
        this._rollDice();
        this._sendToPlayersDiceInfo('Player one rolled!');
        setTimeout(() => {
          this._sendToPlayersDiceInfo('Player two roll!');
          this._player2Faze = true;
        }, 2000);
        this._player1Faze = false;
      }
    });
  }

  _player2Roll() {
    this._players[1].on('roll', (btnClicked) => {
      if (btnClicked && this._player2Faze) {
        this._rollDice();
        this._sendToPlayersDiceInfo('Player two rolled!');
        setTimeout(() => {
          this._sendToPlayersDiceInfo(this._checkDiceWinner());
        }, 2000);
        this._player2Faze = false;
      }
      console.log(this._checkDiceRollWinner);
    });
  }

  _rollTheDice() {
    this._player1Roll();
    this._player2Roll();
  }

  _checkDiceWinner() {
    const player1 = this._checkDiceRollWinner[0];
    const player2 = this._checkDiceRollWinner[1];

    if (player1 > player2) {
      return 'Player one wins!';
    } else if (player1 < player2) {
      return 'Player two wins!';
    } else {
      this._player1Faze = true;
      this._checkDiceRollWinner = [];
      return 'Tie. Please roll again! Player one roll again!';
    }
  }
}

class RpsGame {
  constructor(p1, p2) {
    this._players = [p1, p2];
    this._turns = [null, null];

    this._sendToPlayers('Game started!');

    this._players.forEach((player, idx) => {
      player.on('turn', (turn) => {
        this._onTurn(idx, turn);
      });
    });
  }

  _sendToPlayer(playerIndex, msg) {
    this._players[playerIndex].emit('message', msg);
  }

  _sendToPlayers(msg) {
    this._players.forEach((player) => player.emit('message', msg));
  }

  _onTurn(playerIndex, turn) {
    this._turns[playerIndex] = turn;
    this._sendToPlayer(playerIndex, `You selected ${turn}`);
    this._checkGameOver();
  }

  _checkGameOver() {
    const turns = this._turns;

    if (turns[0] && turns[1]) {
      this._sendToPlayers('Game over ' + turns.join(' : '));
      this._turns - [null, null];
      this._sendToPlayers('Next Round!!!');
    }
  }
}

module.exports = DiceRoll;
