import React from 'react';

import PropTypes from 'prop-types';
import { connection, Room, Messages } from './services';

export default class Signin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
    };
  }

  componentDidMount = () => {
    //const socket = Messages.createSocket(this.props.room, 'ads');
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.onSignin(this.props.room, this.state.username);
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label id='signin-form'>
            Enter a username
            <input 
              type='text' 
              maxLength={20} 
              value={this.state.username} 
              onChange={(e) => this.setState({ username: e.target.value })}
            />
          </label>
          <input type="submit" value="Submit" />
        </form>
      </div>
    )
  }
}

Signin.propTypes = {
  onSignin: PropTypes.func,
  room: PropTypes.string.isRequired,
}