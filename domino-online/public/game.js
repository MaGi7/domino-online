const socket = io();

const nameInput = document.getElementById("name");
const roomCodeInput = document.getElementById("roomCode");
const playersList = document.getElementById("players");
const startBtn = document.getElementById("startBtn");

let isHost = false;

function createRoom() {
  if (!nameInput.value.trim()) {
    alert("Enter your name");
    return;
  }

  socket.emit("createRoom", { name: nameInput.value.trim() });
  isHost = true;
}

function joinRoom() {
  socket.emit("joinRoom", {
    roomCode: roomCodeInput.value.trim().toUpperCase(),
    name: nameInput.value.trim()
  });
}

function startGame() {
  socket.emit("startGame");
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

  // Show Start button only to host & if enough players
  if (isHost && players.length >= 3) {
    startBtn.style.display = "block";
  }
});

socket.on("gameStarted", () => {
  alert("Game Started!");
  // Next step: load game UI
});
