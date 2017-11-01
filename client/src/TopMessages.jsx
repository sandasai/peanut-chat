import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import Message from './Message';

class TopMessages extends React.Component {
  renderMessages () {
    return this.props.messages.map((message, index) => {
      return (
        <Message 
          key={index} 
          user={message.user} 
          message={message.message} 
          mode='default'
          rating={message.rating}
        />
      )
    })
  }

  render() {
    console.log(this.props.messages);
    return (
      <ul>
        Top Messages
        <hr />
        {this.renderMessages()}
      </ul>
    )
  }
}

const mapStateToProps = (state) => {
  return { messages: state.messages.topMessages }
}

export default connect(mapStateToProps)(TopMessages)