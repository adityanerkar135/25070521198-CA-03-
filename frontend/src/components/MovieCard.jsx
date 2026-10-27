import { Link } from 'react-router-dom';

export default function MovieCard({ movie }) {
  return (
    <Link to={`/movie/${movie._id}`} className="card">
      <img src={movie.poster} alt={movie.title} loading="lazy" />
      <div className="card-body">
        <h3>{movie.title}</h3>
        <p className="muted">
          {movie.genre} &middot; {movie.language}
        </p>
        <div className="card-row">
          <span className="rating">&#9733; {movie.rating}</span>
          <span>&#8377;{movie.price}</span>
        </div>
      </div>
    </Link>
  );
}
