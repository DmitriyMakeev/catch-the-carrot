Array.prototype.shuffle = function() {
  for(var j, x, k = this.length; k; j = Math.floor(Math.random() * k), x = this[--k], this[k] = this[j], this[j] = x);
  return this;
};

Array.prototype.diff = function(a) {
  return this.filter(function(i) {return a.indexOf(i) < 0;});
};

Array.prototype.randomElement = function () {
  return this[Math.floor(Math.random() * this.length)]
}

Element.prototype.hide = function() {
  this.style.display = 'none';
};

Element.prototype.show = function() {
  this.style.display = 'block';
};

// ----------------------------

function KeyboardInputManager() {
  this.events = {};

  this.listen();
}

KeyboardInputManager.prototype.on = function (event, callback) {
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push(callback);
};

KeyboardInputManager.prototype.emit = function (event, data) {
  var callbacks = this.events[event];
  if (callbacks) {
    callbacks.forEach(function (callback) {
      callback(data);
    });
  }
};

KeyboardInputManager.prototype.listen = function () {
  var self = this;

  var map = {
    38: { key: 0, type: 'arrow' }, // Up
    39: { key: 1, type: 'arrow' }, // Right
    40: { key: 2, type: 'arrow' }, // Down
    37: { key: 3, type: 'arrow' }, // Left

    81: { x: 0, y: 1, type: 'button' }, // Top-Left
    69: { x: 1, y: 1, type: 'button' }, // Top-Right
    68: { x: 1, y: 0, type: 'button' }, // Bottom-Right
    65: { x: 0, y: 0, type: 'button' }, // Bottom-Left

    82: { key: 'restart', type: 'common' }  // Restart
  };

  document.addEventListener('keydown', function (event) {
    var modifiers = event.altKey && event.ctrlKey && event.metaKey &&
                    event.shiftKey;
    var data    = map[event.which];

    if (!modifiers && data !== undefined) {
      event.preventDefault();
      self.emit('move', data);
    }

  });
};

// ----------------------------
/*
 *  "Catch the Egg" JavaScript Game
 *  source code  : https://github.com/shtange/catch-the-egg
 *  play it here : https://shtange.github.io/catch-the-egg/
 *
 *  Copyright 2015, Yurii Shtanhei
 *  GitHub : https://github.com/shtange/
 *  Habr   : https://habrahabr.ru/users/shtange/
 *  email  : y.shtanhei@gmail.com
 *
 *  Licensed under the MIT license:
 *  http://www.opensource.org/licenses/MIT
 */

/*
 *  Grid
 */
function Grid(count) {
  this.count = count;
  this.list = {};

  this.avail = [];
  this.hold = [];

  this.init();
}

Grid.prototype.init = function() {
  for (var i = 0; i < this.count; i++) {
    var value = {};

    if(i%2 == 0) {
      value.x = (i > 0) ? 1 : 0;
      value.y = (i > 0) ? 1 : 0;
    } else {
      value.x = (i > this.count/2) ? 1 : 0;
      value.y = (i > this.count/2) ? 0 : 1;
    }

    this.avail.push(i);
    this.list[i] = value;
  }
};

Grid.prototype.onHold = function(key) {
  this.hold.push(key);
};

Grid.prototype.unHold = function(key) {
  var index = this.hold.indexOf(key);
  this.hold.splice(index, 1);
};


/*
 *  Chicken
 */
function Chicken(key, position) {
  this.key = key;
  this.x = position.x;
  this.y = position.y;

  this.egg = new Egg(this.key, 0);
}

/*
 *  Egg
 */
function Egg(chicken, step, point) {
  this.chicken = chicken;
  this.step = step;
  this.point = point;
  this.amount = 5;

  this.callback;
  this.timer;
}

Egg.prototype.run = function(speed, callback) {
  this.callback = callback;

  var self = this;
  this.timer = setInterval(function() {
    self.nextStep();
  }, speed);
};

Egg.prototype.nextStep = function() {
  ++this.step;

  this.callback('updateEggPosition', { egg: this.chicken, position: this.step });

  if (this.step > this.amount) {
    clearInterval(this.timer);
    this.step = 0;
    this.callback('updateEggPosition', { egg: this.chicken, position: 0 });
    this.callback('unHoldChicken', { egg: this.chicken });
    this.callback('updateScore', { egg: this.chicken, point: this.point });
  }
};


/*
 *  Basket
 */
function Basket(position) {
  this.x = position.x;
  this.y = position.y;

  this.callback;
}

Basket.prototype.updatePosition = function (position, callback) {
  this.callback = callback;

  this.x = position.x;
  this.y = position.y;

  this.callback('updateBasketPosition', { x: this.x, y: this.y });
};


// -------------------------

/*
 *  "Catch the Egg" JavaScript Game
 *  source code  : https://github.com/shtange/catch-the-egg
 *  play it here : https://shtange.github.io/catch-the-egg/
 *
 *  Copyright 2015, Yurii Shtanhei
 *  GitHub : https://github.com/shtange/
 *  Habr   : https://habrahabr.ru/users/shtange/
 *  email  : y.shtanhei@gmail.com
 *
 *  Licensed under the MIT license:
 *  http://www.opensource.org/licenses/MIT
 */

function HTMLredraw() {
  this.bodyWrap = document.querySelector('body');
  this.gameWrap = document.querySelector('#game-wrap');
  this.scoreWrap = document.querySelector('#score');
  this.messageWrap = document.querySelector('#message');
  this.scoreNums = 4;
}

HTMLredraw.prototype.updateEggPosition = function(data) {
  this.changeAttributesValue(['data-egg-' + data.egg], [data.position]);
};

HTMLredraw.prototype.updateBasketPosition = function(data) {
  this.changeAttributesValue(['data-bx', 'data-by'], [data.x, data.y]);
};

HTMLredraw.prototype.changeAttributesValue = function(attributes, values) {
  if (attributes instanceof Array && values instanceof Array && attributes.length == values.length) {
    for (var i = 0; i < attributes.length; i++) {
      this.gameWrap.setAttribute(attributes[i], values[i]);
    }
  }
};

HTMLredraw.prototype.updateScore = function(data) {
  var elements = this.scoreWrap.getElementsByTagName('li');
  var score = data.value.toString();
  var empty = (this.scoreNums - score.length);

  for (var i = 0; i < elements.length; i++) {
    var num = (i < empty) ? 0 : parseInt(score.charAt(i - empty));
    elements[i].className = 'n-' + num;
  }
};

HTMLredraw.prototype.updateLossCount = function(data) {
  this.changeAttributesValue(['data-loss'], [data.loss]);
};

HTMLredraw.prototype.gameOver = function() {
  var msg = this.getMessage('Конец игры');

  this.messageWrap.show();
  this.messageWrap.appendChild(msg);
};

HTMLredraw.prototype.gameWin = function() {
  var msg = this.getMessage('Победа!');

  this.messageWrap.show();
  this.messageWrap.appendChild(msg);
};

HTMLredraw.prototype.getMessage = function(message) {
  var data = { h3: message, p: 'Нажмите <b>R</b>, чтобы начать заново' };

  var wrap = document.createElement('div');
  for (var tag in data) {
    var elem = document.createElement(tag);
    elem.innerHTML = data[tag];
    wrap.appendChild(elem);
  }

  return wrap;
};

HTMLredraw.prototype.mobileVersion = function() {
  this.bodyWrap.className = 'is-mobile';
};


//------------------------------------

/*
 *  "Catch the Egg" JavaScript Game
 *  source code  : https://github.com/shtange/catch-the-egg
 *  play it here : https://shtange.github.io/catch-the-egg/
 *
 *  Copyright 2015, Yurii Shtanhei
 *  GitHub : https://github.com/shtange/
 *  Habr   : https://habrahabr.ru/users/shtange/
 *  email  : y.shtanhei@gmail.com
 *
 *  Licensed under the MIT license:
 *  http://www.opensource.org/licenses/MIT
 */

var GameManager = function() {
  this.init();
  this.setup();
  this.start();
}

// Initial game settings
GameManager.prototype.init = function () {
  this.score = 0;
  this.loss = 0;
  this.over = false;
  this.won = false;

  this.count = 4;
  this.level = 1;
  this.speed = 800;
  // this.maxSpeed = 200;
  this.interval = this.speed*2.5;
  this.point = 2;

  this.chickens = {};
  this.eggs = {};

  this.gameTimer;

  this.basketStartPosition = { x: 0, y: 1 };
};

// Set up the game
GameManager.prototype.setup = function () {
  this.keyboard = new KeyboardInputManager();
  this.keyboard.on("move", this.move.bind(this));

  this.grid = new Grid(this.count);
  this.basket = new Basket(this.basketStartPosition);

  for (var i = 0; i < this.count; i++) {
    this.chickens[i] = new Chicken(i, this.grid.list[i], this.point);
  }

  this.HTMLredraw = new HTMLredraw();

  if (this.isMobile()) {
    this.touchscreenModification();
  }
};

GameManager.prototype.isMobile = function() {
  try {
    document.createEvent("TouchEvent");
    return true;
  }
  catch(e) {
    return false;
  }
};

GameManager.prototype.move = function (data) {
  var position = { x: this.basket.x, y: this.basket.y };

  switch (data.type) {
    case 'arrow':
      // 0: up, 1: right, 2: down, 3: left, 4: R - restart
      if(data.key%2 == 0) {
        position.y = (data.key > 0) ? 0 : 1;
      } else {
        position.x = (data.key > 2) ? 0 : 1;
      }
      break;
    case 'button':
      position.x = data.x;
      position.y = data.y;
      break;
    case 'common':
      if (data.key == 'restart') {
        this.reStart();
        return false;
      }
      break;
  }

  this.basket.updatePosition(position, this.api.bind(this));
}

GameManager.prototype.start = function () {
  this.runGear();
};

GameManager.prototype.reStart = function () {
  window.location.reload();
};

GameManager.prototype.runGear = function () {
  var self = this;
  this.gameTimer = setInterval(function() {
    var chicken = self.findAvailableChicken();
    if (chicken >= 0 && !this.over) {
      self.runEgg(chicken);
    }
  }, this.interval);
};

GameManager.prototype.suspendGear = function () {
  clearInterval(this.gameTimer);
  this.runGear();
};

GameManager.prototype.haltGear = function () {
  clearInterval(this.gameTimer);
  this.over = true;
};

GameManager.prototype.upLevel = function () {
  this.level++;

  switch (true) {
    case (this.level < 8):
      this.speed += -50;
      break;
    case (this.level > 19):
      this.speed += 0;
      break;
    default:
      this.speed += -25;
      break;
  }
  this.interval = this.speed*2.5;

  this.suspendGear();
};

GameManager.prototype.updateScore = function (data) {
  if (this.grid.list[data.egg].x == this.basket.x && this.grid.list[data.egg].y == this.basket.y) {
    this.score += this.point;
    this.HTMLredraw.updateScore({ value: this.score });

    if (this.score >= 1000) {
      this.gameWin();
      return false;
    }

    if (!(this.score % 50)) {
      this.upLevel();
    }
  } else {
    this.loss++;
    this.HTMLredraw.updateLossCount({ loss: this.loss });
    if (this.loss > 2 && !this.over) {
      this.gameOver();
    }
  }
};

GameManager.prototype.findAvailableChicken = function() {
  var avail = this.grid.avail.diff(this.grid.hold);

  if (!avail) {
    return null;
  }

  var chicken = avail.randomElement();
  this.api('onHoldChicken', { egg: chicken });

  return chicken;
};

GameManager.prototype.runEgg = function(chicken) {
  this.chickens[chicken].egg.run(this.speed, this.api.bind(this));
};

GameManager.prototype.gameOver = function() {
  this.haltGear();
  this.HTMLredraw.gameOver();
};

GameManager.prototype.gameWin = function() {
  this.haltGear();
  this.HTMLredraw.gameWin();
};

GameManager.prototype.api = function(method, data) {
  switch (method) {
    case 'updateScore':
      this.updateScore(data);
      break;
    case 'onHoldChicken':
      this.grid.onHold(data.egg);
      break;
    case 'unHoldChicken':
      this.grid.unHold(data.egg);
      break;
    case 'updateEggPosition':
      this.HTMLredraw.updateEggPosition(data);
      break;
    case 'updateBasketPosition':
      this.HTMLredraw.updateBasketPosition(data);
      break;
  }
};

GameManager.prototype.touchscreenModification = function() {
  var buttons = document.querySelector('#controls').getElementsByTagName('a');

  var self = this;
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].onclick = function() {
      var data = { x: this.getAttribute('data-x'), y: this.getAttribute('data-y'), type: 'button' };
      self.move(data);
      return false;
    };
  }

  this.HTMLredraw.mobileVersion();
};

//--------------------------------
(function() {

  var CatchTheEgg = new GameManager();

})();




