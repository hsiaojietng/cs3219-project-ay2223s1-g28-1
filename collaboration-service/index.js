import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors()); // config cors so that front-end can use
app.options('*', cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
  },
});
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
  });

  socket.on('code-changed', (roomId, code) => {
    socket.to(roomId).emit('update-code', code);
  });

  // leave-session: when user clicks on "leave session" button
  // disconnecting: when user closes tab/disconnects
  // Note: "disconnecting" used insted of "disconnect" because in this event,
  //        socket.rooms are not empty.
  const sessionEndEvents = ['leave-session', 'disconnecting'];

  for (const event of sessionEndEvents) {
    socket.on(event, () => {
      socket.rooms.forEach((room) => {
        if (room !== socket.id) {
          // Emit to other sockets in the same room this socket had joined
          socket
            .to(room)
            .emit('session-end', 'Your peer had left the session.', 'warning');
          io.socketsLeave(room);
        } else {
          // Emit back to the socket itself
          socket.emit('session-end', 'You had left the session.', 'info');
        }
      });
    });
  }
});

app.get('/', (req, res) => {
  res.send('Hello World from collaboration-service');
});

const PORT = 8003;
httpServer.listen(PORT, () =>
  console.log(`collaboration-service listening on port ${PORT}`)
);