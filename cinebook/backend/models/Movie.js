const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    genre: { type: String, required: true },
    language: { type: String, default: 'English' },
    duration: { type: Number, default: 120 }, // minutes
    rating: { type: Number, min: 0, max: 10, default: 0 },
    poster: { type: String, default: '' },
    showtimes: { type: [String], default: ['10:00 AM', '1:30 PM', '6:00 PM', '9:30 PM'] },
    price: { type: Number, required: true, default: 250 }, // per seat (INR)
    releaseDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Movie', movieSchema);
