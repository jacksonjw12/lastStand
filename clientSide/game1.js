var Engine = Matter.Engine;
var Render = Matter.Render;
var World = Matter.World;
var Bodies = Matter.Bodies;
var Events = Matter.Events;
var size = {"x":800,"y":200};
var Body = Matter.Body;
var keys = [];
var player;
var generalData = {"userName":"","id":"", "roomName":""};
var socket;
var players = [];
var playerData = [];

function gameMain(){
	
	var e = document.getElementById("canvasHolder");
	e.innerHTML += "<canvas id='Game' width='" +  size.x + "' height='" + size.y + "'></canvas>" + "</br><div id='room'></div>";
	

	var c = document.getElementById("Game");
	canvas =  c.getContext("2d");

	//keys = new Keyboard();

	var engine = Engine.create();

	// create a renderer
	var render = Render.create({
	    canvas: c,
	    engine: engine,
	    options:{
	    	wireframes:false,
	    	width: 800,
        	height: 400
	    }
	});


	player = Bodies.rectangle(400, 200, 40, 40, {


		inertia:Infinity,
		mass:50,
		ground: false,
		frictionAir: 0.03,
		id:generalData.id

	});
	player.collisionFilter.group =-1
	players.push(player);
	var playerSensor = Bodies.rectangle(0, 0, 20, 5, {
	  isSensor: true,
	  //isStatic: true,
	})
	playerSensor.collisionFilter.group =-1;
	var done = false;
	function playerGroundCheck(event,ground) { //runs on collisions events
	  var pairs = event.pairs;
	  if(!done){
	  	//console.log(pairs[1]);
	  }
	  for (var i = 0; i<pairs.length; ++i) {
	    var pair = pairs[i];
	    if(!done){
	    	
	    	console.log(pair.bodyA)
	    	console.log(pair.bodyB)
	    }
	    
	    if (pair.bodyA == playerSensor) {
	    	//console.log("A")
	      player.ground = ground;
	    } else if (pair.bodyB == playerSensor) {
	      player.ground = ground;
	      //console.log("B")
	    }
	  }
	  done = true;
	}

	//at the start of a colision for player
	Events.on(engine, "collisionStart", function(event) {
	  playerGroundCheck(event,true)
	});
	//ongoing checks for collisions for player
	Events.on(engine, "collisionActive", function(event) {
	  playerGroundCheck(event,true)
	});
	//at the end of a colision for player set ground to false
	Events.on(engine, 'collisionEnd', function(event) {
	  playerGroundCheck(event,false)
	})


	
	document.body.addEventListener("keydown", function(e) {
	  keys[e.keyCode] = true;

	});
	document.body.addEventListener("keyup", function(e) {
	  keys[e.keyCode] = false;
	});



	
	var ground = Bodies.rectangle(400, 410, 810, 60, { isStatic: true });

	// add all of the bodies to the world
	World.add(engine.world, [player, ground, playerSensor]);
	playerSensor.render.opacity = 0;


	Events.on(engine, "afterTick", function(event) {
		//set sensor velocity to zero so it collides properly
		Matter.Body.setVelocity(playerSensor, {x:0, y:0})
		//move sensor to below the player
		Body.setPosition(playerSensor, {
			x: player.position.x,
			y: player.position.y + 20
		});

		socket.emit('transmitLocation', {"roomName":generalData.roomName,"id":generalData.id, "x":player.position.x,"y":player.position.y})



	});
	function updatePlayers(){
		//console.log(generalData.id)
		//console.log(playerData)
		//alert(playerData);


		for(var i = 0; i < playerData.length; i++){
			var p = playerData[i];
			var newPlayer = false;//could be us
			if(generalData.id != p.id){//not us
				newPlayer = true;//true until false
				for(var j = 0; j< players.length; j++){
					var p2 = players[j];

					if(p.id == p2.id ){
						newPlayer = false;//player already exists
						if(p.position.x != p2.position.x || p.position.y != p.position.y){
							p2.position = p.position;
							console.log("UPDATED A POSITION THAT WAS NOT OUR OWN")
							console.log(p2.position)
						}
						
					}
					else{
						console.log(p.id)
						console.log(p2.id)
					}
					
				}

			}

			if(newPlayer){
				console.log("new player");

					var newPlayer = Bodies.rectangle(p.position.x, p.position.y, 40, 40, {
						mass:50,
						id:p.id,
						isStatic: true
						//position:{"x":currentPlayerData.position.x,"y":currentPlayerData.position.y}
						
					});
					console.log("--------------------------------------")
					console.log(newPlayer);
					console.log("--------------------------------------")

					players.push(newPlayer);
					//console.log(players.length)
					World.add(engine.world, newPlayer);
			}

		}



		/*for(playerDataIterator in playerData){

			var currentPlayerData = playerData[playerDataIterator];
			//console.log(generalData.id)
			if(currentPlayerData.id != generalData.id){
				//console.log(currentPlayerData.id)
				var isNewPlayer = true;
				for(playersIterator in players){
					var currentPlayer = players[playersIterator];
					

					if(currentPlayer.id == currentPlayerData.id){
						isNewPlayer = false;
						
						//currentPlayer.position.x = currentPlayerData.position.x;
						//currentPlayer.position.y = currentPlayerData.position.y;

					}
				}
				if(){
					console.log("new player");

					var newPlayer = Bodies.rectangle(currentPlayerData.position.x, currentPlayerData.position.y, 40, 40, {
						mass:50,
						id:currentPlayerData.id,
						isStatic: true
						//position:{"x":currentPlayerData.position.x,"y":currentPlayerData.position.y}
						
					});
					console.log("--------------------------------------")
					console.log(newPlayer);
					console.log("--------------------------------------")

					players.push(newPlayer);
					//console.log(players.length)
					World.add(engine.world, newPlayer);

				}


			}

		}*/
	}
	
	Events.on(engine, "beforeTick", function(event) {
		updatePlayers();
		
		//spin left and right
		const playerForce = 0.05
		const limit = 0.3

		if (keys[37] ) {
			player.force.x = -playerForce;
			if(player.velocity.x < -limit){
				player.velocity.x = -limit;
			}

		} 

		if (keys[39] ) {
			player.force.x = playerForce;
			if(player.velocity.x > limit){
				player.velocity.x = limit;
			}
		}
		
		//jump
		if (keys[38] && player.ground) {
			  //adds a cooldown to jump
			player.force.y = -.7;
			console.log("jumped")
			console.log(players)


		}
		if (keys[40] && player.ground) {
			Matter.Body.setAngularVelocity(player, player.angularVelocity*0.9)
			alert(players);
			//Matter.Body.setVelocity(player, {x:player.velocity.x*0.99, y:player.velocity.y})
		}

	});




	// run the engine
	Engine.run(engine);

	// run the renderer
	Render.run(render);
	

}