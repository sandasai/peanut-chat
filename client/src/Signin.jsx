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
        <form onSubmit={this.handleSubmit}>
          <label id='signin-form'>
            Enter a username
            <br/> 
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