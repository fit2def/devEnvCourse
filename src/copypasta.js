var canvas = document.getElementById("myCanvas");
var context = canvas.getContext('2d');

var mouse = {
  x: undefined,
  y: undefined
}

window.addEventListener('mousemove', function(event){
    mouse.x = event.x;
    mouse.y = event.y;
});


window.addEventListener('touchstart', function(event){
  mouse.x = event.x;
  mouse.y = event.y;
});

window.addEventListener('touchend', function(event){
  mouse.x = undefined;
  mouse.x = undefined;
})

window.addEventListener('resize', function(event){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

function Circle(x, y, dx, dy, radius, color){
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.radius = radius;
    this.color = color;
    this.lifeCycle = 10000;

    this.process = function(){
        this.update();
        if (this.lifeCycle > 0)
          this.draw();
        this.grow();
    }

    this.update = function(){
        this.reverseCourseIfNeeded();
        this.x += this.dx;
        this.y += this.dy;
        this.lifeCycle--;
    }

    this.reverseCourseIfNeeded = function(){
        if (this.x + this.radius > window.innerWidth || this.x - this.radius < 0)
            this.dx = -this.dx;
        if (this.y + this.radius > window.innerHeight || this.y - this.radius < 0)
            this.dy = -this.dy;
    }

    this.draw = function(){
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        context.strokeStyle = this.color;
        context.stroke();
        context.fillStyle = this.color;
        context.fill();
    }

    this.grow = function() {
      if (Math.abs(mouse.x - this.x) < 50 && Math.abs(mouse.y - this.y) < 50)
        this.radius *= 1.01;
    };
}

function buildRandomCircle(){
    var randRad = Math.random() * 50;
    var randX = Math.random() * (window.innerWidth - randRad * 2) + randRad;
    var randY = Math.random() * (window.innerHeight - randRad * 2) + randRad;
    var randDX = (Math.random() - 0.5) * 10;
    var randDY = (Math.random() - 0.5) * 10;
    var randColor = randomColor();
    return new Circle(randX, randY, randDX, randDY, randRad, randColor);
}

function randomColor(){
    var rColor = 'rgba(';
    for (var i = 0; i < 3; i++)
      rColor += Math.floor(Math.random() * 255) + ',';
    rColor += Math.random() + ')';
    return rColor;
}

var i = 0;
var circles = [];

function animate(){
    newFrame();
    spawnCircle();
    processCircles();
    i++;
}


function newFrame(){
    requestAnimationFrame(animate);
    clearScreen();
}

function clearScreen(){
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
}

function spawnCircle(){
  if (i % 10 == 0)
    circles.push(buildRandomCircle());
}

function processCircles(){
  circles.forEach(function(c){
    c.process();
  });
}


animate();
