const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const validator = require('validator')
const jwt = require('jsonwebtoken');
const { authenticateToken,isAdmin } = require('../middleware/authMiddleware.js');
const { rangeRight } = require('lodash');
const fs = require('fs').promises; 
const { stringify } = require('querystring');
const crypto = require('crypto');

// Disk storage
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'public', 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname);
  }
});
var upload = multer({ storage: storage }).single('new_resume');


// REGISTER ROUTE GET
router.get('/register',  authenticateToken, isAdmin,(req, res) => {
  res.render('auth/register');
});


// REGISTER ROUTE POST
router.post('/register',  authenticateToken, isAdmin,async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Error uploading file:', err);
      return res.status(400).json({ message: 'Error uploading file' });
    }

    const resumeFile = req.file;
    const { username, fullname, email, github_profile, linkedin_profile, password,isAdmin } = req.body;
    try {
      if (!username || !password || !email || !fullname) {
        return res.status(400).json(
          { message: 'All fields are required',
            success: false
           }
        );
      }

      if (fullname.length < 6) {
        return res.status(400).json({
          message: 'Fullname must be at least 6 characters long' ,
          success: false
        });
      }
      if (!validator.isLowercase(username)) {
        return res.status(400).json({
          message: 'Username must be lowercase',
          success: false
        });
      }

      if (username.length < 5) {
        return res.status(400).json({
          message: 'Username must be at least 5 characters long',
          success: false
        });
      }

      const username_check = await User.findOne({ username });
      if (username_check) {
        return res.status(400).json({
          message: 'Username already exists',
          success: false
        });
      }

      if (!validator.isEmail(email)) {
        return res.status(400).json({
          message: 'Email is not a valid email',
          success: false
        });
      }

      const email_check = await User.findOne({ email });
      if (email_check) {
        return res.status(400).json({
          message: 'Email already exists',
          success: false
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          message: 'Password must be at least 8 characters long',
          success: false
        });
      }
      const isAdminValue = isAdmin === 'true'?true:false
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        username,
        fullname,
        email,
        resume: resumeFile ? resumeFile.filename : null,
        github_profile,
        linkedin_profile,
        password: hashedPassword,
        isAdmin
      });

      const user = await newUser.save();

      const token = createToken(user._id,isAdmin);
      res.cookie('Session', token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24
      });

      return res.status(200).json({
        message: 'User registered successfully',
        success: true
      });
    } catch (err) {
      console.error('Error during registration:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });
});


// LOGIN ROUTE GET
router.get('/login', (req, res) => {
  res.render('auth/login');
});


// LOGIN ROUTE POST
router.post('/login', async (req, res) => {
  try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });

      if (!user) {
          return res.status(401).json({
              success: false,
              message: 'User not found'
          });
      }

      const checkUser = await bcrypt.compare(password, user.password);

      if (!checkUser) {
          return res.status(401).json({
              success: false,
              message: 'Incorrect password'
          });
      }

      const token = createToken(user._id, user.isAdmin);
      res.cookie('Session', token, {
          httpOnly: true,
          maxAge: 1000 * 60 * 60 * 24
      });
      
      return res.status(200).json({
          success: true,
          message: 'Login successful',
          isAdmin: user.isAdmin
      });
  } catch (err) {
      return res.status(500).json({
          success: false,
          message: err.message
      });
  }
});


// DASHBOARD ROUTE GET
router.get('/dashboard', authenticateToken, isAdmin, async (req, res) => {
  try {
    const session = req.cookies.Session;
    jwt.verify(session, process.env.SECRET_KEY, async (err, decoded) => {
      if (err) {
        console.log(err);
        return res.redirect('/login');
      }
      const user_id = decoded.userId; 
      const user = await User.findById(user_id);

      if (!user) {
        console.error('User not found.');
        return res.redirect('/login');
      }

      res.render('auth/dashboard', { user,flag:process.env.FLAG});
    });
  } catch (err) {
    console.error('Error:', err);
    res.redirect('/login');
  }
});


//SECRET ROUTES GET
router.get('/secret/*', authenticateToken, (req, res) => {
  const urlPattern = /\/secret\/\.\.\/;\/key\.txt/;
  const requiredHeader = req.headers['x-secret-key']; 
  
  if (urlPattern.test(req.originalUrl) && requiredHeader === 'GIVEMEASECRETKEY') {
    const envFilePath = path.join(__dirname, '../key.txt');
    res.sendFile(envFilePath);
  } else {
    res.status(403).send('Access denied');
  }
});

router.get('/secret', (req, res) => {
  res.render('secret',)
});


// UPDATE PROFILE ROUTE POST
router.post('/updateProfile', authenticateToken, isAdmin, async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Error uploading file:', err);
      return res.status(500).json({ success: false, message: 'File upload error' });
    }

    const token = req.cookies.Session;
    try {
      let { fullname, username, email, new_password, confirm_password, linkedin_profile, github_profile, randomFilename } = req.body;
      const { userId } = await decodeToken(token);  
      let new_resume = req.file ? req.file.filename : null;

      let user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (new_password && new_password !== confirm_password) {
        return res.status(400).json({ success: false, message: 'Passwords do not match' });
      }

      if (username) {
        let username_check = await User.findOne({ username });
        if (username_check && username_check._id.toString() !== userId.toString()) {
          return res.status(400).json({ success: false, message: 'Username already exists' });
        }
      }

      if (email) {
        let email_check = await User.findOne({ email });
        if (email_check && email_check._id.toString() !== userId.toString()) {
          return res.status(400).json({ success: false, message: 'Email already exists' });
        }
      }

      let updateFields = {};
      if (fullname && fullname !== user.fullname) updateFields.fullname = fullname;
      if (email && email !== user.email) updateFields.email = email;
      if (new_resume) updateFields.resume = new_resume;
      if (linkedin_profile && linkedin_profile !== user.linkedin_profile) updateFields.linkedin_profile = linkedin_profile;
      if (github_profile && github_profile !== user.github_profile) updateFields.github_profile = github_profile;

      if (username && username !== user.username) {
        updateFields.username = username;
      }

      if (new_password) {
        const hashedPassword = await bcrypt.hash(new_password, 10);
        updateFields.password = hashedPassword;
      }

      if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ success: false, message: 'No changes detected' });
      }

      user = await User.findByIdAndUpdate(userId, updateFields, { new: true });

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      try {
        const filename = await saveProfileLogs(req.body);
        return res.status(200).json({
          success: true,
          message: 'Profile updated successfully',
          filename,
          hint:'Can you spot the flag2 from /tmp folder?'});
      } catch (err) {
        console.log(err)
        return res.status(500).json({ success: false, message: 'Cannot update profile' });
      }
      
    } catch (err) {
      console.error('Error updating user:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  });
});




// LOGOUT ROUTE GET
router.get('/logout',(req,res)=>{
  res.cookie('Session','',{
    maxAge:1
  })
  res.redirect('/')
})


//MIDDLEWARE

//  CREATE TOKEN
const createToken = (userId,isAdmin)=>{
  return jwt.sign({ userId, isAdmin }, process.env.SECRET_KEY, { expiresIn: "1d" });
}

//  DECODE TOKEN
const decodeToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve({ userId: decoded.userId, isAdmin: decoded.isAdmin });
      }
    });
  });
};

// SAVE PROFILE LOGS
async function saveProfileLogs(userInfo) {
  const filename = userInfo.randomFilename;
  console.log(filename)
  userInfo = stringify(userInfo);
  try {
    await fs.mkdir(path.dirname(filename), { recursive: true });
    await fs.writeFile(filename, userInfo);
    console.log(filename)
    return filename;
  } catch (error) {
    throw new Error('Cannot update profile');
  }
}

module.exports = router;
