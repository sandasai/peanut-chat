import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { connection, Room, Messages } from '../../services';
import { actions } from '../../services/messages';
import './signin.css'

class Signin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      scene: 'signin', // or createroom,
      password: '',
      timeout: false,
      roomSettings: {}
    };
  }

  componentDidMount() {
    // See whether the room has been created
    fetch(`/api/rooms/${this.props.room}`, {
      method: 'GET',
      headers: { "Content-Type": "application/json" },
    }).then(res => res.json())
      .then(res => {
        if (!res.room) {
          this.setState({ scene: 'createroom' });
        } else {
          this.setState({ roomSettings: res.settings });
        }
      })
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { timeout, password } = this.state
    if (this.state.scene === 'createroom') {
      fetch('/api/rooms', {
        method: 'POST',
        body: JSON.stringify({
          room: this.props.room,
          timeout,
          password
        }),
        headers: { "Content-Type": "application/json" },
      }).then(res => res.json())
        .then(res => {
          if (res.success)
            this.props.onSignin(this.props.room, this.state.username, this.state.password)
        })
    }
    else {
      this.props.onSignin(this.props.room, this.state.username, this.state.password);
    }
  }

  render() {
    return (
      <div className='signin'>
        <div className='signin-wrapper'>
          { this.state.scene === 'createroom' &&
          <h1>You're the first one here to room <strong>{this.props.room}</strong>. Setup some rules!</h1>
          }
          <form onSubmit={this.handleSubmit} className='signin-form'>
            <div className="field">
              <label className="label">
                Username
              </label>
              <div className="control">
                <input 
                  className="input"
                  type='text' 
                  placeholder="Enter a username"
                  maxLength={20}
                  value={this.state.username} 
                  onChange={(e) => this.setState({ username: e.target.value })}
                />
              </div>
            </div>
            {(this.state.roomSettings.password !== null || this.state.scene === 'createroom') &&
            <div className="field">
              <label className="label">
                Password{this.state.scene === 'createroom' ? '?' : ''}
              </label>
              <div className="control">
                <input
                  className="input"
                  type={this.state.scene === 'createroom' ? 'text' : 'password'}
                  placeholder={this.state.scene === 'createroom' ? 'Leave blank for no password' : ''}
                  maxLength={20}
                  value={this.state.password}
                  onChange={(e) => this.setState({ password: e.target.value })}
                />
              </div>
            </div>
            }
            { this.state.scene === 'createroom' &&
            <div>
              <div className="field">
                <div className="control">
                  <label className="checkbox">
                    <input 
                      type="checkbox" 
                      checked={this.state.timeout}
                      onChange={() => { this.setState({ timeout: !this.state.timeout }) }}
                    />
                      &nbsp;Add Messaging and Rating timeout?
                  </label>
                </div>
              </div>
            </div>
            }
            <div className="field">
              <div className="control">
                <button type="submit" className="button is-primary is-fullwidth">
                  {this.state.scene === 'createroom' ? 'Create Room' : 'Join Room' }
                </button>
              </div>
            </div>        
          </form>
          { this.props.messages.signInError &&
          <span>{this.props.messages.signInError}</span>
          }
        </div>
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