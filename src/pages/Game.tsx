import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { useCrossword } from '../hooks/useCrossword';
import CrosswordGrid from '../components/CrosswordGrid';
import CluesPanel from '../components/CluesPanel';
import { calculateScore } from '../utils/scoring';
import { supabase } from '../lib/supabase';

const Game: React.FC = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const numericLevelId = Number(levelId);

  const { level, loading } = useCrossword(numericLevelId);
  const [grid, setGrid] = useState<string[][]>([]);
  const [solution, setSolution] = useState<string[][]>([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [maxHints] = useState(3);
  const [correctness, setCorrectness] = useState<(boolean | undefined)[][]>([]);

  useEffect(() => {
    if (level) {
      const grid: string[][] = JSON.parse(level.grid_json);
      const sol = grid.map((row: string[]) =>
        row.map((cell: string) => (cell === '#' ? '#' : ''))
      );
      setGrid(grid);
      setSolution(sol);
      initializeCorrectness(grid);
    }
  }, [level]);

  const initializeCorrectness = (grid: string[][]) => {
    const newCorrectness = grid.map(row =>
      row.map(() => undefined as boolean | undefined)
    );
    setCorrectness(newCorrectness);
  };

  const handleCellChange = (r: number, c: number, value: string) => {
    const newGrid = [...grid];
    newGrid[r][c] = value.toUpperCase();
    setGrid(newGrid);

    const newCorrectness = [...correctness];
    if (value.toUpperCase() === solution[r][c]) {
      newCorrectness[r][c] = true;
    } else if (value) {
      newCorrectness[r][c] = false;
    } else {
      newCorrectness[r][c] = undefined;
    }
    setCorrectness(newCorrectness);
  };

  const useHint = () => {
    if (hintsUsed >= maxHints) return;

    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[0].length; c++) {
        if (grid[r][c] !== '#' && !grid[r][c]) {
          const newGrid = [...grid];
          newGrid[r][c] = solution[r][c];
          setGrid(newGrid);

          const newCorrectness = [...correctness];
          newCorrectness[r][c] = true;
          setCorrectness(newCorrectness);

          setHintsUsed(prev => prev + 1);
          return;
        }
      }
    }
  };

  const submitScore = async () => {
    const score = calculateScore(grid, solution, hintsUsed);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await supabase.from('player_progress').upsert({
        user_id: user.id,
        level_id: numericLevelId,
        hints_used: hintsUsed,
        score,
        completed: true,
      });
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="game">
      <button onClick={useHint} disabled={hintsUsed >= maxHints}>
        Hint ({hintsUsed}/{maxHints})
      </button>
      <button onClick={submitScore}>Submit</button>
      <div className="game-content">
        <CrosswordGrid
          grid={grid}
          onCellChange={handleCellChange}
          correctness={correctness}
        />
        <CluesPanel clues={JSON.parse(level!.clues_json)} />
      </div>
    </div>
  );
};

export default Game;
