/**
 * Returns the socket ids of all sockets in room
 * @param {*} io socket.io object
 * @param {String} room room name to check
 * @returns {Object} sockets
 */
function getSocketIds(io, room) {
  return io.sockets.adapter.rooms[room].sockets;
}

/**
 * 
 * @param {*} io socket.io object
 * @param {String} room room name that user is in
 * @param {Object} username username 
 */
function getSocketIdFromUsername(io, room, username) {
  const sockets = getSocketsInRoom(io, room);
  for (let socketId in sockets) {
    if (io.sockets.connected[socketId].username === username)
      return socketId;
  }
}

module.exports = {
  getSocketIds,
  getSocketIdFromUsername
}