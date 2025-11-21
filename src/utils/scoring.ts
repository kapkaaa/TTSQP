// utils/scoring.ts
export const calculateScore = (
  grid: (string | null)[][], 
  solution: (string | null)[][], 
  hintsUsed: number
): number => {
  let correctCells = 0;
  let totalCells = 0;

  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      // Skip null cells dan block cells
      if (solution[r][c] === null || solution[r][c] === '#') continue;
      
      totalCells++;
      if (grid[r][c] !== null && grid[r][c]?.toUpperCase() === solution[r][c]) {
        correctCells++;
      }
    }
  }

  const baseScore = totalCells > 0 ? (correctCells / totalCells) * 100 : 0;
  const penalty = hintsUsed * 5;
  return Math.max(0, Math.round(baseScore - penalty));
};