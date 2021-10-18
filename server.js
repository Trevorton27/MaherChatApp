require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const path = require('path');
const pool = require('./db');
const http = require('http');

const socket = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socket(server);

const jwt = require('jsonwebtoken');
const jwt_decode = require('jwt-decode');
const { send } = require('process');

app.use('/', express.static(path.join(__dirname, 'client/build')));
app.use(express.json());

// LoginForm
app.post('/api/loginform', async (req, res) => {
  const { email, password } = req.body;

  try {
    //select firstname and email database

    const userEmail = await pool.query('SELECT * FROM users WHERE email = $1', [
      email
    ]);
    await pool.query('UPDATE users SET is_logged_in = true WHERE email = $1', [
      email
    ]);

    await pool.query('COMMIT');

    if (userEmail.rowCount < 1) {
      res.status(400).json('User does not exist');
    }

    const isMatch = await bcrypt.compare(password, userEmail.rows[0].password);
    if (!isMatch) {
      res.status(400).json('Incorrect password');
    }
    // add firstname to object below
    const token = jwt.sign(
      { userId: userEmail.rows[0].id, firstName: userEmail.rows[0].firstname },
      process.env.TOKEN_SECRET
    );

    res.json({ token });
  } catch (err) {
    res.status(500).send({ err });
  }
});

app.post('api/logout', async (req, res) => {
  const { firstname } = req.body;
  try {
    await pool.query('BEGIN');
    const results = await pool.query(
      'SELECT * FROM users WHERE firstname = $1',
      [firstname]
    );

    await pool.query(
      'UPDATE users SET is_logged_in = false WHERE firstname = $1',
      [firstname]
    );
    await pool.query('COMMIT');
    return results.rows[0];
  } catch (err) {
    res.status(500).send({ err });
  }
});

// Get all  chat messages
app.get('/api/messages', async (req, res) => {
  try {
    const token = req.headers.token;
    const messages = await pool.query(
      'SELECT messages_text, firstname FROM messages INNER JOIN users ON messages.user_id = users.id'
    );

    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    if (!decoded) {
      return res.status(401).json('Unauthorized');
    }

    res.json(messages.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Create a chat message
app.post('/api/messages', async (req, res) => {
  const { id, text, userName } = req.body;
  const date = new Date();

  try {
    const newMessage = await pool.query(
      'INSERT INTO messages(messages_text, created_date, user_id) VALUES($1, $2, $3) RETURNING *',
      [text, date, id]
    );

    // add firstname to object below coming from req.body
    io.emit('receive-message', { firstname: userName, messages_text: text });

    res.json(newMessage.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  //get token from api/users header and use to authorize user

  try {
    const token = req.headers.token;

    const decoded = jwt_decode(token);

    const user = await pool.query('SELECT * FROM users WHERE  = $1', [
      decoded.userId
    ]);

    //verify token and return user id if valid token
    const payLoad = jwt.verify(token, process.env.TOKEN_SECRET);

    if (!payLoad) {
      return res.status(401).json('Unauthorized');
    }

    io.emit('receive-users', { firstname: user.rows.firstname });
    // console.log(user);
    res.json(user.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Register user
app.post('/api/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const user = await pool.query('SELECT * FROM users WHERE firstname = $1', [
      firstName
    ]);

    if (user.rows.length !== 0) {
      return res.status(401).send('User already exists');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      'INSERT INTO users(firstName, lastName, email, password) VALUES($1, $2, $3, $4) RETURNING *',
      [firstName, lastName, email, hashedPassword]
    );
    console.log('newUser: ', newUser);
    res.json({ newUser });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// catch all route
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

// Environtment variable for hosting
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`server listening on port ${port}`);
});

// CREATIND API ENDPOINTS
// 1. Get all messages - GET: "api/messages"
// 2. Create a chat message - POST: "api/message"
// 3. Get all users - GET: "api/users"
// 4. Create a user - POST:"api/users"
// 5. GEt a single user = GET:"api/users/{id}"
