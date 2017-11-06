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
          date={message.date}
        />
      )
    })
  }

  render() {
    console.log('top', this.props.messages)
    return (
      <ul>
        Top Messages
        {this.renderMessages()}
      </ul>
    )
  }
}

const mapStateToProps = (state) => {
  return { messages: state.messages.topMessages }
}

export default connect(mapStateToProps)(TopMessages)