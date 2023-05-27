const express = require('express');
const mysql = require('mysql');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public2')));




app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
  })
);

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'ghanalm10',
  database: 'banglore',
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database');
});

app.get('/', function (req, res) {
  console.log('GET /');
  res.sendFile(path.join(__dirname, 'public2', 'Signup', 'Signup.html'));
});

app.post('/', function (req, res) {
  console.log('POST /');
  const { username, email, password } = req.body;
  console.log('Received data:', username, email, password);
  if (username && email && password) {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        console.log('Error hashing password:', err);
        res.redirect('/');
      } else {
        const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        connection.query(sql, [username, email, hash], (err, result) => {
          if (err) {
            console.log('Error inserting user into database:', err);
            res.redirect('/');
          } else {
            console.log('User inserted into database:', result);
            req.session.loggedin = true;
            req.session.username = username;
            res.redirect('/adress');
          }
        });
      }
    });
  } else {
    res.redirect('/');
  }
});

app.get('/login', function (req, res) {
  console.log('GET /login');
  res.sendFile(path.join(__dirname, 'public2', 'login', 'login.html'));
});

app.post('/login', function (req, res) {
  console.log('POST /login');
  const { email, password } = req.body;
  console.log('Received data:', email, password);
  if (email && password) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    connection.query(sql, [email], (err, result) => {
      if (err) {
        console.log('Error retrieving user from database:', err);
        res.redirect('/login');
      } else if (result.length === 1) {
        bcrypt.compare(password, result[0].password, (err, bcryptRes) => {
          if (err) {
            console.log('Error comparing passwords:', err);
            res.redirect('/login');
          } else if (bcryptRes) {
            req.session.loggedin = true;
            req.session.username = result[0].username;
            res.redirect('/home');
          } else {
            console.log('Invalid password');
            res.send('<script>window.alert("Invalid password"); window.location.href = "/login";</script>');
          }
        });
      } else {
        console.log('Invalid email');
        res.send('<script>window.alert("Invalid email"); window.location.href = "/login";</script>');
      }
    });
  } else {
    res.redirect('/login');
  }
});

app.get('/adress', function (req, res) {
  console.log('GET /adress');
  res.sendFile(path.join(__dirname, 'public2', 'adress', 'index.html'));
});

app.post('/adress', function (req, res) {
  console.log('POST /address');
  const { name, phone, house, road, pin, state, city } = req.body;
  const username = req.session.username;

  if (name && phone && house && road  && pin && state && city) {
    const sql = 'SELECT userid FROM users WHERE username = ?';
    connection.query(sql, [username], (err, userids) => {
      if (err) {
        console.log('Error retrieving user ID from database:', err);
        res.redirect('/adress');
      } else if (userids.length === 1) {
        const userid = userids[0].userid;
        const sql2 = 'INSERT INTO adress (userid, name, phone, pin, state, city, house, road) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        connection.query(sql2, [userid, name, phone, pin, state, city, house, road], (err, result) => {
          if (err) {
            console.log('Error inserting address into database:', err);
            res.redirect('/adress');
          } else {
            console.log('Address inserted into database:', result);
            req.session.info = true;
            res.redirect('/login');
          }
        });
      } else {
        console.log('Invalid user');
        res.redirect('/adress');
      }
    });
  } else {
    console.log('Missing required fields');
    res.redirect('/adress');
  }
});

app.get('/home', function (req, res) {
    console.log('GET /adress');
    res.sendFile(path.join(__dirname, 'public2', 'Home', 'Home.html'));
  });
app.get('/dry', function (req, res) {
    console.log('GET /adress');
    res.sendFile(path.join(__dirname, 'public2', 'laundry1', 'index.html'));
  });



app.post('/dry', function (req, res) {
    const { cloth, numb, wet, iron} = req.body;
    const username = req.session.username;
    const sql = 'SELECT userid FROM users WHERE username = ?';
    connection.query(sql, [username], (err, userids) => {
        if (cloth, numb, wet, iron) {
            const sql2 = 'INSERT INTO laundry(userid, cloth, numb, dry, iron) VALUES (?, ?, ?, ?, ?)';
            const userid = userids[0].userid;
            connection.query(sql2, [userid, cloth, numb, wet, iron], (err, result) => {
                if (err) {
                    console.log(err);
                    res.redirect('/dry');
                } else {
                    console.log(result);
                    req.session.info = true;
                    res.redirect('/confirm');
                }
            });
        } else {
            res.redirect('/dry');
        }
    });  
});


app.get('/confirm', function (req, res) {
    console.log('GET /adress');
    res.sendFile(path.join(__dirname, 'public2', 'laundry', 'index.html'));
  });


const port = 5000;

app.listen(port, function () {
  console.log(`Server started on port ${port}`);
});
