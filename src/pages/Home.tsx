import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface Level {
  id: number;
  title: string;
}

const Home: React.FC = () => {
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLevels = async () => {
      const { data, error } = await supabase.from('levels').select('id, title');
      if (error) console.error(error);
      else setLevels(data || []);
      setLoading(false);
    };

    fetchLevels();
  }, []);

  if (loading) return <div>Memuat level...</div>;

  return (
    <div className="home">
      <h1>Pilih Level Teka-Teki Silang</h1>
      <div className="level-list">
        {levels.map((level) => (
          <Link key={level.id} to={`/game/${level.id}`} className="level-card">
            {level.title}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;