import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Leader } from '../types/crossword';

const Leaderboard: React.FC = () => {
  const [leaders, setLeaders] = useState<Leader[]>([]);

  useEffect(() => {
    const fetchLeaders = async () => {
      const { data } = await supabase
        .from('leaderboard')
        .select('id, username, score_total')
        .order('score_total', { ascending: false });

      setLeaders(data || []);
    };

    fetchLeaders();

    // Realtime subscription
    const channel = supabase
      .channel('leaderboard_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'leaderboard' },
        (payload) => {
          fetchLeaders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="leaderboard">
      <h2>Leaderboard</h2>
      <ul>
        {leaders.map((l, i) => (
          <li key={l.id || i}>
            {l.username}: {l.score_total} pts
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;