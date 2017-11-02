import React from 'react';
import PropTypes from 'prop-types';
import './profile.css';

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