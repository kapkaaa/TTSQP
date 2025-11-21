// CluesPanel.tsx
import React from 'react';
import { Clue } from '../types/crossword';

interface Props {
  across: Clue[];
  down: Clue[];
}

const CluesPanel: React.FC<Props> = ({ across, down }) => {
  return (
    <div className="clues">
      <div className="clues-column">
        <h3>Across</h3>
        {across.map(c => (
          <div key={`across-${c.id}`} className="clue-item">
            <strong>{c.number}.</strong> {c.clue_text}
          </div>
        ))}
      </div>

      <div className="clues-column">
        <h3>Down</h3>
        {down.map(c => (
          <div key={`down-${c.id}`} className="clue-item">
            <strong>{c.number}.</strong> {c.clue_text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CluesPanel;