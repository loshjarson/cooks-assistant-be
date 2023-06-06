require('dotenv').config()
const { GridFsStorage } = require('multer-gridfs-storage');
const jwt = require("jsonwebtoken")
const multer = require("multer")
const User = require("../../data/user");


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

const imgStorage = new GridFsStorage({
  url: process.env.DATABASE_URL,
  options: {useNewUrlParser:true, useUnifiedTopology:true},
  file: (req, file) => {
    return {
      bucketName: 'images',
      filename: Date.now() + '-' + file.originalname,
    };
  }
})

const uploadImage = multer({imgStorage})

module.exports = { restricted, uploadImage }