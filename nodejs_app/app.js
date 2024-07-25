const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();
const { checkUser, authenticateToken } = require('./middleware/authMiddleware');

const app = express();
const port = process.env.PORT || 5555;

// Mongoose connection
mongoose.connect(process.env.DB_URL)
  .then(() => console.log('Connected to MongoDB!!'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(checkUser); 
app.use(express.json());

// Routes
const indexRoutes = require('./routes/indexRoutes');
const authRoutes = require('./routes/authRoutes');
const internalRoutes = require('./routes/internalRoutes');
app.use('/', indexRoutes);
app.use('/', authRoutes);
app.use('/internal', internalRoutes);

// EJS Settings
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Error handling middleware
app.use((req, res, next) => {
  res.status(404).send('Not Found');
});

// Server
app.listen(port, '0.0.0.0', (err) => {
  if (err) {
    console.log("ERROR: ", err);
  } else {
    console.log("Server is running on port: ", port);
  }
});
