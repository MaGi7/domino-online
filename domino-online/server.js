function generateDominoSet() {
  const stones = [];
  for (let i = 0; i <= 6; i++) {
    for (let j = i; j <= 6; j++) {
      stones.push([i, j]);
    }
  }
  return stones;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}

io.on("connection", socket => {

  socket.on("startGame", () => {
  for (const code in rooms) {
    const room = rooms[code];
    const isHost = room.players[0]?.id === socket.id;

    if (!isHost || room.players.length < 3) return;

    // Round 1 → 1 stone per player
    const stonesPerPlayer = 1;

    const deck = generateDominoSet();
    shuffle(deck);

    room.players.forEach(player => {
      player.hand = deck.splice(0, stonesPerPlayer);

      io.to(player.id).emit("yourStones", player.hand);
    });

    io.to(code).emit("gameStarted");
  }
});

  socket.on("createRoom", ({ name }) => {
    const roomCode = generateRoomCode();
    rooms[roomCode] = {
      players: [{ id: socket.id, name, score: 0 }]
    };

    socket.join(roomCode);
    socket.emit("roomCreated", roomCode);
    io.to(roomCode).emit("playersUpdate", rooms[roomCode].players);
  });

  socket.on("joinRoom", ({ roomCode, name }) => {
    const room = rooms[roomCode];
    if (!room) return socket.emit("errorMsg", "Room not found");
    if (room.players.length >= 5)
      return socket.emit("errorMsg", "Room full");

    room.players.push({ id: socket.id, name, score: 0 });
    socket.join(roomCode);
    io.to(roomCode).emit("playersUpdate", room.players);
  });

  socket.on("disconnect", () => {
    for (const code in rooms) {
      rooms[code].players = rooms[code].players.filter(p => p.id !== socket.id);
      if (rooms[code].players.length === 0) delete rooms[code];
      else io.to(code).emit("playersUpdate", rooms[code].players);
    }
  });

});

server.listen(process.env.PORT || 3000, () =>
  console.log("Server running")
);

socket.on("makePrediction", (value) => {
  for (const code in rooms) {
    const room = rooms[code];
    const player = room.players.find(p => p.id === socket.id);
    if (!player) continue;

    // prevent changing prediction
    if (room.predictions[player.id] !== undefined) return;

    room.predictions[player.id] = value;

    // check if everyone predicted
    if (Object.keys(room.predictions).length === room.players.length) {
      // TEMPORARY RESULT LOGIC (round 1 example)
      room.players.forEach(p => {
        const predicted = room.predictions[p.id];
        const won = Math.random() > 0.5; // placeholder
        p.score += won ? predicted : 0;
        p.won = won;
      });

      io.to(code).emit("roundResult", {
        players: room.players.map(p => ({
          name: p.name,
          score: p.score,
          hand: p.hand,
          won: p.won
        }))
      });
    }
  }
});
