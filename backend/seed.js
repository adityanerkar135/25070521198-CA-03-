// Run once:  npm run seed
// Fills MongoDB with sample movies and creates an admin account.
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Movie = require('./models/Movie');
const User = require('./models/User');
const Booking = require('./models/Booking');

const poster = (title, color) =>
  `https://placehold.co/300x450/${color}/ffffff?text=${encodeURIComponent(title)}`;

const movies = [
  { title: 'Midnight Express', genre: 'Action', language: 'English', duration: 135, rating: 8.1, price: 300, poster: poster('Midnight Express', '7f1d1d'), description: 'A retired courier is pulled back into the underworld when a mysterious package arrives on the last train of the night.' },
  { title: 'Love in Lisbon', genre: 'Romance', language: 'English', duration: 118, rating: 7.4, price: 250, poster: poster('Love in Lisbon', '9d174d'), description: 'Two strangers keep missing each other across the colourful streets of Lisbon until one rainy evening changes everything.' },
  { title: 'The Last Orbit', genre: 'Sci-Fi', language: 'English', duration: 148, rating: 8.7, price: 350, poster: poster('The Last Orbit', '1e3a8a'), description: 'A crew on the edge of the solar system discovers a signal that should not exist.' },
  { title: 'Laugh Riot', genre: 'Comedy', language: 'Hindi', duration: 124, rating: 7.0, price: 220, poster: poster('Laugh Riot', 'b45309'), description: 'A wedding planner, a runaway groom and one very confused caterer in a comedy of errors.' },
  { title: 'Shadow Manor', genre: 'Horror', language: 'English', duration: 102, rating: 6.8, price: 280, poster: poster('Shadow Manor', '1f2937'), description: 'A family inherits a manor and learns why nobody has stayed there past midnight.' },
  { title: 'Royal Gambit', genre: 'Drama', language: 'English', duration: 140, rating: 8.3, price: 300, poster: poster('Royal Gambit', '4c1d95'), description: 'A chess prodigy navigates ambition, rivalry and betrayal on the road to the world championship.' },
  { title: 'Monsoon Diaries', genre: 'Drama', language: 'Hindi', duration: 126, rating: 7.9, price: 230, poster: poster('Monsoon Diaries', '065f46'), description: 'Four friends reunite in Mumbai during the monsoon and confront the lives they left behind.' },
  { title: 'Turbo Pups', genre: 'Animation', language: 'English', duration: 95, rating: 7.5, price: 200, poster: poster('Turbo Pups', 'c2410c'), description: 'A pack of racing puppies enters the biggest street derby of the year.' },
].map((m, i) => ({
  ...m,
  releaseDate: new Date(Date.now() - i * 86400000 * 5),
}));

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  await Movie.deleteMany({});
  await Booking.deleteMany({});
  await Movie.insertMany(movies);
  console.log(`Inserted ${movies.length} movies`);

  const adminEmail = 'admin@cinebook.com';
  if (!(await User.findOne({ email: adminEmail }))) {
    await User.create({
      name: 'Admin',
      email: adminEmail,
      password: await bcrypt.hash('admin123', 10),
      role: 'admin',
    });
    console.log('Admin created  ->  admin@cinebook.com / admin123');
  }

  await mongoose.disconnect();
  console.log('Seeding done.');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
