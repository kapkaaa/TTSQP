// pages/Game.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { useCrossword } from '../hooks/useCrossword';
import CrosswordGrid from '../components/CrosswordGrid';
import CluesPanel from '../components/CluesPanel';
import { calculateScore } from '../utils/scoring';
import { supabase } from '../lib/supabase';
import { Clue } from '../types/crossword'; 

const Game: React.FC = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const numericLevelId = Number(levelId);

  const { level, clues, cells, gridBounds, loading } = useCrossword(numericLevelId);

 // Ubah state type dari string[][] menjadi (string | null)[][]
  const [grid, setGrid] = useState<(string | null)[][]>([]);
  const [solution, setSolution] = useState<(string | null)[][]>([]);
  const [gridClueNumbers, setGridClueNumbers] = useState<(number | null)[][]>([]);
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null); // Cell yang aktif
  const [activeClues, setActiveClues] = useState<{ across: Clue | null; down: Clue | null }>({
    across: null,
    down: null
  });

  const [hintsUsed, setHintsUsed] = useState(0);
  const maxHints = 3;

  const [correctness, setCorrectness] = useState<(boolean | undefined)[][]>([]);

  // Timer sebagai stopwatch
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // ------------------------------------------------------------
  //  BANGUN GRID DINAMIS BERDASARKAN CELLS
  // ------------------------------------------------------------
  useEffect(() => {
    if (!level || !cells.length) return;
  
    // Cari batas aktual dari cell yang ada
    const rows = cells.map(c => c.row);
    const cols = cells.map(c => c.col);
    const minRow = Math.min(...rows);
    const maxRow = Math.max(...rows);
    const minCol = Math.min(...cols);
    const maxCol = Math.max(...cols);
  
    const gridRows = maxRow - minRow + 1;
    const gridCols = maxCol - minCol + 1;
  
    // Inisialisasi grid dengan NULL (bukan string kosong)
    const newGrid: (string | null)[][] = Array(gridRows)
      .fill(null)
      .map(() => Array(gridCols).fill(null));
    const newSolution: (string | null)[][] = Array(gridRows)
      .fill(null)
      .map(() => Array(gridCols).fill(null));
    const newCorrectness: (boolean | undefined)[][] = Array(gridRows)
      .fill(null)
      .map(() => Array(gridCols).fill(undefined));
    const newGridClueNumbers: (number | null)[][] = Array(gridRows)
      .fill(null)
      .map(() => Array(gridCols).fill(null));
  
    // Hanya isi cell yang ADA di database
    cells.forEach(cell => {
      const r = cell.row - minRow;
      const c = cell.col - minCol;
  
      if (cell.type === 'block') {
        newGrid[r][c] = '#';
        newSolution[r][c] = '#';
      } else {
        newGrid[r][c] = ''; // Cell kosong untuk input
        newSolution[r][c] = cell.solution_letter || '';
        
        // Ambil nomor clue terkecil
        const relatedClues = clues.filter(
          clue => clue.id === cell.clue_across_id || clue.id === cell.clue_down_id
        );
        if (relatedClues.length > 0) {
          const minNumber = Math.min(...relatedClues.map(c => c.number));
          newGridClueNumbers[r][c] = minNumber;
        }
      }
    });
  
    setGrid(newGrid);
    setSolution(newSolution);
    setCorrectness(newCorrectness);
    setGridClueNumbers(newGridClueNumbers);
    setIsTimerRunning(true);
  }, [level, cells, clues]);

  // Stopwatch effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  // ------------------------------------------------------------
  // INPUT PER HURUF
  // ------------------------------------------------------------
  const handleCellChange = (r: number, c: number, value: string) => {
    if (grid[r][c] === null || grid[r][c] === '#') return;
  
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
  // CELL CLICK — TAMPILKAN CLUE YANG TERKAIT
  // ------------------------------------------------------------
  // pages/Game.tsx
const handleCellClick = (r: number, c: number) => {
  // Cek null dulu
  if (grid[r][c] === null || grid[r][c] === '#') return;
  
  const realRow = r + gridBounds.minRow;
  const realCol = c + gridBounds.minCol;

  const cell = cells.find(cell => cell.row === realRow && cell.col === realCol);
  if (!cell) return;

  const acrossClue = clues.find(clue => clue.id === cell.clue_across_id);
  const downClue = clues.find(clue => clue.id === cell.clue_down_id);

  setActiveCell({ row: r, col: c });
  setActiveClues({
    across: acrossClue || null,
    down: downClue || null
  });
};

  // ------------------------------------------------------------
  // HINT — ISI HURUF DI CELL KOSONG PERTAMA
  // ------------------------------------------------------------
  // pages/Game.tsx
const useHint = () => {
  if (hintsUsed >= maxHints) return;

  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      // Tambahkan pengecekan null
      if (grid[r][c] === "" && solution[r][c] !== "#" && solution[r][c] !== null) {
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
  // SIMPAN PROGRESS KE SUPABASE
  // ------------------------------------------------------------
  // pages/Game.tsx
const submitScore = async () => {
  const score = calculateScore(grid, solution, hintsUsed);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return alert("Login dulu!");

  const { data: existingProgress, error: fetchError } = await supabase
    .from("player_progress")
    .select("completed, completed_at")
    .eq("user_id", user.id)
    .eq("level_id", numericLevelId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error("Error fetching progress:", fetchError);
    return;
  }

  const isCompleted = grid.flat().every((cell, index) => {
    const r = Math.floor(index / grid[0].length);
    const c = index % grid[0].length;
    
    // Skip null cells
    if (solution[r][c] === null) return true;
    if (solution[r][c] === '#') return true;
    
    return cell !== null && cell.toUpperCase() === solution[r][c];
  });

  const finalCompletedAt = existingProgress?.completed
    ? existingProgress.completed_at
    : isCompleted
      ? new Date().toISOString()
      : null;

  const upsertPayload = {
    user_id: user.id,
    level_id: numericLevelId,
    score,
    hints_used: hintsUsed,
    completed: isCompleted,
    completed_at: finalCompletedAt,
  };

  const { error } = await supabase
    .from("player_progress")
    .upsert(upsertPayload, { onConflict: 'user_id,level_id' });

  if (error) {
    console.error("Error saving progress:", error);
    alert("Gagal menyimpan progress.");
  } else {
    alert(`Progress berhasil disimpan! Skor: ${score}`);
  }
};

  if (loading) {
    return (
      <div className="game-loading">
        <div className="spinner"></div>
        <p>Mengambil data teka-teki silang...</p>
      </div>
    );
  }

  if (!level || grid.length === 0 || grid[0]?.length === 0) {
    return (
      <div className="game-error">
        <h2>Level Tidak Ditemukan</h2>
        <p>Maaf, level dengan ID {levelId} tidak tersedia.</p>
      </div>
    );
  }

  // Format waktu: MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="game">
      <header className="game-header">
        <h1>{level.title}</h1>
        <p className="game-description">{level.description || 'Teka-teki silang dasar'}</p>
        <div className="game-meta">
          <span>Waktu: {formatTime(timeElapsed)}</span>
          <span>Ukuran: {level.width} × {level.height}</span>
        </div>
      </header>

      <div className="game-main">
        <div className="game-grid-section">
          {grid.length > 0 && grid[0]?.length > 0 && (
            <CrosswordGrid
              grid={grid}
              onCellChange={handleCellChange}
              correctness={correctness}
              clueNumbers={gridClueNumbers}
              onCellClick={handleCellClick}
              activeCell={activeCell}
            />
          )}
        </div>

        <div className="game-clues-section">
          <CluesPanel
            across={activeClues.across ? [activeClues.across] : []}
            down={activeClues.down ? [activeClues.down] : []}
          />
        </div>
      </div>

      <footer className="game-footer">
        <button
          onClick={useHint}
          disabled={hintsUsed >= maxHints}
          className="btn btn-hint"
        >
          🎯 Hint ({hintsUsed}/{maxHints})
        </button>

        <button onClick={submitScore} className="btn btn-save">
          ✅ Simpan Progress
        </button>
      </footer>
    </div>
  );
};

export default Game;