var size = {"x":800,"y":560}
var worldData = {
	"level":
	   {"blockData":[
	    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],
		[0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],
		[0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1],
		[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
		[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]]},
		"otherPlayers":[]}

var player = {"xPos":130,"yPos":350,"xVel":0,"yVel":20,"tempSize":20}

var canvas;
var keys;

function gameMain(){
	var e = document.getElementById("canvasHolder");
	e.innerHTML += "<canvas id='Game' width='" +  size.x + "' height='" + size.y + "'></canvas>";

	var c = document.getElementById("Game");
	canvas =  c.getContext("2d");
	keys = new Keyboard();

	
	drawLevel();
	gameLoop();

}

function drawLevel(){
	canvas.fillStyle = "#ffffff";
	canvas.fillRect(0,0,size.x,size.y);
	var tileSize = {"x":40,"y":40};//{"x":size.x/20,"y":size.y/14};

	for(var r = 0; r< worldData.level.blockData.length;r++){

		for(var c = 0; c< worldData.level.blockData[r].length;c++){
			if(worldData.level.blockData[r][c] != 0){
				canvas.fillStyle = "#ccbbaa";
				canvas.fillRect(tileSize.x*c,tileSize.y*r,tileSize.x,tileSize.y);


			}

		}	


	}



	
}

function drawPlayer(){
	canvas.fillStyle = "#ff0000";

	canvas.fillRect(player.xPos,player.yPos,player.tempSize,player.tempSize)
}

function gameLoop(){
	var beforeStuff = new Date().getTime();
	drawLevel();
	drawPlayer();
	doMovement();

	var deltaTime = getTimeDiff(beforeStuff);

	var timeToWait = 17-deltaTime;
	if(timeToWait < 0){
		gameLoop();
	}
	else{
		setTimeout(gameLoop, timeToWait);
	}
	


}

var timeOfLastMovement = new Date().getTime();
function doMovement(){
	var acceleration = [0,.2]
	//first collect all inputs, 
	if(keys.keysDown.indexOf('A') != -1){
		acceleration[0]-=.5
	}
	if(keys.keysDown.indexOf('D') != -1){
		acceleration[0]+=.5
	}
	if(keys.keysDown.indexOf(' ') != -1){
		player.yVel = -10
		//acceleration[1]= -10
	}
	var diff = getTimeDiff(timeOfLastMovement)/10000;
	var deltaVel = [diff*acceleration[0],diff*acceleration[1]]
	player.xVel+=deltaVel[0]
	player.yVel+=deltaVel[1]
	if(Math.abs(player.xVel) > 10){
		player.xVel = 10 * Math.abs(player.xVel)/player.xVel;
	}
	if(Math.abs(player.yVel) > 10){
		player.yVel = 10 * Math.abs(player.yVel)/player.yVel;
	}

	//player.xPos+=player.xVel*diff
	//player.yPos+=player.yVel*diff
	var desiredXPos = player.xPos + player.xVel*diff;
	var desiredYPos = player.yPos + player.yVel*diff;

	calcCollisions(desiredXPos,desiredYPos);

	



}

function calcCollisions(desX,desY){
	var movingX = 0;
	var movingY = 0;
	var tileSize = 40;
	//var desCorners = [[desX-20,desY-20],[desX-20,desY-20],[desX-20,desY-20],[desX-20,desY-20]]

	if(player.xVel != 0){
		movingX = player.xVel/Math.abs(player.xVel)
	}
	if(player.yVel != 0){
		movingY = player.yVel/Math.abs(player.yVel)
	}
	var collision = false;
	for(var r = 0; r< worldData.level.blockData.length;r++){
		
		for(var c = 0; c< worldData.level.blockData[r].length;c++){
			if(worldData.level.blockData[r][c] != 0){
				if(boxCollision(desX,desY,c*40,r*40)){
					collision = true;
					//desX = player.xPos;
					//desY = player.yPos;
					//player.xVel = 0
					//player.yVel = 0
					//Test if this is a y collision or an x collision
					//console.log("x: " + desX + " y:" + desY);
					var yTest = 0;
					if(movingY > 0){
						yTest = r*40-player.tempSize-.1;
					}
					else if(movingY < 0){
						yTest = (r-1)*40-player.tempSize+.1;
					}
					else{
						yTest = desY;
					}

					var xTest = 0;
					if(movingX > 0){
						xTest = c*40-player.tempSize-1;
					}
					else if(movingX < 0){
						xTest = (c+1)*40-player.tempSize+.1;
					}
					else{
						xTest = desX;
					}

					if(!boxCollision(desX,yTest,c*40,r*40)){
						desY = yTest;
					}
					else if(!boxCollision(xTest,desY,c*40,r*40)){
						desX = xTest;
					}
					else{
						desY = yTest;
						desX = xTest;
					}
					//console.log("x: " + desX + " y:" + desY);
					canvas.fillStyle = "#ffbbaa";
					canvas.fillRect(40*c,40*r,40,40);
				}


			}		

			
		}

		


	}
	
	player.xPos = desX;
	player.yPos = desY;
	
	
	



}

function boxCollision(playerX,playerY,boxX,boxY){
	var playerDiameter = 20;

	var boxDiameter = 40;
	var a = {"left":playerX,"right":playerX+playerDiameter,"top":playerY,"bottom":playerY+playerDiameter}
	var b = {"left":boxX,"right":boxX+boxDiameter,"top":boxY,"bottom":boxY+boxDiameter}
	
	return !(b.left > a.right || 
           b.right < a.left || 
          b.top > a.bottom ||
           b.bottom < a.top);


}



function getTimeDiff(startDate){
	var now = new Date().getTime();
	var milliDiff = now-startDate
	return milliDiff;
}

function displayLobby(){

	var e = document.getElementById("canvasHolder");
	e.innerHTML += "<canvas id='Game' width='" +  size.x + "' height='" + size.y + "'></canvas>";

	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() { 
		if(xmlHttp.readyState == 4 && xmlHttp.status == 200){

			console.log(xmlHttp.responseText);
			displayLevel(xmlHttp.responseText);

		}
	}
	xmlHttp.open("GET", "lobby.txt", true); // true for asynchronous 
	xmlHttp.send(null);




}





function Keyboard(){
	this.keysDown = [];
	document.addEventListener('keydown', function(event){
		
		var keyChar = String.fromCharCode(event.keyCode);
		if(keys.keysDown.indexOf(keyChar) == -1){

			keys.keysDown.push(keyChar);
		}


	});

	document.addEventListener('keyup', function(event){
		
		var keyChar = String.fromCharCode(event.keyCode);
		
		if(keys.keysDown.indexOf(keyChar) > -1){

			keys.keysDown.splice(keys.keysDown.indexOf(keyChar),1);
		}


	})




}



