import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function MyBookings() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () =>
    api('/bookings/my', { token })
      .then(setBookings)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await api(`/bookings/${id}`, { method: 'DELETE', token });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      <h1>My Bookings</h1>
      {error && <p className="error">{error}</p>}
      {loading && <p className="muted">Loading...</p>}
      {!loading && bookings.length === 0 && <p className="muted">You have no bookings yet.</p>}

      <div className="bookings">
        {bookings.map((b) => (
          <div className={`booking ${b.status}`} key={b._id}>
            <img src={b.movie?.poster} alt="" />
            <div className="booking-info">
              <h3>{b.movie?.title || 'Movie removed'}</h3>
              <p className="muted">{b.date} &middot; {b.showtime}</p>
              <p>Seats: <strong>{b.seats.join(', ')}</strong></p>
              <p>Total: &#8377;{b.totalAmount}</p>
              <span className={`badge ${b.status}`}>{b.status}</span>
            </div>
            {b.status === 'confirmed' && (
              <button className="btn btn-outline" onClick={() => cancel(b._id)}>
                Cancel
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
