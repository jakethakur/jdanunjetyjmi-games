//init canvas
var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");

//variables
var height = 0; //rocket height (0 by default)

var grassHeight = 100; //height of grass for game start cutscene

var directionOfGravity = 90; //direction the rocket is pulled towards in degrees

var moveleft = false;
var moveright = false;
var moveup = false;
var movedown = false;

var updateInterval = null; //setInterval variable for update(); will be set when the game has begun

var enemies = []; //array of enemies

//dev variables
var skipCutscene = true; //false default
var hitboxes = true; //false default
var startAt = 300; //300 default - only works if skipCutscene is true

//stop image smoothing (makes images look low quality)
ctx.mozImageSmoothingEnabled = false;
ctx.webkitImageSmoothingEnabled = false;
ctx.msImageSmoothingEnabled = false;
ctx.imageSmoothingEnabled = false;

//define player object
var rocket = {
	x: 300,
	y: 500,
	
	speed: 50, //game updates per second
	//speed is normally 50
	
	moveSpeed: 2.5, //how many pixels to move per game update
	//moveSpeed is normally 2.5
	
	imageSize: {
		x: 53,
		y: 91,
	}
};

//load in pictures
//rocket
rocket.picture1 = new Image();
rocket.picture1.src = "./assets/rocket1.png";
rocket.picture2 = new Image();
rocket.picture2.src = "./assets/rocket2.png";
rocket.currentPicture = rocket.picture1;
//danger (currently unused)
var danger = new Image();
danger.src = "./assets/danger.png";
//bird
var bird = new Image();
bird.src = "./assets/bird.png";
//meteor
var meteorLarge = new Image();
meteorLarge.src = "./assets/meteorLarge.png";
var meteorMedium = new Image();
meteorMedium.src = "./assets/meteorMedium.png";
var meteorSmall = new Image();
meteorSmall.src = "./assets/meteorSmall.png";


//set canvas background colour
var canvasColour = "#d1f3ff";

//wait for pictures to load
rocket.picture2.onload = function() {
	//display all images once
	render();
	
	//start game in 1 second
	if(!skipCutscene) {
		setTimeout(grassDown, 1000);
	}
	else { //skip the cutscene (speeds things up when testing)
		grassHeight = 0;
		rocket.y = 300;
		height = startAt;
		rocket.currentPicture = rocket.picture2;
		render();
		instructions();
	}
}

//game start cutscene part 1 - grass moves down
function grassDown() {
	//change rocket picture to firing engine
	rocket.currentPicture = rocket.picture2;
	
	//grass moves down
	var cutscene = setInterval(function() {
		grassHeight--;
		height++;
		render();
		if(grassHeight <= 0) {
			clearInterval(cutscene);
			rocketUp();
		}
	}, 1000 / rocket.speed);
}

//game start cutscene part 2 - rocket moves up
function rocketUp() {
	//rocket moves up
	var cutscene = setInterval(function() {
		rocket.y--;
		height++;
		render();
		if(rocket.y <= 300) {
			clearInterval(cutscene);
			instructions();
		}
	}, 1000 / rocket.speed);
}

//game start cutscene part 3 - instructions
function instructions() {
	//this text will persist until the next render, when the player tries to move the rocket
	ctx.fillStyle = "black";
	ctx.font = "18px Arial";
	ctx.fillText("Use the arrow keys to move the rocket away from hazards", 10, 50);
}

//check for player input
document.onkeydown = function(e) {
	//check that the game is ready to begin
	if(height >= 300) {
		if(e.keyCode == 37) moveleft = true;
		if(e.keyCode == 38) moveup = true;
		if(e.keyCode == 39) moveright = true;
		if(e.keyCode == 40) movedown = true;
		
		//if the game does not update yet, make it start and dismiss the tutorial text
		if(updateInterval == null) {
			//declare game update interval
			updateInterval = setInterval(update, 1000 / rocket.speed);
		}
	}	
}
document.onkeyup = function(e) {
	if(e.keyCode == 37) moveleft = false;
	if(e.keyCode == 38) moveup = false;
	if(e.keyCode == 39) moveright = false;
	if(e.keyCode == 40) movedown = false;
}


//mobile device tilt
//event listener
window.addEventListener("deviceorientation", mobileTilt);
//function
function mobileTilt(event) {
	if(height >= 300) {
		var x = event.beta;
		//x = x / 2;
		
		var y = event.gamma;
		
		ctx.fillText(x, 30, 30);
		ctx.fillText(y, 30, 50);
		
		if(x > 10) {
			moveright = true;
			moveleft = false;
		}
		else if(x < 10) {
			moveleft = true;
			moveright = false;
		}
		else {
			moveleft = false;
			moveright = false;
		}
		
		if(y > 10) {
			moveup = true;
			movedown = false;
		}
		else if(y < 10) {
			movedown = true;
			moveup = false;
		}
		else {
			movedown = false;
			moveup = false;
		}
			
		//if the game does not update yet, make it start and dismiss the tutorial text
		if(updateInterval == null) {
			//declare game update interval
			updateInterval = setInterval(update, 1000 / rocket.speed);
		}
	}
}

//move rocket
function move() {
	//move rocket towards any active keypress
	if (moveleft) {
		rocket.x -= rocket.moveSpeed;
	}
	if (moveright) {
		rocket.x += rocket.moveSpeed;
	}
	if (moveup) {
		rocket.y -= rocket.moveSpeed;
	}
	if (movedown) {
		rocket.y += rocket.moveSpeed;
	}
	
	//move rocket towards direction of gravity
	//console.log("radians: " + toRadians(directionOfGravity));
	//console.log("y: " + Math.sin(toRadians(directionOfGravity)));
	rocket.y += Math.sin(toRadians(directionOfGravity));
	rocket.x += Math.cos(toRadians(directionOfGravity));
}

//update game state
function update() {
	//increase score
	height++;
	
	//move player
	move();
	
	//move all enemies
	enemyMove();
	
	//display images and text
	render();
	
	//check the player hasn't lost
	checkLoss();
	
	//spawn in new enemies
	spawnEnemies();
}

//render images and text on canvas
function render() {
	//wipe canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	//background colour
	ctx.fillStyle = canvasColour;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	//grass (for game start cutscene)
	ctx.fillStyle = "#11b217";
	ctx.fillRect(0, 600 - grassHeight, canvas.width, 600);
	
	//rocket
	ctx.drawImage(rocket.currentPicture, 0, 0, rocket.imageSize.x, rocket.imageSize.y, rocket.x - rocket.imageSize.x / 2, rocket.y - rocket.imageSize.y / 2, rocket.imageSize.x, rocket.imageSize.y);
	//hitboxes
	if(hitboxes) {
		ctx.strokeStyle = "red";
		ctx.strokeRect(rocket.x - rocket.imageSize.x / 2, rocket.y - rocket.imageSize.y / 2, rocket.imageSize.x, rocket.imageSize.y);
	}
	
	//enemies
	for(var i = 0; i < enemies.length; i++) {
		ctx.drawImage(enemies[i].picture, 0, 0, enemies[i].imageSize.x, enemies[i].imageSize.y, enemies[i].x - enemies[i].imageSize.x / 2, enemies[i].y - enemies[i].imageSize.y / 2, enemies[i].imageSize.x, enemies[i].imageSize.y);
		//hitboxes
		if(hitboxes) {
			ctx.strokeStyle = "red";
			ctx.strokeRect(enemies[i].x - enemies[i].imageSize.x / 2, enemies[i].y - enemies[i].imageSize.y / 2, enemies[i].imageSize.x, enemies[i].imageSize.y);
		}
	}
	
	//score text
	if(height > 300) { //only display once tutorial has finished
	ctx.fillStyle = "black";
	ctx.font = "18px Arial";
	ctx.fillText("Height: " + height, 10, 20);
	}
}

//enemy constructor
//parameters passed in as an object
//parameters: speed, direction, startX, startY, picture, imageSize.x, imageSize.y
function enemy(parameters) {
	this.speed = parameters.speed;
	this.direction = parameters.direction; //0 = right
	//don't forget to convert to radians via the toRadians() function for direction!
	
	this.x = parameters.startX;
	this.y = parameters.startY;
	
	this.picture = parameters.picture;
	this.imageSize = parameters.imageSize;
}

//spawn in new enemies
function spawnEnemies() {
	//if the rocket is low enough, spawn a bird every 40 ticks
	if(height < 2500 && height % 40 == 30) {
		if(randomNum(2) == 1) { //summon bird from top
			var random = randomNum(canvas.width);
			var enemyCreate = new enemy({
				speed: 2,
				direction: toRadians(30),
				
				startX: random,
				startY: 0,
				
				picture: bird,
				imageSize: {
					x: 58,
					y: 44,
				},
			});
		}
		else { //summon bird from left
			var random = randomNum(canvas.height);
			var enemyCreate = new enemy({
				speed: 2,
				direction: toRadians(30),
				
				startX: 0,
				startY: random,
				
				picture: bird,
				imageSize: {
					x: 58,
					y: 44,
				},
			});
		}
		enemies.push(enemyCreate);
	}
	
	//otherwise spawn a meteor every 30 ticks
	if (height > 2500 && height < 5000 && height % 30 == 10) {
		if(randomNum(25) == 1) { //summon big meteor (rare)
			var random = randomNum(canvas.width);
			var enemyCreate = new enemy({
				speed: 3,
				direction: toRadians(90),
				
				startX: random,
				startY: 0,
				
				picture: meteorLarge,
				imageSize: {
					x: 180,
					y: 180,
				},
				//sizeMultiplier: 1.5,
			});
		}
		else if(randomNum(3) == 1) { //summon medium meteor
			var random = randomNum(canvas.height);
			var enemyCreate = new enemy({
				speed: 3,
				direction: toRadians(90),
				
				startX: random,
				startY: 0,
				
				picture: meteorMedium,
				imageSize: {
					x: 90,
					y: 90,
				},
				//sizeMultiplier: 0.75,
			});
		}
		else { //summon small meteor
			var random = randomNum(canvas.height);
			var enemyCreate = new enemy({
				speed: 3,
				direction: toRadians(90),
				
				startX: random,
				startY: 0,
				
				picture: meteorSmall,
				imageSize: {
					x: 30,
					y: 30,
				},
				//sizeMultiplier: 0.25,
			});
		}
		enemies.push(enemyCreate);
	}
}

//generate random number between 0 and upper limit (upper limit will never be reached)
//TODO: make a lower limit as well
function randomNum(upper) {
	var foo = Math.random();
	foo *= upper;
	var bar = Math.floor(foo);
	return bar;
}

//convert degrees to radians
//javascript processes sin and cos in radians, not degrees, but degrees is more readable
function toRadians(degrees) {
	var foo = degrees / 180;
	foo *= Math.PI;
	return foo;
}

//move all enemies
function enemyMove() {
	for(var i = 0; i < enemies.length; i++) {
		//move the enemy
		enemies[i].x += enemies[i].speed * Math.cos(enemies[i].direction);
		enemies[i].y += enemies[i].speed * Math.sin(enemies[i].direction);
		
		//remove the enemy if they are off the screen
		if(enemies[i].x > canvas.length + 100 || enemies[i].x < -100 || enemies[i].y > canvas.height + 100 || enemies[i].y < -100) {
			enemies.splice(i, 1);
			i--;
		}		
	}
}

//check the player hasn't lost
function checkLoss() {
	//touching canvas edge
	if(rocket.x <= 0 + rocket.imageSize.x / 2) { //left side
		loseGame();
	}
	else if(rocket.x >= canvas.width - rocket.imageSize.x / 2) { //right side
		loseGame();
	}
	else if(rocket.y <= 0 + rocket.imageSize.y / 2) { //top side
		loseGame();
	}
	else if(rocket.y >= canvas.height - rocket.imageSize.y / 2) { //bottom side
		loseGame();
	}
	
	//touching enemy
	for(var i = 0; i < enemies.length; i++) {
		var rocketCollision = {
			x: rocket.x - rocket.imageSize.x / 2,
			y: rocket.y - rocket.imageSize.y / 2,
			width: rocket.imageSize.x,
			height: rocket.imageSize.y,
		}
		var enemyCollision = {
			x: enemies[i].x - enemies[i].imageSize.x / 2,
			y: enemies[i].y - enemies[i].imageSize.y / 2,
			width: enemies[i].imageSize.x,
			height: enemies[i].imageSize.y,
		}
		if(isTouching(rocketCollision, enemyCollision)) {
			loseGame();
		}
	}
}

//check if two objects are touching
function isTouching(rect1, rect2) {
	//https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection is useful
	
	/*if(obj1.x + obj1.imageSize.x * obj1.sizeMultiplier > obj2.x && obj1.x < obj2.x + obj2.imageSize.x * obj2.sizeMultiplier && obj1.y + obj1.imageSize.y * obj1.sizeMultiplier > obj2.y && obj1.y < obj2.y + obj2.imageSize.y * obj2.sizeMultiplier) {
		return true;
	}
	else {
		return false;
	}*/
	
	if(rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x && rect1.y < rect2.y + rect2.height && rect1.height + rect1.y > rect2.y) {
		return true;
	}
	else {
		return false;
	}
}

//end game due to player loss
function loseGame() {
	//stop game updates
	clearInterval(updateInterval);
	
	//text to tell the player they lost
	ctx.fillStyle = "black";
	ctx.font = "18px Arial";
	//ctx.fillText("You died; refresh to continue!",10,50); //legacy
	ctx.fillText("You died; refresh to play again!", 10, 50);
}
