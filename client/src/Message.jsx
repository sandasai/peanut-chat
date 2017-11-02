import React from 'react';
import PropTypes from 'prop-types';
import dateformat from 'dateformat';

export default class Message extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hovering: false,
    };
  }

  handleClick = (e) => {
    if (this.props.mode === 'select')
      this.props.onRate();
  }

  render() {
    const { hovering } = this.state;
    const { user, message, date, mode, rating } = this.props;
    return (
      <li 
        className={`message-item ${mode === 'select' ? 'select' : ''} ${hovering ? 'hover' : ''}`}
        onMouseEnter={() => this.setState({ hovering: true })}
        onMouseLeave={() => this.setState({ hovering: false})}
        onClick={this.handleClick}
      >
        {`${user} (${dateformat(date, "longTime")}): ${message}`}
        <div className='message-item-rating'>{rating}</div>
      </li>
    )
  }
}

Message.propTypes = {
  user: PropTypes.string,
  message: PropTypes.string,
  id: PropTypes.string,
  date: PropTypes.object,
  mode: PropTypes.oneOf(['default', 'select']),
  onRate: PropTypes.func,
  rating: PropTypes.number,
}

Message.defaultProps = {
  mode: 'default',
}