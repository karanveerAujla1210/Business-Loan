let io = null;
const userMap = new Map(); // socket.id => customerID

module.exports = {
  init: (server) => {
    const { Server } = require("socket.io");
    io = new Server(server, {
      cors: {
        origin: "*",
      },
    });

    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      socket.on("register", (customerID) => {
        userMap.set(socket.id, customerID);
        socket.join(customerID);
        console.log(`Socket ${socket.id} joined room: ${customerID}`);
      });

      socket.on("disconnect", () => {
        const cid = userMap.get(socket.id);
        console.log(`Client disconnected: ${socket.id} (${cid})`);
        userMap.delete(socket.id);
      });
    });

    return io;
  },

  getIO: () => {
    if (!io) throw new Error("Socket.io not initialized!");
    return io;
  },
};
