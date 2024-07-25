const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const checkUser = async (req, res, next) => {
  try {
    const token = req.cookies.Session;
    if (token) {
      jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
        if (err) {
          res.locals.user = null;
        } else {
          const user = await User.findById(decoded.userId);
          res.locals.user = user;
        }
        next();
      });
    } else {
      res.locals.user = null;
      next();
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const authenticateToken = async (req, res, next) => {
  try {
    const token = req.cookies.Session;
    if (token) {
      jwt.verify(token, process.env.SECRET_KEY, (err) => {
        if (err) {
          return res.redirect("/login");
        } else {
          next();
        }
      });
    } else {
      return res.redirect("/login");
    }
  } catch (err) {
    console.log(err);
    res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
};

const isAdmin = (req, res, next) => {
  const token = req.cookies.Session;
  if (token) {
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        res.render('index', { message: "Your Token is invalid" });
      } else {
        if (decoded.isAdmin) {
          return next();
        } else {
          res.render('index', { message: 'You are not authorized to access this page' });
        }
      }
    });
  } else {
    res.render('index', { message: "Token isn't provided! Please try again" });
  }
};

module.exports = { authenticateToken, checkUser, isAdmin };
