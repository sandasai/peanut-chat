import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ProgressBar from './ProgressBar';

class Profile extends React.Component {
  render() {
    console.log(this.props.profile);
    const { username, messageCount, ratings, xp, level, nextLevelXp } = this.props.profile;
    const filled = (xp / (nextLevelXp - level - 1) - 1) * 100;
    console.log(filled);

    return (
      <div className='profile'>
        <div>{username}</div>
        <div>Messages: {messageCount}</div>
        <div><ProgressBar filled={nextLevelXp} /></div>
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
