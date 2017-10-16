import React from 'react';
import PropTypes from 'prop-types';

const ProgressBar = (props) => {
  return (
    <div className='progress-bar'>
      <div className='progress-bar-meter' style={{ width: `${props.filled}%`}} />
    </div>
  )
}

export default ProgressBar;

ProgressBar.propTypes = {
  filled: PropTypes.number,
}