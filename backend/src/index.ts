import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import routes from "./routes";
import { registerSocketHandlers } from "./socketHandlers";

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(routes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true,
  },
  transports: ["websocket", "polling"],
  allowEIO3: true,
});

registerSocketHandlers(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
