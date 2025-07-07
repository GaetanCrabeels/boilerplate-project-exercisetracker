const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser')

const users = {}; // objet pour stocker les utilisateurs
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
// Basic Configuration
app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

app.post('/api/users', (req, res) => {
  const newUser = {
    username: req.body.username,
    _id: Math.random().toString(36).substring(2, 15)};
  users[newUser._id] = newUser;

  res.json(newUser);
});
app.get('/api/users', (req, res) => {
  const userList = Object.values(users)
  res.json(userList)
})
app.post('/api/users/:_id/exercises', (req, res) => {
  const userId = req.params._id;
  const user = users[userId];

  const exercise = {
    description: req.body.description,
    duration: parseInt(req.body.duration),
    date: req.body.date ? new Date(req.body.date) : new Date()
  };
    if (!user.exercises) {
    user.exercises = [];
  }
  user.exercises.push(exercise);
  // Response will be the user object with the exercise added
  res.json({
    _id: user._id,
    username: user.username,
    ...exercise
  });
});
app.get ('/api/users/:_id/logs', (req, res) => {
  const userId = req.params._id;
  const user = users[userId];
  const from = req.query.from ? new Date(req.query.from) : null;
  const to = req.query.to ? new Date(req.query.to) : null;
  const limit = parseInt(req.query.limit) || 0;
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  let log = user.exercises || [];
/* Filtrer les exercices selon les paramètres from, to et limit */
  if (from) {
    log = log.filter(ex => ex.date >= from);
  }
  if (to) {
    log = log.filter(ex => ex.date <= to);
  }
  if (limit > 0) {
    log = log.slice(0, limit);
  }
  const response = {
    _id: user._id,
    username: user.username,
    count: log.length,
    log: log.map(ex => ({
      description: ex.description,
      duration: ex.duration,
      date: ex.date.toDateString()
    }))
  };
  res.json(response);
});