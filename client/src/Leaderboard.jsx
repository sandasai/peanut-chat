import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

class Leaderboard extends React.Component {
  renderScores = () => {
    const scores = this.props.leaderboard;
    return scores.map((score) => {
      return (
        <tr key={score.username}>
          <td>{ score.username }</td>
          <td>{ score.xp }</td>
          <td>{ score.messages }</td>
        </tr>
      )
    });
  }

  render () {
    return (
      <table>
        <tr>
          <th>User</th>
          <th>XP</th>
          <th>Messages</th>
        </tr>
        {
          this.renderScores()
        }
      </table>
    )
  }
}

const mapStateToProps = (state) => {
  return { leaderboard: state.messages.leaderboard };
};

export default connect(mapStateToProps)(Leaderboard);
