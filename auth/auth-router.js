const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secrets = require('../config/secrets.js');

const Users = require('../users/users-model.js');

// for endpoints beginning with /api/auth

//----------------------------------------------------------------------------//
// We didn't do this in class, but it makes sense to return a token when someone
// registers... why make them log in when they just barely provided a new
// username and password? Just return them a token, so they can begin using it
// right away... 
//----------------------------------------------------------------------------//
router.post('/register', (req, res) => {
  let user = req.body;
  const hash = bcrypt.hashSync(user.password, 10); // 2 ^ n
  user.password = hash;

  Users.add(user)
    .then(saved => {
      // pass the created user into the genToken() method, and get the token
      const token = genToken(saved);
      // return the user object, and the token.
      res.status(201).json({ created_user: saved, token: token });
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

//----------------------------------------------------------------------------//
// When someone successfully authenticates, reward them with a token, so they
// don't have to authenticate again. 
//----------------------------------------------------------------------------//
router.post('/login', (req, res) => {
  let { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        // pass the found user into the genToken() method, and get the token
        const token = genToken(user);
        // return the found user's username, and the token"
        res.status(200).json({ username: user.username, token: token });
      } else {
        res.status(401).json({ message: 'You shall not pass!' });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

//----------------------------------------------------------------------------//
// This is a helper method that helps us stay DRY (we generate tokens in both
// the POST /api/auth/register handler, and the POST /api/auth/login handler).
// Uses the same pattern as our test handler for GET /token in server.js. 
//----------------------------------------------------------------------------//
function genToken(user) {

  // create the payload...
  const payload = {
    userid: user.id,
    username: user.username,
  };
  const options = { expiresIn: '1h' };
  const token = jwt.sign(payload, secrets.jwtSecret, options);

  return token;
}

module.exports = router;
