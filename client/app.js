const socket = io();

// Chat section
const writeEvent = (text) => {
  // <ul> element
  const parent = document.querySelector('.chat-list');
  // create <li> element
  const el = document.createElement('li');

  el.innerHTML = text;
  parent.prepend(el);
};

const onFormSubmitted = (e) => {
  e.preventDefault();

  const input = document.querySelector('#chat-input');
  const text = input.value;
  input.value = '';

  socket.emit('message', text);
};

writeEvent('Welcome to Backgammon!');
socket.on('message', writeEvent);
const chatForm = document.querySelector('#chat-form');
chatForm.addEventListener('submit', onFormSubmitted);

// Connected players
socket.on('connected-players', (num) => {
  document.querySelector(
    '#players-connected'
  ).innerHTML = `Total players online: ${num}`;
});
// End of Chat section

// Dice Roll section
// Send Roll btn click to server
const button = document.querySelector('.roll-btn');
button.addEventListener('click', () => socket.emit('roll'));

// Remove dice
const allDice = document.querySelectorAll('.dice');
const removeDice = () => {
  allDice.forEach((dice) => {
    dice.classList.remove('show-dice');
  });
};

// Recieve rolled dice numbers

let rolledDiceNumbers = []; // Save rolled dice numbers
let isDouble;

const dice1 = document.querySelector('.dice1');
const dice2 = document.querySelector('.dice2');
socket.on('rolled-dice', (nums) => {
  removeDice();
  rolledDiceNumbers = nums;
  [num1, num2] = nums;
  if (num1 === num2) {
    isDouble = true;
  } else isDouble = false;
  dice1.children[num1 - 1].classList.add('show-dice');
  dice2.children[num2 - 1].classList.add('show-dice');
});

// Recieve player color
let playerColor;
socket.on('player-color', (color) => (playerColor = color));
let enemyColor;
socket.on('enemy-color', (color) => (enemyColor = color));

// Recieve who's turn is
let isTurn;
socket.on('turn', (turn) => (isTurn = turn));

const bars = document.querySelectorAll('.bar');
let currentChecker;

function hoverEffect(bar) {
  const checker = bar.getElementsByClassName('checker');

  if (checker.length > 0 && checker[0].classList.contains(playerColor)) {
    const check = bar.parentElement.classList.contains('top')
      ? checker[checker.length - 1]
      : checker[0];
    check.style.transform = 'scale(1.2)';
    check.classList.add('shadow');
    check.setAttribute('draggable', true);
    check.style.cursor = 'move';
    currentChecker = check;

    check.addEventListener('dragstart', (e) => {
      // console.log('start');
    });

    check.addEventListener('dragend', (e) => {
      // console.log('end');
    });
  }
}
function removeHoverEffect(bar) {
  const checker = bar.getElementsByClassName('checker');
  Array.from(checker).forEach((el) => {
    el.style.transform = 'scale(1)';
    el.classList.remove('shadow');
    el.setAttribute('draggable', false);
    el.style.cursor = 'unset';
  });
}

// Move the checkers

let currentBarId;

const outOfBord = document.querySelector('.out-of-bord');

bars.forEach((bar) => {
  bar.addEventListener('mouseenter', (e) => {
    if (isTurn) hoverEffect(e.target);
    currentBarId = parseInt(e.target.id);
  });

  bar.addEventListener('mouseleave', (e) => {
    removeHoverEffect(e.target);
  });

  bar.addEventListener('dragenter', (e) => {
    e.preventDefault();
  });
  bar.addEventListener('dragover', (e) => {
    for (i in rolledDiceNumbers) {
      if (playerColor === 'black') {
        nextPosition = currentBarId - rolledDiceNumbers[i];
      } else {
        nextPosition = currentBarId + rolledDiceNumbers[i];
      }
      if (
        parseInt(bar.id) === nextPosition &&
        !checkEnemyCheckers(nextPosition)
      )
        e.preventDefault();
    }
  });

  bar.addEventListener('drop', () => {
    let nextPosition;
    for (i in rolledDiceNumbers) {
      // check the playercolor for move direction
      if (playerColor === 'black') {
        nextPosition = currentBarId - rolledDiceNumbers[i];
      } else {
        nextPosition = currentBarId + rolledDiceNumbers[i];
      }
      if (
        parseInt(bar.id) === nextPosition &&
        !checkEnemyCheckers(nextPosition)
      ) {
        bar.appendChild(currentChecker);
        rolledDiceNumbers.splice(i, 1);
        checkSingleEnemyCheckers(nextPosition);
      }
    }
    //////////////////////////////////////////////////////////

    console.log(nextPosition);
    // Send Moves to enemy
    socket.emit('enemyMove', currentBarId, nextPosition);
  });
});

// Check for enemy checkers on bars

function checkEnemyCheckers(position) {
  const bar = document.querySelector(`[id='${position}']`);
  const checkers = Array.from(bar.getElementsByTagName('div'));
  if (checkers.length > 1 && checkers[0].classList.contains(enemyColor)) {
    return true;
  }
}

function checkSingleEnemyCheckers(position) {
  const bar = document.querySelector(`[id='${position}']`);
  const checkers = Array.from(bar.getElementsByTagName('div'));
  if (checkers.length === 1 && checkers[0].classList.contains(enemyColor)) {
    outOfBord.appendChild(checkers[0]);
    checkers.shift();
    console.log('enemy checkers length 1');
  }
}

// let barId;
// bars.forEach((bar) => {
//   bar.addEventListener('click', () => {
//     barId = parseInt(bar.id);
//     checkSingleEnemyCheckers(barId);
//   });
// });

// Listen for enemy Moves
socket.on('enemyMoveReceive', (moveFrom, moveTo) => {
  if (!isTurn) {
    const barFrom = document.querySelector(`[id='${moveFrom}']`);
    const checkers = Array.from(barFrom.getElementsByTagName('div'));
    const checker = checkers.pop();
    const barTo = document.querySelector(`[id='${moveTo}']`);
    barTo.appendChild(checker);
  }
});

// Show possible moves on hover

// End of turn signal
const endBtn = document.querySelector('.end-turn-btn');
endBtn.addEventListener('click', () => {
  socket.emit('endTurn');
});
