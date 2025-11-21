// components/CluesPanel.tsx
import React from 'react';
import { Clue } from '../types/crossword';

interface Props {
  across: Clue[];
  down: Clue[];
}

const CluesPanel: React.FC<Props> = ({ across, down }) => {
  return (
    <div className="clues-panel">
      <div className="clues-column">
        <h3 className="clues-heading">Across</h3>
        <div className="clues-list">
          {across.length === 0 ? (
            <p className="no-clues">Klik cell untuk lihat petunjuk</p>
          ) : (
            across.map((clue) => (
              <div key={`across-${clue.id}`} className="clue-item">
                <span className="clue-number">{clue.number}.</span>
                <span className="clue-text">{clue.clue_text}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="clues-column">
        <h3 className="clues-heading">Down</h3>
        <div className="clues-list">
          {down.length === 0 ? (
            <p className="no-clues">Klik cell untuk lihat petunjuk</p>
          ) : (
            down.map((clue) => (
              <div key={`down-${clue.id}`} className="clue-item">
                <span className="clue-number">{clue.number}.</span>
                <span className="clue-text">{clue.clue_text}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CluesPanel;