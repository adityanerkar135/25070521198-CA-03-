import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        Cine<span>Book</span>
      </Link>
      <nav>
        <Link to="/">Movies</Link>
        {user ? (
          <>
            <Link to="/my-bookings">My Bookings</Link>
            <span className="hello">Hi, {user.name.split(' ')[0]}</span>
            <button
              className="btn btn-outline"
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn">
              Sign up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
