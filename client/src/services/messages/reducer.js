import { Types } from './actions';

const initialState = {
  socket: null,
  messages: [],
}

export default function messages(state = initialState, action) {
  switch(action.type) {
    case Types.createSocket: 
      return { ...state, socket: action.payload };
    case Types.onSentMessage:
      return { ...state, messages: [...state.messages, action.payload] };
    default:
      return state;
  }
}
