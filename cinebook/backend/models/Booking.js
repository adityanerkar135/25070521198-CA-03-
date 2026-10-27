const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    showtime: { type: String, required: true },
    seats: { type: [String], required: true },
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
  },
  { timestamps: true }
);

bookingSchema.index({ movie: 1, date: 1, showtime: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
