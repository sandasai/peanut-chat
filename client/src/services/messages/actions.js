import io from 'socket.io-client';

export const Types = {
  disconnectReason: 'disconnectReason',
  createSocket: 'createSocket',
  onAuth: 'onAuth',
  emitSendMessage: 'emitSendMessage',
  onSentMessage: 'onSentMessage',
  emitRateMessage: 'emitRatemessage',
  onRatedMessage: 'onRatedMessage',
  onChangedXp: 'onChangedXp',
  onUpdatedProfile: 'onUpdatedProfile',
}

export function createSocket(room, username) {
  const port = (process.env.REACT_APP_PORT || 5050);
  const serverAddress = `http://localhost:${port}`;
  
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
          username: data.username,
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
      });
    });

    socket.on('changed xp', data => {
      dispatch({
        type: Types.onChangedXp,
        payload: data,
      });
    });

    socket.on('updated profile', data => {
      dispatch({
        type: Types.onUpdatedProfile,
        payload: data,
      });
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