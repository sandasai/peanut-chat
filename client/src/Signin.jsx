import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { connection, Room, Messages } from './services';
import { actions } from './services/messages';

class Signin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
    };
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.onSignin(this.props.room, this.state.username);
  }

  render() {
    return (
      <div className='signin'>
        <form onSubmit={this.handleSubmit} className='signin-form'>
          <label>
            Enter a username
          </label>
          <input 
            type='text' 
            maxLength={20} 
            value={this.state.username} 
            onChange={(e) => this.setState({ username: e.target.value })}
          />
          <input type="submit" value="Submit" />
        </form>
        { this.props.messages.signInError &&
        <span>{this.props.messages.signInError}</span>
        }
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return { messages: state.messages };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ actions }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Signin);

Signin.propTypes = {
  onSignin: PropTypes.func,
  room: PropTypes.string.isRequired,
}