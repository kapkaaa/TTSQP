// components/CrosswordGrid.tsx
import React from 'react';

// components/CrosswordGrid.tsx
interface Props {
  grid: (string | null)[][];  // Update dari string[][]
  onCellChange: (row: number, col: number, value: string) => void;
  correctness: (boolean | undefined)[][];
  clueNumbers: (number | null)[][];
  onCellClick: (row: number, col: number) => void;
  activeCell: { row: number; col: number } | null;
}

// components/CrosswordGrid.tsx
const CrosswordGrid: React.FC<Props> = ({ 
  grid, 
  onCellChange, 
  correctness, 
  clueNumbers, 
  onCellClick, 
  activeCell 
}) => {
  if (grid.length === 0 || grid[0]?.length === 0) return null;

  const rows = grid.length;
  const cols = grid[0].length;

  return (
    <div className="crossword-grid-container">
      <div
        className="crossword-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gap: '0',
          border: '2px solid #3498db',
          borderRadius: '8px',
          padding: '1px',
          backgroundColor: '#fff',
        }}
      >
        {grid.map((row, r) =>
          row.map((cell, c) => {
            // SKIP cell yang NULL (tidak ada di database)
            if (cell === null) {
              return (
                <div
                  key={`${r}-${c}`}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                  }}
                />
              );
            }

            const isBlock = cell === '#';
            const clueNumber = clueNumbers[r][c];
            const isCorrect = correctness[r][c] === true;
            const isIncorrect = correctness[r][c] === false;
            const isEmpty = cell === '';
            const isSelected = activeCell?.row === r && activeCell?.col === c;

            return (
              <div
                key={`${r}-${c}`}
                className={`crossword-cell ${isBlock ? 'block' : 'blank'} ${
                  isSelected ? 'selected' : ''
                }`}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: isBlock ? 'none' : '1px solid #ddd',
                  backgroundColor: isBlock ? '#000' : '#fff',
                  color: isBlock ? '#fff' : '#333',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  transition: 'all 0.2s ease',
                  cursor: isBlock ? 'default' : 'pointer',
                }}
                onClick={() => !isBlock && onCellClick(r, c)}
              >
                {!isBlock && clueNumber !== null && (
                  <span
                    className="clue-number"
                    style={{
                      position: 'absolute',
                      top: '2px',
                      left: '2px',
                      fontSize: '0.65rem',
                      color: '#3498db',
                      fontWeight: 'bold',
                      pointerEvents: 'none',
                      zIndex: 1,
                    }}
                  >
                    {clueNumber}
                  </span>
                )}

                <input
                  type="text"
                  maxLength={1}
                  value={cell}
                  onChange={(e) => onCellChange(r, c, e.target.value)}
                  disabled={isBlock}
                  className="crossword-input"
                  style={{
                    width: '100%',
                    height: '100%',
                    textAlign: 'center',
                    border: 'none',
                    background: 'transparent',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    outline: 'none',
                    color: isCorrect ? '#0a7e4c' : isIncorrect ? '#d93025' : '#333',
                    caretColor: '#007bff',
                    textTransform: 'uppercase',
                  }}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CrosswordGrid;