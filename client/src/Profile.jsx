import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

class Profile extends React.Component {
  render() {
    return (
      <div className='profile'>
        <div>Username</div>
        <div>Messages: {}, Ratings: {}</div>
        <div>XP Bar</div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return { profile: state.profile };
}

export default connect(mapStateToProps, null)(Profile);

Profile.propTypes = {
  username: PropTypes.string,
  messages: PropTypes.number,
  ratings: PropTypes.number,
  xpToLevel: PropTypes.number,
  xpLevel: PropTypes.number,
  xpTotal: PropTypes.number,
}
