import { useEffect, useState } from 'react';
import { api } from '../api.js';
import MovieCard from '../components/MovieCard.jsx';

const GENRES = ['All', 'Action', 'Romance', 'Sci-Fi', 'Comedy', 'Horror', 'Drama', 'Animation'];

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Re-fetch from MongoDB (via the API) whenever search / genre changes
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (genre !== 'All') params.set('genre', genre);
      api(`/movies?${params.toString()}`)
        .then((data) => {
          setMovies(data);
          setError('');
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [search, genre]);

  return (
    <>
      <section className="hero">
        <h1>Book your next movie night</h1>
        <p>Pick a movie, choose your seats, and you're set.</p>
        <input
          className="search"
          type="text"
          placeholder="Search movies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </section>

      <div className="chips">
        {GENRES.map((g) => (
          <button key={g} className={`chip ${g === genre ? 'active' : ''}`} onClick={() => setGenre(g)}>
            {g}
          </button>
        ))}
      </div>

      {error && <p className="error">{error}. Is the backend running?</p>}
      {loading && <p className="muted">Loading movies...</p>}
      {!loading && !error && movies.length === 0 && (
        <p className="muted">No movies found. (Have you run <code>npm run seed</code> in the backend?)</p>
      )}

      <div className="grid">
        {movies.map((m) => (
          <MovieCard key={m._id} movie={m} />
        ))}
      </div>
    </>
  );
}
