import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

const ROWS = 'ABCDEFGH'.split('');
const COLS = 10;
const MAX_SEATS = 8;

function nextDays(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return {
      iso,
      label: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
    };
  });
}

export default function MovieDetails() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const days = useMemo(() => nextDays(7), []);
  const [movie, setMovie] = useState(null);
  const [date, setDate] = useState(days[0].iso);
  const [showtime, setShowtime] = useState('');
  const [bookedSeats, setBookedSeats] = useState([]);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api(`/movies/${id}`)
      .then((m) => {
        setMovie(m);
        setShowtime(m.showtimes[0] || '');
      })
      .catch((e) => setError(e.message));
  }, [id]);

  const loadSeats = () => {
    if (!movie || !showtime) return;
    api(`/bookings/seats?movieId=${movie._id}&date=${date}&showtime=${encodeURIComponent(showtime)}`)
      .then((d) => setBookedSeats(d.bookedSeats))
      .catch((e) => setError(e.message));
  };

  useEffect(() => {
    setSelected([]);
    setSuccess('');
    loadSeats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movie, date, showtime]);

  const toggleSeat = (seat) => {
    if (bookedSeats.includes(seat)) return;
    setError('');
    setSelected((prev) => {
      if (prev.includes(seat)) return prev.filter((s) => s !== seat);
      if (prev.length >= MAX_SEATS) {
        setError(`You can select up to ${MAX_SEATS} seats`);
        return prev;
      }
      return [...prev, seat];
    });
  };

  const book = async () => {
    if (!token) return navigate('/login', { state: { from: `/movie/${id}` } });
    setBusy(true);
    setError('');
    try {
      await api('/bookings', {
        method: 'POST',
        token,
        body: { movieId: movie._id, date, showtime, seats: selected },
      });
      setSuccess(`Booked ${selected.join(', ')}! See "My Bookings" for details.`);
      setSelected([]);
      loadSeats();
    } catch (e) {
      setError(e.message);
      loadSeats();
    } finally {
      setBusy(false);
    }
  };

  if (error && !movie) return <p className="error">{error}</p>;
  if (!movie) return <p className="muted">Loading...</p>;

  const total = selected.length * movie.price;

  return (
    <>
      <section className="details">
        <img src={movie.poster} alt={movie.title} />
        <div>
          <h1>{movie.title}</h1>
          <p className="muted">
            {movie.genre} &middot; {movie.language} &middot; {movie.duration} min &middot;{' '}
            <span className="rating">&#9733; {movie.rating}</span>
          </p>
          <p>{movie.description}</p>
          <p className="price">&#8377;{movie.price} <span className="muted">per seat</span></p>
        </div>
      </section>

      <section className="panel">
        <h2>1. Choose date</h2>
        <div className="chips">
          {days.map((d) => (
            <button key={d.iso} className={`chip ${d.iso === date ? 'active' : ''}`} onClick={() => setDate(d.iso)}>
              {d.label}
            </button>
          ))}
        </div>

        <h2>2. Choose showtime</h2>
        <div className="chips">
          {movie.showtimes.map((t) => (
            <button key={t} className={`chip ${t === showtime ? 'active' : ''}`} onClick={() => setShowtime(t)}>
              {t}
            </button>
          ))}
        </div>

        <h2>3. Choose seats</h2>
        <div className="screen">SCREEN</div>
        <div className="seat-map">
          {ROWS.map((r) => (
            <div className="seat-row" key={r}>
              <span className="row-label">{r}</span>
              {Array.from({ length: COLS }, (_, i) => {
                const seat = `${r}${i + 1}`;
                const cls = bookedSeats.includes(seat) ? 'booked' : selected.includes(seat) ? 'selected' : '';
                return (
                  <button
                    key={seat}
                    className={`seat ${cls}`}
                    disabled={bookedSeats.includes(seat)}
                    onClick={() => toggleSeat(seat)}
                    title={seat}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="legend">
          <span><i className="seat" /> Available</span>
          <span><i className="seat selected" /> Selected</span>
          <span><i className="seat booked" /> Booked</span>
        </div>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <div className="summary">
          <div>
            <strong>{selected.length ? selected.join(', ') : 'No seats selected'}</strong>
            <div className="muted">Total: &#8377;{total}</div>
          </div>
          <button className="btn" disabled={!selected.length || busy} onClick={book}>
            {busy ? 'Booking...' : token ? 'Confirm booking' : 'Login to book'}
          </button>
        </div>
      </section>
    </>
  );
}
