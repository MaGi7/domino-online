const socket = io();

function createRoom() {
  socket.emit("createRoom", {
    name: name.value
  });
}

function joinRoom() {
  socket.emit("joinRoom", {
    roomCode: roomCode.value.toUpperCase(),
    name: name.value
  });
}

socket.on("roomCreated", code => {
  alert("Room Code: " + code);
});

socket.on("playersUpdate", players => {
  playersList.innerHTML = "";
  players.forEach(p => {
    const li = document.createElement("li");
    li.textContent = `${p.name} (${p.score})`;
    playersList.appendChild(li);
  });
});

socket.on("errorMsg", msg => alert(msg));

const playersList = document.getElementById("players");
