import React from 'react';

interface Props {
  grid: string[][];
  onCellChange: (row: number, col: number, value: string) => void;
  correctness: (boolean | undefined)[][];
}

const CrosswordGrid: React.FC<Props> = ({ grid, onCellChange, correctness }) => {
  return (
    <div className="grid">
      {grid.map((row, r) => (
        <div key={r} className="grid-row">
          {row.map((cell, c) => (
            <input
              key={`${r}-${c}`}
              type="text"
              maxLength={1}
              value={cell}
              onChange={(e) => onCellChange(r, c, e.target.value)}
              className={`cell ${correctness[r][c] === true ? 'correct' : correctness[r][c] === false ? 'incorrect' : ''}`}
              disabled={cell === '#'}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default CrosswordGrid;