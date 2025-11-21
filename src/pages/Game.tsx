// Game.tsx
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

  const { level, clues, cells, loading } = useCrossword(numericLevelId);

  const [grid, setGrid] = useState<string[][]>([]);
  const [solution, setSolution] = useState<string[][]>([]);
  const [gridClueNumbers, setGridClueNumbers] = useState<(number | null)[][]>([]); // Untuk nomor clue di grid

  const [hintsUsed, setHintsUsed] = useState(0);
  const maxHints = 3;

  const [correctness, setCorrectness] = useState<(boolean | undefined)[][]>([]);

  // ------------------------------------------------------------
  //  BANGUN GRID DARI CELL DATABASE
  // ------------------------------------------------------------
  useEffect(() => {
    if (!level || !cells.length) return;

    const rows = level.height;
    const cols = level.width;
    const newGrid: string[][] = Array(rows).fill(null).map(() => Array(cols).fill(''));
    const newSolution: string[][] = Array(rows).fill(null).map(() => Array(cols).fill(''));
    const newCorrectness: (boolean | undefined)[][] = Array(rows).fill(null).map(() => Array(cols).fill(undefined));
    const newGridClueNumbers: (number | null)[][] = Array(rows).fill(null).map(() => Array(cols).fill(null));

    // Buat peta cell berdasarkan posisi
    const cellMap = new Map<string, any>();
    cells.forEach(cell => {
      const key = `${cell.row},${cell.col}`;
      cellMap.set(key, cell);
    });

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = cellMap.get(`${r},${c}`);
        if (cell) {
          if (cell.type === 'block') {
            newGrid[r][c] = '#';
            newSolution[r][c] = '#';
          } else {
            newGrid[r][c] = '';
            newSolution[r][c] = cell.solution_letter || '';
            // Simpan nomor clue jika ada
            if (cell.clue_across_id || cell.clue_down_id) {
                // Cari clue terkecil yang terkait dengan cell ini
                const cellClues = clues.filter(clue => clue.id === cell.clue_across_id || clue.id === cell.clue_down_id);
                if (cellClues.length > 0) {
                    const minNumber = Math.min(...cellClues.map(clue => clue.number));
                    newGridClueNumbers[r][c] = minNumber;
                }
            }
          }
        } else {
          // Jika tidak ada data cell, asumsikan blank
          newGrid[r][c] = '';
          newSolution[r][c] = '';
        }
      }
    }

    setGrid(newGrid);
    setSolution(newSolution);
    setCorrectness(newCorrectness);
    setGridClueNumbers(newGridClueNumbers);
  }, [level, cells]);

  // ------------------------------------------------------------
  // INPUT PER HURUF
  // ------------------------------------------------------------
  const handleCellChange = (r: number, c: number, value: string) => {
    if (solution[r][c] === '#') return; // Jangan proses jika block

    const newGrid = grid.map(row => [...row]);
    newGrid[r][c] = value.toUpperCase();
    setGrid(newGrid);

    const newCorrect = correctness.map(row => [...row]);
    const input = value.toUpperCase();
    const correct = solution[r][c];

    if (!input) newCorrect[r][c] = undefined;
    else newCorrect[r][c] = input === correct;

    setCorrectness(newCorrect);
  };

  // ------------------------------------------------------------
  // HINT
  // ------------------------------------------------------------
  const useHint = () => {
    if (hintsUsed >= maxHints) return;

    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[0].length; c++) {
        if (grid[r][c] === "" && solution[r][c] !== "#") {
          const newGrid = grid.map(row => [...row]);
          newGrid[r][c] = solution[r][c];
          setGrid(newGrid);

          const newCorrect = correctness.map(row => [...row]);
          newCorrect[r][c] = true;
          setCorrectness(newCorrect);

          setHintsUsed(hintsUsed + 1);
          return;
        }
      }
    }
  };

    // ------------------------------------------------------------
  // SIMPAN PROGRESS KE SUPABASE (TABLE "player_progress")
  // ------------------------------------------------------------
  const submitScore = async () => {
    const score = calculateScore(grid, solution, hintsUsed);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return alert("Login dulu!");

    // Cek apakah sudah ada progress sebelumnya
    const { data: existingProgress, error: fetchError } = await supabase
      .from("player_progress")
      .select("completed, completed_at")
      .eq("user_id", user.id)
      .eq("level_id", numericLevelId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 artinya tidak ada data
      console.error("Error fetching existing progress:", fetchError);
      return;
    }

    const isCompleted = grid.flat().every((cell, index) => {
      const r = Math.floor(index / grid[0].length);
      const c = index % grid[0].length;
      if (solution[r][c] === '#') return true; // Lewati block
      return cell.toUpperCase() === solution[r][c];
    });

    // Gunakan completed_at yang lama jika sebelumnya sudah selesai, atau waktu sekarang jika baru selesai
    const finalCompletedAt = existingProgress?.completed 
      ? existingProgress.completed_at // Gunakan waktu selesai sebelumnya
      : isCompleted 
        ? new Date().toISOString() // Simpan waktu sekarang jika baru selesai
        : null; // Gunakan null jika belum selesai

    const { error: upsertError } = await supabase
      .from("player_progress")
      .upsert({
        user_id: user.id,
        level_id: numericLevelId,
        score,
        hints_used: hintsUsed,
        completed: isCompleted,
        completed_at: finalCompletedAt
      }, { onConflict: 'user_id, level_id' }); 

    if (upsertError) {
      console.error("Error saving progress:", upsertError);
      alert("Gagal menyimpan progress.");
    } else {
      alert("Progress berhasil disimpan!");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!level || grid.length === 0 || grid[0]?.length === 0) return <div>Level tidak ditemukan atau grid kosong</div>;

  // Pisahkan clue untuk panel
  const acrossClues = clues.filter(c => c.direction === 'across').sort((a, b) => a.number - b.number);
  const downClues = clues.filter(c => c.direction === 'down').sort((a, b) => a.number - b.number);

  return (
    <div className="game">
      <h2>{level.title}</h2>
      <p>{level.description}</p>

      <div className="game-controls">
        <button onClick={useHint} disabled={hintsUsed >= maxHints}>
          Hint ({hintsUsed}/{maxHints})
        </button>

        <button onClick={submitScore}>
          Simpan Progress
        </button>
      </div>

      <div className="game-content">
        {/* Hanya render CrosswordGrid jika grid sudah siap */}
        {grid.length > 0 && grid[0]?.length > 0 && (
          <CrosswordGrid
            grid={grid}
            onCellChange={handleCellChange}
            correctness={correctness}
            clueNumbers={gridClueNumbers}
          />
        )}

        <CluesPanel
          across={acrossClues}
          down={downClues}
        />
      </div>
    </div>
  );
};

export default Game;