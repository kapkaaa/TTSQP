export const calculateScore = (
    grid: string[][],
    solution: string[][],
    hintsUsed: number
  ): number => {
    let correct = 0;
    const total = grid.flat().filter(c => c !== '#').length;
  
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[0].length; c++) {
        if (grid[r][c] === solution[r][c]) correct++;
      }
    }
  
    let score = Math.floor((correct / total) * 100);
    score -= hintsUsed * 10; // Potong 10 poin per hint
    return Math.max(0, score);
  };