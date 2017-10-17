import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect, Link } from 'react-router-dom';
import Room from './Room';

class App extends Component {
  componentDidMount() {
    console.log('Process vars', process.env);
  }
  render() {
    return (
      <Router>
        <Switch>
          <Route exact path='/'>
            <div className="app-header">
              <h1>Peanut Gallery</h1>
              <p>
                To join or create a room, modify the url
              </p>
            </div>
          </Route>
          <Route path='/:room' component={Room}/>
        </Switch>
      </Router>
    );
  }
}

export default App;
