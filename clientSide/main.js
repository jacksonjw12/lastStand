

//var generalData = {"userName":"","id":"", "roomName":""};
//var socket;
function showUserNameCollecter() {
	var e = document.getElementById("enterName");
	e.style.display = 'block';
}
function hideEntry(){
	var e = document.getElementById("entry");
	e.style.display = 'none';
}
function submitUserName(){
	var name = document.getElementById("userNameField").value;
	console.log(name);
	if(name != ""){
		generalData.userName = name;

		startSockets();//"" for new room

		
	}

}

function startCreatingRoom(){
	generalData.roomName = "";
	showUserNameCollecter();

}
function startJoiningRoom(){
	var room = document.getElementById("roomName").value;
	//Check if room is valid
	generalData.roomName = room;
	
	showUserNameCollecter();



}
var counter = 0;
function startSockets(){
	socket = io();

	socket.on('requestJoinData', function (data){
		socket.emit('returnJoinData', generalData)
		
	});
	socket.on('roomConnection', function(data){
		generalData = data.generalData;
		players[0].id = generalData.id
		var p = document.getElementById("room");
		p.innerHTML = JSON.stringify(generalData)
		console.log("Connected :)");
	});
	socket.on('receiveServerData',function(data){
		counter++;
		if(counter > 100){
			//console.log(data.playerData);
			counter = 0;
		}

		playerData = data.playerData;
		//console.log(data.playerData);
	});

	hideEntry();
	gameMain();
	
}

function newRoom(){
	startSockets();
	socket.emit('requestNewRoomName',{})
	gameMain();


}

/*
function newRoom(){//Create A new Room and join it as the leader
	var jsonObj = {"userName":joiningData.userName};


	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() { 
		if(xmlHttp.readyState == 4 && xmlHttp.status == 200){
			data = JSON.parse(xmlHttp.responseText);
			
			console.log(data);
			if(data.message == "success"){
				var e = document.getElementById("entry");
				e.style.display = 'none';
				generalData.userName = joiningData.userName
				generalData.id = data.playerId
				roomData.roomName = data.roomName;
				startSockets();
				gameMain();

			}

		}

	}
		
	xmlHttp.open("POST", "newRoom", true); // true for asynchronous 
	xmlHttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xmlHttp.send(JSON.stringify(jsonObj));


}


function joinRoom(){//join an existing room


}
*/




