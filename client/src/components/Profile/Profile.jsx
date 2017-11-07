import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ProgressBar from './ProgressBar';

class Profile extends React.Component {
  render() {
    const { username, messageCount, xp, level, nextLevelXp, startLevelXp } = this.props.profile;
    const filled = (xp - startLevelXp) / (nextLevelXp - startLevelXp) * 100

    return (
      <div className='profile'>
        <div><strong>{username}</strong></div>
        <div><strong>Messages: {messageCount}</strong></div>
        <ProgressBar filled={filled} level={level}/>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return { profile: state.messages.profile };
}

export default connect(mapStateToProps, null)(Profile);

Profile.propTypes = {
  username: PropTypes.string,
  messageCount: PropTypes.number,
  xp: PropTypes.number,
  level: PropTypes.number,
  nextLevelXp: PropTypes.number,
}
