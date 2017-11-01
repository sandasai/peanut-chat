/**
 * Returns the socket ids of all sockets in room
 * @param {*} io socket.io object
 * @param {String} room room name to check
 * @returns {Object} sockets
 */
function getSocketIds(io, room) {
  // Room does not exist yet since no one has joined, return empty array
  if (!io.sockets.adapter.rooms[room])
    return [];
  return io.sockets.adapter.rooms[room].sockets;
}

/**
 * 
 * @param {*} io socket.io object
 * @param {String} room room name that user is in
 * @param {Object} username username 
 */
function getSocketIdFromUsername(io, room, username) {
  const sockets = getSocketIds(io, room);
  for (let socketId in sockets) {
    if (io.sockets.connected[socketId].username === username)
      return socketId;
  }
}

function getSocketsInRoom(io, room) {
  const sockets = getSocketIds(io, room);
  const socketList = []
  for (let socketId in sockets) {
    socketList.push(io.sockets.connected[socketId])
  }
  return socketList;
}

module.exports = {
  getSocketIds,
  getSocketIdFromUsername,
  getSocketsInRoom
}