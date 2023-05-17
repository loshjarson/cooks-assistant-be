require('dotenv').config()

const jwt = require("jsonwebtoken")

const User = require("../../data/models/")

const restricted = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      res.status(401);
    } else {
      jwt.verify(token, process.env.ACCESS_SECRET, (err, user) => {
        if (err) {
          res.status(403).json("Token is invalid");
        } else {
          req.user = user;
          next();
        }
      });
    }
  };