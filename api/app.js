const express = require("express");
const cors = require('cors');
const logger = require('morgan');
const helmet = require('helmet'); 
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const dotenv = require('dotenv');
const config_result = dotenv.config();


const app = express();

app.use(helmet());
app.use(
    cors({
      origin: '*',
    })
  );
app.use(express.json());
app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));

module.exports = app;