var io

var rooms = []

var roomExample = {
	"name":"ABCDEFG",
	"players":[
	
	{
		"id":"FF5555",
		"socket":1235,
		"ign":"jill"
	}

	],
	"level":0,//instead of 2d array i will try a tile object system

	"playerData":[]

}
var connectedPlayers = [];

function test(req, res){
	console.log("eyy lmao")
	res.send("hey");
}

function newRoom(req,res){

	console.log(req.body)
	var player = {};
	player.id = makeId();
	player.ign = req.body.userName;
	player.socket = "notReady"

	var newRoom = {};
	newRoom.name = makeRoom();
	newRoom.players = [player]
	newRoom.level = "lobby"
	rooms.push(newRoom);

	res.send({"message":"success","playerId":player.id,"roomName":newRoom.name})
	console.log(rooms)

}

function joinRoom(req,res){
	console.log(req.body)
	var player = {};
	player.id = makeId();
	player.ign = req.body.userName;
	player.socket = "notReady"

	for(room in rooms){
		if(rooms[room].name == req.body.roomName){
			room[rooms].players.push(player);
			break;
		}
	}
	res.send({"message":"success","playerId":player.id,"roomName":newRoom.name})
	console.log(rooms)
}

function sendRoomData(){

}

function initializeSockets(server){
	io = require('socket.io')(server);
	io.on('connection', function (socket) {
		
			
		socket.emit('requestJoinData', {});
		
		socket.on('requestNewRoomName', function(data){
			var name = makeRoom();
			socket.emit('returnNewRoomName', {"roomName":name});
		});

		socket.on('returnJoinData', function (data){//This is what is called when aplayer fully joins a room for good
			console.log("--------------")
			console.log(data.roomName);
			if(data.roomName == "" || data.roomName.length != 6){
				data.roomName = makeRoom();
				console.log("--------------")
			}
			data.id = makeId();
			socket.join(data.roomName)
			io.to(data.roomName).emit('receivedMessage', {"message":data.playerName + " has connected", "ign":data.roomName,"id":data.id})
			newRoom = true;
			var thisPlayerData = []
			for(roomIterator in rooms){

				room = rooms[roomIterator]
				if(room.name == data.roomName){
					room.players.push({"id":data.id, "socket":socket, "ign":data.playerName})
					room.playerData.push({"id":data.id, "position":{"x":200,"y":200}, "ign":data.playerName})
					console.log("__________ ADDED A NEW PLAYER TO A ROOM ___________")
					newRoom = false;
					thisPlayerData = room.playerData;
				}
			}
			if(newRoom){
				var roomExampleClone = JSON.parse(JSON.stringify(roomExample));
				roomExampleClone.name = data.roomName
				roomExampleClone.players = [{"id":data.id, "socket":socket, "ign":data.playerName},{"id":"ff0000", "socket":"socket", "ign":"red"}]
				roomExampleClone.playerData = [{"id":"ff0000", "position":{"x":200,"y":200}, "ign":"red"}]
				roomExampleClone.playerData.push({"id":data.id, "position":{"x":200,"y":200}, "ign":data.playerName})
				rooms.push(roomExampleClone)
				console.log("new room")
			}
			connectedPlayers.push({"socket":socket,"name":data.playerName,"room":data.roomName,"id":data.id})
			console.log(rooms[0].playerData)
			
			socket.emit('roomConnection', {"generalData":data,"playerData":thisPlayerData})
			
		});

		socket.on('disconnect', function (data){
			for(playerIterator in connectedPlayers){
				player = connectedPlayers[playerIterator];
				if(player.socket == socket){
					var disconnectedPlayerRoom = player.room;
					var disconnectedPlayerId = player.id;
					io.to(player.room).emit('receivedMessage', {"message":player.name + " has disconnected", "ign":player.room,"id":player.id})
					connectedPlayers.splice(playerIterator,1)
					for(roomIterator in rooms){
						room = rooms[roomIterator]
						if(room.name == disconnectedPlayerRoom){
							
							for(var playerIterator2 in room.playerData){
								var player = room.playerData[playerIterator2];
								if(player.id == disconnectedPlayerId){
									room.playerData.splice(playerIterator2, 1)
								}
							}

							for(var playerIterator2 in room.players){
								var player = room.players[playerIterator2];
								if(player.id == disconnectedPlayerId){
									room.players.splice(playerIterator2, 1)
								}
							}


						}
					}


				}
			}



			console.log("disconnected");
			
		});
		
		
		var count = 0;
		socket.on('transmitLocation', function (data) {
			count++;
			//data = {roomName, id, x,y}
			for(roomIterator in rooms){
				room = rooms[roomIterator]

				if(room.name == data.roomName){
					var newPlayer = true
					for(playerIterator in room.playerData){
						player = room.playerData[playerIterator]
						if(player.id == data.id){

							player.position = {"x":data.x,"y":data.y}
							newPlayer = false
							
						}
					}
					/*if(newPlayer){
						console.log("new Player")
						
						room.playerData.push({"id":data.id,"position":{"x":data.x,"y":data.y}})
						room.players.push({"id":data.id,"socket":"","ign":"jack"})
						console.log("added a new player : " + data.id)
						
						console.log("hi dude")
						console.log(room)

					}*/
					//console.log(room.playerData)
					io.to(data.roomName).emit('receiveServerData',{"playerData":room.playerData})
					

					
				}

			
			}
			if(count % 10 == 0){
				console.log( "\n \n");
				console.log(rooms[0].playerData);
			}

		});



		socket.on('addedTile', function (data){

			for(roomIterator in rooms){
				room = rooms[roomIterator]
				
				if(room.name == data.roomName){
					var newTile = true;
					for(var i = 0; i<room.tileData.length; i++){
						if(data.tile.x == room.tileData[i].x && data.tile.y == room.tileData[i].y && data.tile.z == room.tileData[i].z){
							room.tileData[i].id = data.tile.id;
							newTile = false;
						}
					}
					if(newTile){
						room.tileData.push(data.tile)
					}
					io.to(data.roomName).emit('newTileData', {"numberOf":"single", "tile":data.tile})

				}
				
			}



		});

		
		
	});



}

function makeRoom()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for( var i=0; i < 6; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
function makeId()
{
    var text = "";
    var possible = "ABCDE1234567890";

    for( var i=0; i < 6; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}


var exports;
exports.newRoom = newRoom;
exports.test = test;
exports.initializeSockets = initializeSockets;