import io from 'socket.io-client';
const serverAddress = 'http://localhost:3001';

export const Types = {
  disconnectReason: 'disconnectReason',
  createSocket: 'createSocket',
  onAuth: 'onAuth',
  emitSendMessage: 'emitSendMessage',
  onSentMessage: 'onSentMessage',
  emitRateMessage: 'emitRatemessage',
  onRatedMessage: 'onRatedMessage',
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
      console.log('Disconnected', data);
    })
    
    socket.on('auth', data => {
      // Officially authorized, can enter chat app.      
      if (data.success)
        dispatch({
          type: Types.onAuth,
          success: true,
          payload: socket,
        });

      else {
        dispatch({
          type: Types.onAuth,
          success: false,
          payload: data.reason,
        });
      }
    });
  
    socket.on('sent message', data => {
      dispatch({
        type: Types.onSentMessage,
        payload: data,
      });
    });

    socket.on('rated message', data => {
      dispatch({
        type: Types.onRatedMessage,
        payload: data,
      })
    });
  
  }
 
}

export function sendMessage(message, delay) {
  return (dispatch, getState) => {
    const socket = getState().messages.socket;
    socket.emit('send message', { message, delay });
  }
}

export function rateMessage(messageId, updown) {
  return (dispatch, getState) => {
    const socket = getState().messages.socket;
    socket.emit('rate message', { id: messageId, rating: updown});
  }
}