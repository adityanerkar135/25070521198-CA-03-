const express = require('express');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Movie = require('../models/Movie');
const { protect } = require('../middleware/auth');

const router = express.Router();

const ROWS = 'ABCDEFGH'.split('');
const COLS = 10;
const VALID_SEATS = new Set(ROWS.flatMap((r) => Array.from({ length: COLS }, (_, i) => `${r}${i + 1}`)));

async function getBookedSeats(movieId, date, showtime) {
  const bookings = await Booking.find({ movie: movieId, date, showtime, status: 'confirmed' });
  return bookings.flatMap((b) => b.seats);
}

// GET /api/bookings/seats?movieId=&date=&showtime=   -> already booked seats
router.get('/seats', async (req, res) => {
  try {
    const { movieId, date, showtime } = req.query;
    if (!mongoose.isValidObjectId(movieId) || !date || !showtime) {
      return res.status(400).json({ message: 'movieId, date and showtime are required' });
    }
    res.json({ bookedSeats: await getBookedSeats(movieId, date, showtime) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/bookings   (logged in)
router.post('/', protect, async (req, res) => {
  try {
    const { movieId, date, showtime, seats } = req.body;

    if (!mongoose.isValidObjectId(movieId) || !date || !showtime || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ message: 'Movie, date, showtime and at least one seat are required' });
    }
    if (seats.length > 8) return res.status(400).json({ message: 'You can book at most 8 seats at a time' });
    if (new Set(seats).size !== seats.length || !seats.every((s) => VALID_SEATS.has(s))) {
      return res.status(400).json({ message: 'Invalid seat selection' });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    if (!movie.showtimes.includes(showtime)) {
      return res.status(400).json({ message: 'Invalid showtime for this movie' });
    }

    const taken = await getBookedSeats(movieId, date, showtime);
    const clash = seats.filter((s) => taken.includes(s));
    if (clash.length) {
      return res.status(409).json({ message: `Seat(s) already booked: ${clash.join(', ')}` });
    }

    const booking = await Booking.create({
      user: req.user._id,
      movie: movie._id,
      date,
      showtime,
      seats,
      totalAmount: movie.price * seats.length,
    });
    const populated = await booking.populate('movie', 'title poster');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/bookings/my   (logged in)
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('movie', 'title poster')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/bookings/:id   -> cancel own booking
router.delete('/:id', protect, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    booking.status = 'cancelled';
    await booking.save();
    res.json({ message: 'Booking cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
