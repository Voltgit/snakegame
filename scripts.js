const WIDTH = 800;
const HEIGHT = 600;
const BLOCKSIZE = 20;
const gameWidth = WIDTH / BLOCKSIZE;
const gameHeight = HEIGHT / BLOCKSIZE;

const FPS = 60;
const TICKRATE = 10;
const drawDelay = 1000 / FPS;
const tickDelay = 1000 / TICKRATE;

let rand = (min, max) => (Math.trunc(Math.random() * (max-min)) + min);

let Game = function() {
	let canvas = document.getElementById("snakeGame");
	this.g = canvas.getContext("2d");
	
	this.speed = 1;
	
	this.drawRect = function(x, y, width, height, fillColor = "red", strokeColor = "green", lineWidth = 1){
		this.g.beginPath();
		
		this.g.rect(x , y, width, height);
		this.g.fillStyle = fillColor;
		this.g.fill();
		
		this.g.strokeStyle = strokeColor;
		this.g.lineWidth = lineWidth;
		if(strokeColor !== "white") this.g.stroke();
		
		this.g.closePath();
	};
	
	this.drawLine = function(x, y, x2, y2, color = "black", lineWidth = 5){
		this.g.beginPath();
		
		this.g.moveTo(x, y);
		this.g.lineTo(x + x2, y + y2);
		
		this.g.lineWidth = lineWidth;
		this.g.strokeStyle = color;
		this.g.stroke();
		
		this.g.closePath();
	};
	this.clearScreen = function(){
		this.g.clearRect(0, 0, WIDTH, HEIGHT);
	};
	
};

let game = new Game();

let snake = {
	x: gameWidth / 2,
	y: gameHeight / 2,
	
	size: 3,
	dir: 1,
	
	bodyColor: "red",
	headColor: "orange",
	
	autoPlay:  false,
	
	body: [],
	
	create() {
		
		for(let i = 0; i < this.size; i++){
			this.body[i] = [this.x, this.y + i];
		}
	},
	
	setDir(newDir)	{
		switch(this.dir){
			case 0: this.dir = newDir == 2 ? this.dir : newDir; break;
			case 1: this.dir = newDir == 3 ? this.dir : newDir; break;
			case 2: this.dir = newDir == 0 ? this.dir : newDir; break;
			case 3: this.dir = newDir == 1 ? this.dir : newDir; break;
		}
	},
	
	move() {
		
		switch(this.dir){
			case 0: this.x -= 1; break;
			case 1: this.y -= 1; break;
			case 2: this.x += 1; break;
			case 3: this.y += 1; break;
		}
		
		if(this.x < 0) this.x = gameWidth - 1;
		if(this.y < 0) this.y = gameHeight - 1;
		if(this.x > gameWidth - 1) this.x = 0;
		if(this.y > gameHeight - 1) this.y = 0;
		
		for(let i = this.size - 1; i > 0; i--){
			this.body[i] = this.body[i - 1];
		}
		
		this.body[0] = [this.x, this.y];
	},
	
	growUp(newSize = 15) {
		this.size = newSize;
		this.body.length = newSize;
		
		for(let i = 0; i < this.body.length; i++){
			if(!this.body[i])	this.body[i] = [0,0];
		}
		changeScore();
	},
	
	auto(appleX, appleY) {
		
		if(!this.autoPlay) return;
		
		if(this.x > appleX){
			this.dir = 0;
		}else if(this.x < appleX){
			this.dir = 2;
		}else{
			if(this.y > appleY){
				this.dir = 1;
			}else{
				this.dir = 3;
			}
		}
	}
};

let apple = {
	x: 0,
	y: 0,
	
	color: "blue",
	
	move() {
		this.x = rand(0, gameWidth);
		this.y = rand(0, gameHeight);
	}
};

let input = {};

let tickFunc;

new function(){
	
	document.addEventListener("keydown", keyDown, false);
	document.addEventListener("keyup", keyUp, false);
	
	snake.create();
	apple.move();
	
	input.autoPlay = document.getElementById("autoPlay");
	input.speedUp = document.getElementById("speedUp");
	input.speedDown = document.getElementById("speedDown");
	input.speedValue = document.getElementById("speedValue");
	
	setInterval(drawGame, drawDelay);
	tickFunc = setInterval(tick, tickDelay / game.speed);
	
}

function changeSpeed() {
	
	clearInterval(tickFunc);
	tickFunc = setInterval(tick, tickDelay / game.speed);
	
}


function keyDown(e){
	
	if(e.keyCode === 65){
		snake.setDir(0);
	}else if(e.keyCode === 87){
		snake.setDir(1);
	}else if(e.keyCode === 68){
		snake.setDir(2);
	}
	else if(e.keyCode === 83){
		snake.setDir(3);
	}else if(e.keyCode === 32){
		console.log(snake.x + "  \  " + snake.y);
	}
}

function keyUp(e){
	
	
	
}






function tick(){
	
	applyInput();
	
	snake.auto(apple.x, apple.y);
	snake.move();
	
	checkColl();
	//apple.move();
}


function drawGame(){
	game.clearScreen();
	
	for(let i = 0; i < WIDTH + BLOCKSIZE; i += BLOCKSIZE){
		game.drawLine(i, 0, 0, HEIGHT, "black", 1);
	}
	for(let i = 0; i < HEIGHT + BLOCKSIZE; i += BLOCKSIZE){
		game.drawLine(0, i, WIDTH, 0, "black", 1);
	}
	
	drawSnake();
	
	drawApple();
	
}

function drawSnake(){
	
	snake.body.forEach(function([bodyX, bodyY], index, array){
		game.drawRect(bodyX * BLOCKSIZE, bodyY * BLOCKSIZE, BLOCKSIZE, BLOCKSIZE, index != 0 ? snake.bodyColor : snake.headColor, "black");
	});
	
}

function drawApple(){
	game.drawRect(apple.x * BLOCKSIZE, apple.y * BLOCKSIZE, BLOCKSIZE, BLOCKSIZE, apple.color, "black");
}

function checkColl(){
	if(snake.x == apple.x && snake.y == apple.y) {
		apple.move();
		snake.size++;
		changeScore();
	}
	snake.body.forEach(function(item, index, array) {
		if(index > 1 && array[0][0] === item[0] && array[0][1] === item[1]) {
			snake.size = index;
			snake.body.length = index;
			changeScore();
		}
	});
}

function applyInput(){
	snake.autoPlay = input.autoPlay.checked;
	input.speedValue.innerHTML = game.speed;
}

function speedUp(){
	game.speed += game.speed >= 9 ? 0 : 1;
	changeSpeed();
}

function speedDown(){
	game.speed -= game.speed <= 1 ? 0 : 1;
	changeSpeed();
}

function changeScore(){
	document.getElementById("score").innerText = "Score: " + snake.size;
}
















