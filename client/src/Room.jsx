import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actions } from './services/messages';
import { Room as RoomService } from './services';
import Signin from './Signin';

class Room extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showPanel: true,
      loading: true,
      scene: 'signin', // Either 'loading' 'signin' or 'room'
      message: '',
    };
  }

  handleSignin = (room, username) => {
    this.props.createSocket(room, username);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.messages.socket)
      this.setState({ scene: 'room' });
  }

  handleMessageSend = (e) => {
    e.preventDefault();
    this.props.sendMessage(this.state.message, 0);
  }

  renderMessages = () => {
    const { messages } = this.props.messages;
    return messages.map((message, index) => {
      return (
        <li key={index}>
          {`${message.user}: ${message.message}`}
        </li>
      );
    });
  }

  render() {
    const { room } = this.props.match.params;

    switch(this.state.scene) {
      case 'loading': 
        return (
          <div><h1>loading</h1></div>
        )
      case 'signin':
        return (
          <Signin onSignin={this.handleSignin} room={room}/>
        )
      case 'room':
        return (
          <div>
            <div id='main' className={`${this.state.showPanel ? 'pushed' : ''}`}>
              <div id='messages'>
                <ul>
                  {this.renderMessages()}
                </ul>
              </div>
              <a onClick={() => this.setState({ showPanel: !this.state.showPanel})}>
                <i id="gear" className="fa fa-cog" aria-hidden="true"></i>
              </a>
              {
                this.state.loading && 
                <h1>loading</h1>
              }
              <form id='message-form' onSubmit={this.handleMessageSend}>
                <input id='message-box' type='text' value={this.state.message} onChange={e => this.setState({ message: e.target.value })}/>
                <input id='message-submit' type='submit' />
              </form>
            </div>
            <div className={`sidenav ${this.state.showPanel ? 'visible' : 'hidden'}`}>
            </div>
          </div>
        )
      default:
        return (
          <div><h1>error</h1></div>
        )
    }
  }
}

const mapStateToProps = (state) => {
  return { messages: state.messages };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ ...actions }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Room);