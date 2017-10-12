import { Types } from './actions';

const initialState = {
  socket: null,
  signInError: null,
  messages: [],
  profile: {
    delay: 0,
    level: 0,
    xpToLevel: 0,
    xpLevel: 0,
    xpTotal: 0,
  },
  scene: 'signin',
}

// Sorts messages by date
function sortMessages(messages) {
  messages.sort((a, b) => {
    const aMili = Date.parse(a.date);
    const bMili = Date.parse(b.date);
    if (aMili < bMili)
      return -1
    else if (aMili > bMili)
      return 1;
    else 
      return 0;
  });
}

export default function messages(state = initialState, action) {
  switch(action.type) {
    case Types.onAuth: 
      if (action.success)
        return { ...state, socket: action.payload };
      else
        return { ...state, socket: null, signInError: action.payload }

    case Types.onSentMessage:
      const newMessages = [...state.messages, action.payload];
      newMessages.sort((a, b) => {
        const aMili = Date.parse(a.date);
        const bMili = Date.parse(b.date);
        if (aMili < bMili)
          return -1
        else if (aMili > bMili)
          return 1;
        else 
          return 0;
      });
      return { ...state, messages: newMessages };

    case Types.onRatedMessage: 
      const { id, rating } = action.payload;
      const foundMessage = state.messages.find((message) => {
        return message.id === action.payload.id;
      })
      foundMessage.rating = rating;
      return { ...state };

    default:
      return state;
  }
}
