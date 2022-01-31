const dice1 = document.querySelector('.dice1');
const dice2 = document.querySelector('.dice2');
const allDice = document.querySelectorAll('.dice');

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

// Send roll button clicked

// const addButtonListeners = () => {
const buttonn = document.querySelector('.roll-btn');
buttonn.addEventListener('click', () => {
  const btnClicked = true;
  socket.emit('roll', btnClicked);
});
// };

const reciveRolledDice = () => {
  socket.on('rolledDice', (rolledDice1, rolledDice2) => {
    allDice.forEach((dice) => {
      dice.classList.remove('show-dice');
    });
    dice1.children[rolledDice1 - 1].classList.add('show-dice');
    dice2.children[rolledDice2 - 1].classList.add('show-dice');
  });
};

const writeDiceInfo = (info) => {
  const diceTextArea = document.querySelector('.text-area');
  diceTextArea.innerHTML = info;
};

writeEvent('Welcome to Backgammon!');

const socket = io();

socket.on('message', writeEvent);
socket.on('dice-info', writeDiceInfo);

document
  .querySelector('#chat-form')
  .addEventListener('submit', onFormSubmitted);

reciveRolledDice();
