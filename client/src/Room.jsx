import React from 'react';
import ReactDOM from 'react-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import Message from './Message';
import { actions } from './services/messages';
import { Room as RoomService } from './services';
import Signin from './Signin';
import Profile from './Profile';

class Room extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showPanel: true,
      loading: true,
      scene: 'signin', // Either 'loading' 'signin' or 'room'
      messageInput: '',
      mode: 'default'
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
    this.setState({ messageInput: '' });
    this.props.sendMessage(this.state.messageInput, 0);
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  scrollToBottom = () => {
    ReactDOM.findDOMNode(this.messagesEnd).scrollIntoView({ behavior: "smooth" });
  }

  handleRate = (id) => {
    this.props.rateMessage(id, this.state.mode === 'thumbs-up' ? 'up' : 'down');
    this.setState({
      mode: 'default',
    })
  }

  renderMessages = () => {
    const { messages } = this.props.messages;
    return (
      <ReactCSSTransitionGroup transitionName="message-transition" transitionEnterTimeout={500} transitionLeaveTimeout={500}>
        {
          messages.map((message, index) => {
            return (
              <Message 
                key={index} 
                user={message.user} 
                message={message.message} 
                mode={this.state.mode === 'default' ? 'default' : 'select'}
                rating={message.rating}
                onRate={() => this.handleRate(message.id)}
              />
            )
          })
        }
      </ReactCSSTransitionGroup>
    );
  }

  changeMode = (mode) => {
    if (this.state.mode === mode)
      this.setState({ mode: 'default'});
    else
      this.setState({ mode });
  }

  render() {
    const { room } = this.props.match.params;

    switch(this.state.scene) {
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
                  <div style={{ float:"left", clear: "both" }} ref={(el) => { this.messagesEnd = el; }}></div>
                </ul>
                <div id='message-interact'>
                  <form id='message-form' onSubmit={this.handleMessageSend}>
                    <input id='message-box' type='text' value={this.state.messageInput} onChange={e => this.setState({ messageInput: e.target.value })}/>
                    <input id='message-submit' type='submit' />
                  </form>
                  <a onClick={() => this.changeMode('thumbs-up')}>
                    <i className="fa fa-thumbs-up rate up" aria-hidden="true"></i>
                  </a>
                  <a onClick={() => this.changeMode('thumbs-down')}>
                    <i className="fa fa-thumbs-down rate down" aria-hidden="true"></i>
                  </a>
                </div>
              </div>
              <a onClick={() => this.setState({ showPanel: !this.state.showPanel})}>
                <i id="gear" className="fa fa-cog" aria-hidden="true"></i>
              </a>
            </div>
            <div className={`sidenav ${this.state.showPanel ? 'visible' : 'hidden'}`}>
              <div className='sidenav-content'>
                <form>
                  <label for="delay">Delay:</label>
                  <input id='delay' type='text' />
                </form>
                <Profile />
              </div>
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