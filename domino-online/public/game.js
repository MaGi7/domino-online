const socket = io();

// get elements correctly
const nameInput = document.getElementById("name");
const roomCodeInput = document.getElementById("roomCode");
const playersList = document.getElementById("players");

function createRoom() {
  if (!nameInput.value.trim()) {
    alert("Please enter your name");
    return;
  }

  socket.emit("createRoom", {
    name: nameInput.value.trim()
  });
}

function joinRoom() {
  if (!nameInput.value.trim() || !roomCodeInput.value.trim()) {
    alert("Enter name and room code");
    return;
  }

  socket.emit("joinRoom", {
    roomCode: roomCodeInput.value.trim().toUpperCase(),
    name: nameInput.value.trim()
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
