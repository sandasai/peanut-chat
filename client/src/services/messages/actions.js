import io from 'socket.io-client';
const serverAddress = 'http://localhost:3001';

export const Types = {
  disconnectReason: 'disconnectReason',
  createSocket: 'createSocket',
  onAuth: 'onAuth',
  emitSendMessage: 'emitSendMessage',
  onSentMessage: 'onSentMessage',
}
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

export function createSocket(room, username) {
  return (dispatch, getStore) => {
    const socket = io(`${serverAddress}`, {
      query: {
        room,
        username,
      }
    });
    
    // Setting up handlers
    socket.on('disconnectReason', data => {
      console.log('blarg', data);
    })
    socket.on('auth', data => {
      // Officially authorized, can enter chat app.
      dispatch({
        type: Types.onAuth,
        payload: data,
      });
    });
  
    socket.on('sent message', data => {
      console.log(data);
      dispatch({
        type: Types.onSentMessage,
        payload: data,
      });
    });
  
  
    // Store the socket
    dispatch({ 
      type: Types.createSocket,
      payload: socket
    });
  }
 
}

export function sendMessage(message, delay) {
  return (dispatch, getState) => {
    const socket = getState().messages.socket;
    socket.emit('send message', { message, delay });
  }
}