// load .env data into process.env
require('dotenv').config();

// Web server config
const PORT       = process.env.PORT || 8080;
const ENV        = process.env.ENV || "development";
const express    = require("express");
const bodyParser = require("body-parser");
const sass       = require("node-sass-middleware");
const request = require('request');
const app        = express();
const morgan     = require('morgan');
const key        = process.env.key;

// PG database client/connection setup
const { Pool } = require('pg');
const dbParams = require('./lib/db.js');
const db = new Pool(dbParams);
db.connect();

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static("public"));

// Separated Routes for each Resource
// Note: Feel free to replace the example routes below with your own
const usersRoutes = require("./routes/users");
const widgetsRoutes = require("./routes/widgets");

// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
app.use("/api/users", usersRoutes(db));
app.use("/api/widgets", widgetsRoutes(db));
// Note: mount other resources here, using the same pattern above


// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).
app.post("/markup", (req,res)=>{
  request.post(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${req.body.query}&key=AIzaSyCS2HA8sY280xwjwAZbVRoA5hIzfDg41xM`, function(error,response,body) {
    res.send(body);
  });
});

app.post("/loadimage", (req,res)=>{
  request.post(`https://maps.googleapis.com/maps/api/place/photo?maxwidth=200&photoreference=${req.body.photoID}&key=AIzaSyCS2HA8sY280xwjwAZbVRoA5hIzfDg41xM`, function(error,response,body) {
    res.send(response.caseless.dict.location);
  });
});

app.post("/addmap", (req,res)=>{
  Pool.query(`INSERT INTO maps (name, longitude, latitude) VALUES ($1, $2, $3) RETURNING id`,[req.body.name, req.body.longitude, req.body.latitude]).then((mapID)=>{
    Pool.query(`INSERT INTO permission (user_id, map_id, edit) VALUES ($1, $2, true)`, [req.body.user, mapID]);
  });
});

app.post("/addplace",(req,res)=>{

});

app.get("/", (req, res) => {
  res.render("index");
});


app.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  db.query(`
  SELECT *
  FROM users
  Where name=$1 AND password=$2;
  `, [username, password]).then((response) => {
    if (response.rows.length) {
      res.send('authorized');
    } else {
      res.send('unauthorized');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
