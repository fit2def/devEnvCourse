'use strict';

//import gameObjects from 'game-objects';
//import gameVariables from 'game-variables';

var canvas = document.getElementById("gameScreen");
var context = canvas.getContext('2d');

var mouse = {
  x: undefined,
  y: undefined
}

canvas.addEventListener('mousemove', function(event){
    mouse.x = event.x;
    mouse.y = event.y;
});

window.addEventListener('resize', function(event){
    canvas.width = innerWidth;
    canvas.height = innerHeight;
});

function gameLoop(){
  newFrame();
}

function newFrame(){
  requestAnimationFrame(gameLoop);
  clearScreen();
}

function clearScreen(){
  context.clearRect(0, 0, innerWidth, innerHeight);
}


