// CrosswordGrid.tsx
import React from 'react';

interface Props {
  grid: string[][];
  onCellChange: (row: number, col: number, value: string) => void;
  correctness: (boolean | undefined)[][];
  clueNumbers: (number | null)[][];
}

const CrosswordGrid: React.FC<Props> = ({ grid, onCellChange, correctness, clueNumbers }) => {
  return (
    <div className="grid" style={{ display: 'inline-grid', gridTemplateColumns: `repeat(${grid[0].length}, 1fr)` }}>
      {grid.map((row, r) =>
        row.map((cell, c) => {
          const isBlock = cell === '#';
          const clueNumber = clueNumbers[r][c];
          return (
            <div
              key={`${r}-${c}`}
              className={`cell-container ${correctness[r][c] === true ? 'correct' : correctness[r][c] === false ? 'incorrect' : ''}`}
              style={{ position: 'relative', width: '30px', height: '30px' }}
            >
              {isBlock ? (
                <div className="cell block" style={{ width: '100%', height: '100%', backgroundColor: 'black' }}></div>
              ) : (
                <>
                  <input
                    type="text"
                    maxLength={1}
                    value={cell}
                    onChange={(e) => onCellChange(r, c, e.target.value)}
                    className="cell"
                    style={{
                      width: '100%',
                      height: '100%',
                      textAlign: 'center',
                      fontSize: '14px',
                      border: '1px solid #ccc',
                      boxSizing: 'border-box'
                    }}
                    disabled={isBlock}
                  />
                  {clueNumber !== null && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '0',
                        left: '2px',
                        fontSize: '0.6em',
                        lineHeight: '0.7em'
                      }}
                    >
                      {clueNumber}
                    </span>
                  )}
                </>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default CrosswordGrid;