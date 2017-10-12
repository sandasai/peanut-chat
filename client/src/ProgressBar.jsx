import React from 'react';
import PropTypes from 'prop-types';

export default class ProgressBar extends React.Component {
  render() {
    return (
      <div className='progress-bar'>
        <div className='progress-bar-meter' style={{ width: `${this.props.filled}%`}} />
      </div>
    )
  }
}

ProgressBar.propTypes = {
  filled: PropTypes.number,
}