import { Server as IOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { NextApiResponse } from "next";

interface User {
  id: string;
  username: string;
}

const users = new Map<string, User>(); // socket.id => User
let io: IOServer;

export const setupSocket = (server: HTTPServer, res: NextApiResponse) => {
  if (!io) {
    io = new IOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      console.log("New client connected:", socket.id);

      socket.on("register", (username: string) => {
        // Check if username is already taken
        const isUsernameTaken = Array.from(users.values()).some(
          (user) => user.username === username
        );

        if (isUsernameTaken) {
          socket.emit("error", "Username is already taken");
          return;
        }

        // Register new user
        users.set(socket.id, { id: socket.id, username });
        console.log("User registered:", username);

        // Broadcast updated online users list
        const onlineUsers = Array.from(users.values()).map(
          (user) => user.username
        );
        io.emit("online-users", onlineUsers);
      });

      socket.on("private-message", ({ to, from, message }) => {
        // Find recipient's socket ID
        const recipientSocket = Array.from(users.entries()).find(
          ([_, user]) => user.username === to
        );

        if (recipientSocket) {
          const [recipientId] = recipientSocket;
          io.to(recipientId).emit("receive-message", {
            from,
            message,
          });
        }
      });

      socket.on("disconnect", () => {
        const user = users.get(socket.id);
        if (user) {
          console.log("User disconnected:", user.username);
          users.delete(socket.id);

          // Broadcast updated online users list
          const onlineUsers = Array.from(users.values()).map(
            (user) => user.username
          );
          io.emit("online-users", onlineUsers);
        }
      });
    });
  }

  res.end();
};
