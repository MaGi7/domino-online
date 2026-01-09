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

const lobby = document.getElementById("lobby");
const game = document.getElementById("game");

socket.on("gameStarted", () => {
  lobby.style.display = "none";
  game.style.display = "block";
});

const stonesDiv = document.getElementById("stones");
const predictTitle = document.getElementById("predictTitle");
const predictButtons = document.getElementById("predictButtons");

socket.on("yourStones", stones => {
  stonesDiv.innerHTML = "";

  stones.forEach(([a, b]) => {
    const stone = document.createElement("div");
    stone.textContent = `${a} : ${b}`;
    stone.style.border = "1px solid black";
    stone.style.display = "inline-block";
    stone.style.padding = "10px";
    stone.style.margin = "5px";
    stone.style.fontSize = "18px";
    stone.style.borderRadius = "6px";
    stonesDiv.appendChild(stone);
  });

  showPredictionButtons(stones.length);
});

function showPredictionButtons(max) {
  predictTitle.style.display = "block";
  predictButtons.style.display = "block";
  predictButtons.innerHTML = "";

  for (let i = 0; i <= max; i++) {
    const btn = document.createElement("button");
    btn.textContent = i === 0 ? "PASS" : i;
    btn.style.margin = "5px";
    btn.onclick = () => makePrediction(i);
    predictButtons.appendChild(btn);
  }
}

function makePrediction(value) {
  predictButtons.innerHTML = "<p>Prediction locked</p>";
  socket.emit("makePrediction", value);
}

socket.on("roundResult", data => {
  gameStatus.textContent = "Round finished";

  stonesDiv.innerHTML = "";

  data.players.forEach(p => {
    const block = document.createElement("div");
    block.style.border = "1px solid #ccc";
    block.style.margin = "8px";
    block.style.padding = "8px";

    block.innerHTML = `
      <strong>${p.name}</strong><br>
      Stones: ${p.hand.map(s => s.join(":")).join(", ")}<br>
      Result: ${p.won ? "WIN" : "LOSE"}
    `;

    stonesDiv.appendChild(block);
  });

  updateScoreboard(data.players);
});
