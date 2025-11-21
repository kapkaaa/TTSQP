import React from 'react';

interface Leader {
  id: number;
  username: string;
  score_total: number;
}

interface Props {
  leaders: Leader[];
}

const Leaderboard: React.FC<Props> = ({ leaders }) => {
  return (
    <div className="leaderboard-component">
      <h3>Leaderboard</h3>
      <ul>
        {leaders.map((leader) => (
          <li key={leader.id}>
            {leader.username}: {leader.score_total} pts
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;