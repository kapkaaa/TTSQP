// hooks/useCrossword.ts
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Level, Clue, Cell } from '../types/crossword';

export const useCrossword = (levelId: number) => {
  const [level, setLevel] = useState<Level | null>(null);
  const [clues, setClues] = useState<Clue[]>([]);
  const [cells, setCells] = useState<Cell[]>([]);
  const [loading, setLoading] = useState(true);

  // State baru untuk batas grid
  const [gridBounds, setGridBounds] = useState({
    minRow: 0,
    maxRow: 0,
    minCol: 0,
    maxCol: 0,
  });

  useEffect(() => {
    const fetchLevelData = async () => {
      setLoading(true);

      // Ambil level
      const { data: levelData, error: levelError } = await supabase
        .from('levels')
        .select('*')
        .eq('id', levelId)
        .single();

      if (levelError) {
        console.error(levelError);
        setLoading(false);
        return;
      }

      // Ambil clues
      const { data: cluesData, error: cluesError } = await supabase
        .from('clues')
        .select('*')
        .eq('level_id', levelId);

      if (cluesError) {
        console.error(cluesError);
        setLoading(false);
        return;
      }

      // Ambil cells
      const { data: cellsData, error: cellsError } = await supabase
        .from('cells')
        .select('*')
        .eq('level_id', levelId);

      if (cellsError) {
        console.error(cellsError);
        setLoading(false);
        return;
      }

      // Hitung batas grid
      if (cellsData.length > 0) {
        const rows = cellsData.map(c => c.row);
        const cols = cellsData.map(c => c.col);
        setGridBounds({
          minRow: Math.min(...rows),
          maxRow: Math.max(...rows),
          minCol: Math.min(...cols),
          maxCol: Math.max(...cols),
        });
      }

      setLevel(levelData as Level);
      setClues(cluesData as Clue[]);
      setCells(cellsData as Cell[]);
      setLoading(false);
    };

    fetchLevelData();
  }, [levelId]);

  return { level, clues, cells, gridBounds, loading };
};