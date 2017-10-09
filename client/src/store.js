import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';

import { reducer as messages } from './services/messages';

const reducers = combineReducers(
  { 
    messages
  }  
);

export default createStore(reducers, applyMiddleware(thunk));