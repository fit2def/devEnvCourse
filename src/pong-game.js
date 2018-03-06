import {constants} from "./pong-constants.js";

var canvas = document.getElementById("gameScreen");
var ctx = canvas.getContext('2d');

var meridianWidth;
var paddleWidth;
var paddleHeight;
var puckRadius;

function resizeComponents() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  meridianWidth = canvas.width / constants.MERIDIAN_WIDTH_DIVISOR;
  paddleWidth = canvas.width / constants.PADDLE_WIDTH_DIVISOR;
  paddleHeight = canvas.height / constants.PADDLE_HEIGHT_DIVISOR;
  puckRadius = canvas.width / constants.PUCK_RADIUS_DIVISOR;
}

resizeComponents();

var gameObjects = new GameObjects();

/* Browser Event Listeners */
window.addEventListener('resize', function(){
    resizeComponents();
    gameObjects.leftPlayer.paddle = new Paddle(0);
    gameObjects.rightPlayer.paddle = new Paddle(1);
});

window.addEventListener('keypress', function(event){
  var key = event.key;
  if (key === constants.LEFT_UP) gameObjects.leftPlayer.upKeyPressed = true;
  else if (key === constants.LEFT_DOWN) gameObjects.leftPlayer.downKeyPressed = true;
  else if (key === constants.RIGHT_UP) gameObjects.rightPlayer.upKeyPressed = true;
  else if (key === constants.RIGHT_DOWN) gameObjects.rightPlayer.downKeyPressed = true;
});


window.addEventListener('keyup', function(event) {
  var key = event.key;
  if (key === constants.LEFT_UP) gameObjects.leftPlayer.upKeyPressed = false;
  else if (key === constants.LEFT_DOWN) gameObjects.leftPlayer.downKeyPressed = false;
  else if (key === constants.RIGHT_UP) gameObjects.rightPlayer.upKeyPressed = false;
  else if (key === constants.RIGHT_DOWN) gameObjects.rightPlayer.downKeyPressed = false;
});

canvas.addEventListener('touchstart', function(event){
  console.log(event.touches);
});

/* Game Loop */
function gameLoop(){
  newFrame();
  addBackground();
  drawMeridian();
  gameObjects.update();
  if (gameObjects.leftPlayer.score == 10){
    gameObjects.leftPlayer.paddle.color = constants.WINNING_GOLD;
    gameObjects.rightPlayer.paddle.color = constants.RETRO_GREEN;
    gameObjects.leftPlayer.score = 0;
    gameObjects.rightPlayer.score = 0;
  }
  else if (gameObjects.rightPlayer.score == 10){
    gameObjects.rightPlayer.paddle.color = constants.WINNING_GOLD;
    gameObjects.leftPlayer.paddle.color = constants.RETRO_GREEN;
    gameObjects.rightPlayer.score = 0;
    gameObjects.leftPlayer.score = 0;
  }
  drawScores();
}

function newFrame(){
  requestAnimationFrame(gameLoop);
  clearScreen();
}

function clearScreen(){
  ctx.clearRect(0, 0, innerWidth, innerHeight);
}

function addBackground(){
  ctx.fillStyle = constants.BACKGROUND_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawMeridian() {
  var x = canvas.width / 2 - (0.5 * meridianWidth);
  var y = canvas.height;
  ctx.fillStyle = constants.RETRO_GREEN_ALPHA;
  ctx.fillRect(x, 0, meridianWidth, y);
}

function GameObjects() {
    this.leftPlayer = new Player(0);
    this.rightPlayer = new Player(1);
    this.physics = new PongPhysics();
    this.puck = new Puck(1);
    this.spawnPuck = function(direction) {
      this.puck = new Puck(direction);
    };
    this.update = function(){
      this.leftPlayer.update();
      this.rightPlayer.update();
      this.puck.update();
    };
}

function drawScores(){
  var baseX = canvas.width / 2;
  var offsetX = canvas.height / 10;
  var offsetY = canvas.height / 10;
  ctx.font = offsetY + "px " + constants.FONT;
  ctx.fillStyle = constants.RETRO_GREEN_ALPHA;
  ctx.fillText(gameObjects.leftPlayer.score, baseX - 1.5 * offsetY, offsetY);
  ctx.fillText(gameObjects.rightPlayer.score, baseX + offsetX, offsetY );
}

function RectFactory(side){
  if (side)
    this.buildRect = function(top){ return [ canvas.width - paddleWidth, top, paddleWidth, paddleHeight ]; };
  else
    this.buildRect = function(top) { return [ 0, top, paddleWidth, paddleHeight]; };
}

function PongPhysics() {
  this.accelerate = function (velocity, direction) {
    var newVelocity;
    if (direction === 0) {
      if (Math.abs(velocity) < constants.MIN_VELOCITY)
         newVelocity = 0;
      else
        newVelocity = velocity + (velocity > 0 ? -constants.PADDLE_ACC : constants.PADDLE_ACC);
    }
    else
      newVelocity = velocity + direction * constants.PADDLE_ACC;
    return newVelocity;
  };
}


function Paddle(side) {
  this.color = constants.RETRO_GREEN;
  this.top = (canvas.height / 2) - (.5 * paddleHeight);
  this.rectFactory = new RectFactory(side);
  this.rect = this.rectFactory.buildRect(this.top);
  this.velocity = 0;

  this.update = function(direction) {
    this.velocity = gameObjects.physics.accelerate(this.velocity, direction);
    this.top += this.velocity;
    this.checkForBoundaries();
    this.rect = this.rectFactory.buildRect(this.top);
    this.draw();
  };

  this.checkForBoundaries = function() {
    if (this.top < 0) {
      this.top = 0;
      this.velocity = 0;
    }
    else if (this.top + paddleHeight >= canvas.height) {
      this.top = canvas.height - paddleHeight;
      this.velocity = 0;
    }
  };

  this.draw = function() {
    ctx.fillStyle = this.color;
    ctx.fillRect(...this.rect);
  };
}

function Player(side){
  this.isPuckTarget = side;
  this.score = 0;
  this.upKeyPressed = false;
  this.downKeyPressed = false;
  this.paddle = new Paddle(side);
  this.update = function() {
    var direction = this.determineDirection()
    this.paddle.update(direction);
  };
  this.determineDirection = function() {
    var direction = 0;
    if (this.upKeyPressed) direction -= 1;
    if (this.downKeyPressed) direction += 1;
    return direction;
  };
}

function Puck(direction){
  this.x = canvas.width / 2;
  this.y = canvas.height / 2;
  this.xVelocity = constants.PUCK_BASE_VEL * direction;
  this.yVelocity = (Math.random() - 0.5) * constants.PUCK_BASE_VEL;
  this.accelerate = function() {

    this.xVelocity += this.xVelocity > 0 ? constants.REFLECT_ACCELERATOR : -constants.REFLECT_ACCELERATOR;
  }
  this.update = function() {
    this.checkForCollisions();
    this.x += this.xVelocity;
    this.y += this.yVelocity;
    this.draw();
  };
  this.checkForCollisions = function(){
    //vert reflect, refactor into method
    if (this.y + puckRadius >= canvas.height || this.y - puckRadius <= 0)
      this.yVelocity = -this.yVelocity;
    //right reflect
    if (this.x + puckRadius >= canvas.width - paddleWidth){
      if (this.y - 1.5 * puckRadius <= gameObjects.rightPlayer.paddle.top + paddleHeight && this.y + 1.5 * puckRadius>= gameObjects.rightPlayer.paddle.top){
        this.xVelocity = -this.xVelocity;
        var spinDist = this.y - (gameObjects.rightPlayer.paddle.top + .5 * paddleHeight);
        this.yVelocity += spinDist * 0.05;
        this.accelerate();
      }
      else {
        gameObjects.leftPlayer.score++;
        gameObjects.spawnPuck(-1);
      }

    }
    //left reflect
    if (this.x - puckRadius <= paddleWidth){
      if (this.y - 1.5 * puckRadius<= gameObjects.leftPlayer.paddle.top + paddleHeight && this.y + 1.5 * puckRadius>= gameObjects.leftPlayer.paddle.top){
        this.xVelocity = -this.xVelocity;
        var spinDist = this.y - (gameObjects.leftPlayer.paddle.top + .5 * paddleHeight);
        this.yVelocity += spinDist * 0.05;
        this.accelerate();
      }
      else{
        gameObjects.rightPlayer.score++;
        gameObjects.spawnPuck(1);
      }
    }

  }
  this.draw = function() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, puckRadius, 0, 2 * Math.PI, false);
    ctx.strokeStyle = constants.RETRO_GREEN;
    ctx.stroke();
    ctx.fillStyle = constants.RETRO_GREEN;
    ctx.fill();
  };
}


export { gameLoop };
