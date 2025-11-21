import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Level } from '../types/crossword';

export const useCrossword = (levelId: number) => {
  const [level, setLevel] = useState<Level | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLevel = async () => {
      const { data, error } = await supabase
        .from('levels')
        .select('*')
        .eq('id', levelId)
        .single();

      if (error) console.error(error);
      else setLevel(data as Level);
      setLoading(false);
    };

    fetchLevel();
  }, [levelId]);

  return { level, loading };
};