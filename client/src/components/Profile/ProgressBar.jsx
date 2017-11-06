import React from 'react';
import PropTypes from 'prop-types';
import './profile.css';

class ProgressBar extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      levelingUp: false,
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.filled === 0 && this.props.filled !== 0) {
      this.setState({ levelingUp: true });
      setTimeout(() => {
        this.setState({ levelingUp: false });
      }, 500)
    }
  }

  getColor = () => {
    const range = {
      0: '#d10000',
      1: '#ff6622',
      2: '#ffda21',
      3: '#33dd00',
      4: '#1133cc',
      5: '#220066',
      6: '#330044'
    };
    return range[this.props.level % 7];
  };

  render() {
    return (
      <div className='progress-bar'>
        <div className='progress-bar-meter'
          style={
            {
              width: this.state.levelingUp ? '100%' : `${this.props.filled}%`,
              backgroundColor: this.getColor()
            }
          }
        >
        </div>
        <div className='progress-bar-overlay'>
          {this.props.level}
        </div>
      </div>
    )
  }
}

export default ProgressBar;

ProgressBar.propTypes = {
  filled: PropTypes.number,
  level: PropTypes.number
}