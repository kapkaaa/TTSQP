import React from 'react';
import { Clue } from '../types/crossword';

interface Props {
  clues: Clue[];
}

const CluesPanel: React.FC<Props> = ({ clues }) => {
  return (
    <div className="clues-panel">
      <h3>Clues</h3>
      <ul>
        {clues.map((clue) => (
          <li key={clue.id}>
            {clue.id}. {clue.text} ({clue.direction})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CluesPanel;