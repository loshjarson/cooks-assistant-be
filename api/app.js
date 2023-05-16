const express = require("express");
const cors = require('cors');
const logger = require('morgan');
const helmet = require('helmet'); 
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const dotenv = require('dotenv').config();


const app = express();


//Database Connection
const mongoose = require("mongoose")
mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection
db.on('error', (error) => console.log(error))
db.once('open', ()=> console.log("Connected to database"))


//Middleware
app.use(helmet());
app.use(
    cors({
      origin: '*',
    })
  );
app.use(express.json());
app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));

//Routes
const usersRouter = require('./Routes/users')
const recipesRouter = require('./Routes/recipes')

app.use('/users', usersRouter)
app.use('/recipes', recipesRouter)

module.exports = app;