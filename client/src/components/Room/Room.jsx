import React from 'react';
import ReactDOM from 'react-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import { actions } from '../../services/messages';
import { Room as RoomService } from '../../services';

import Message from '../Message';
import Signin from '../Signin';
import Profile from '../Profile';
import Leaderboard from '../Leaderboard';
import { TopMessages } from '../Message';
import './room.css';

class Room extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showPanel: true,
      loading: true,
      scene: 'signin', // Either 'loading' 'signin' or 'room'
      messageInput: '',
      mode: 'default',
      delay: 0,
    };
  }

  componentDidMount() {
    // Check every second if any rerender is needed for showing delayed messages
    setInterval(() => {
      if (this.state.delay !== 0)
        this.setState({});
    }, 1000)
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
    this.props.sendMessage(this.state.messageInput, this.state.delay);
    this.setState({ messageInput: '' });
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  scrollToBottom = () => {
    if (this.messagesEnd)
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
    const currentEffectiveDate = new Date((Date.now() - 1000 * this.state.delay) + 3000);

    return (
      <ReactCSSTransitionGroup transitionName="message-transition" transitionEnterTimeout={500} transitionLeaveTimeout={500}>
        {
          messages.filter((message) => {
            return Date.parse(message.date) < Date.parse(currentEffectiveDate);
          }).map((message, index) => {
            return (
              <Message 
                key={index} 
                user={message.user} 
                message={message.message} 
                mode={this.state.mode === 'default' ? 'default' : 'select'}
                rating={message.rating}
                date={message.date}
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
          <div id='app'>
            <div id='main' className={`${this.state.showPanel ? 'pushed' : ''}`}>
              <div id='messages'>

                <div id='message-header'>
                  <Profile />
                </div>

                <ul>
                  {this.renderMessages()}
                  <div style={{ float:"left", clear: "both", height: 0 }} ref={(el) => { this.messagesEnd = el; }}></div>
                </ul>

                <div id='message-interact'>
                  <form id='message-form' onSubmit={this.handleMessageSend}>
                    <input id='message-box' type='text' value={this.state.messageInput} onChange={e => this.setState({ messageInput: e.target.value })}/>
                    <input id='message-submit' type='submit' />
                  </form>
                  <span>{this.props.messages.messageTimer}</span>
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
                  <label htmlFor="delay">Delay:</label>
                  <input id='delay'
                    type='text'
                    value={this.state.delay}
                    onChange={(e) => this.setState({ delay: e.target.value })}
                  />
                </form>
                <Leaderboard />
                <TopMessages />
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