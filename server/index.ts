import http from "http";
import { Server, Socket } from "socket.io";

function randomColor() {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);

  return "#" + randomColor;
}

const server = http.createServer((req, res) => {
  res.end("OK");
});

type User = {
  name: string;
  color: string;
};

const usersBySocket = new Map<Socket, User>();
const usersByName = new Map<string, User>();

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("user-connected", ({ name }) => {
    const user: User = { name, color: randomColor() };
    usersBySocket.set(socket, user);
    usersByName.set(name, user);
    console.log(`user ${name} connected`);

    io.emit("server-message", { type: "connect", user: user });
  });

  socket.on("send-message", (msg) => {
    const user = usersBySocket.get(socket);

    if (!user) {
      return;
    }

    io.emit("server-message", {
      user,
      message: msg.message,
      type: "chat",
    });
  });

  socket.on("disconnect", () => {
    const user = usersBySocket.get(socket);

    if (user) {
      console.log(`user ${user.name} disconnected`);
      usersBySocket.delete(socket);
      usersByName.delete(user.name);
      io.emit("server-message", { type: "disconnect", user: user });
    }
  });
});

server.listen(3000, () => {
  console.log("Started on http://localhost:3000");
});
