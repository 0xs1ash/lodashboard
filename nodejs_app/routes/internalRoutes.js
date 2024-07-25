const express = require('express');
const router = express.Router();
const fs = require('fs');
const axios = require('axios');
const lodash = require('lodash');
const bodyParser = require('body-parser');
router.use(bodyParser.json());
const User = require('../models/userModel');
const bcrypt = require('bcrypt');

const logData = []; 

const authenticateToken = async (req, res, next) => {
  const { auth } = req.body;
  if (!auth) {
    return res.status(401).send('Unauthorized');
  }
  
  const { username, password } = auth;
  const user = await User.findOne({ username });

  if (user && await bcrypt.compare(password, user.password)) {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
};

router.post('/push', authenticateToken, async (req, res) => {
  try {
    const { filename } = req.body;
    const data = fs.readFileSync(filename, 'utf8');
    const jsonData = JSON.parse(data);
    
    const instance = axios.create({
      baseURL: 'http://internal_listener:8111'
    });

    const response = await instance.post('/', jsonData);

    logData.push(jsonData);
    console.log(response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Internal - Push->", error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/logfiles', (req, res) => {
  console.log(logData);
  res.status(200).json(logData);
});

router.put('/logfile', authenticateToken, (req, res) => {
  const logFile = JSON.parse(req.body.file);
  
  lodash.merge({}, logFile);
  res.send('File successfuly sent!');
});

module.exports = router;
