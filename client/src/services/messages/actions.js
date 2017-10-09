import socketIOClient from 'socket.io-client';
const serverAddress = 'http://localhost:3001';

export const Types = {
  createSocket: 'createSocket',
  sendMessage: 'sendMessage',
}

export function createSocket(room, username) {
  const socket = socketIOClient(`${serverAddress}`, {
    query: {
      room,
      username,
    }
  });
  socket.on('connect', () => {
    console.log('connected');
  });
  socket.on('disconnectReason', data => {
    console.log('blarg', data);
  })
  socket.on('auth', data => {
    // Officially authorized, can enter chat app.
    console.log(data);
  });

  /**
   * Events to emit
   *  sending a message
   *  rating a messasge
   * 
   * Events to recieve
   *  auth - when logged in and connected to room
   *  recieving a message
   *  rating a message
   *  xp/gaming update
   *  
   * To code on the client
   *  chat delay
   *  redux for storing message data, user data and settings
   *  cannot send on chat timeout
   */  

  return { 
    type: Types.createSocket,
    payload: socket
  };
}

export function sendMessage(message) {
  return (dispatch, getState) => {
    const socket = getState().messages.socket;
    socket.emit('send message', { message, delay: 0 });
  }
}