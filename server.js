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
  db.query(`SELECT longitude, latitude FROM maps WHERE id = $1`,[req.body.mapid]).then((location)=>{
    request.post(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${req.body.query}&location=${location.rows[0].latitude}, ${location.rows[0].longitude}&radius=5000&key=AIzaSyCS2HA8sY280xwjwAZbVRoA5hIzfDg41xM`, function(error,response,body) {
      res.send(body);
    });
  });
});

app.post("/getcity",(req,res)=>{
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
  db.query(`INSERT INTO maps (name, longitude, latitude) VALUES ($1, $2, $3) RETURNING id`,[req.body.name, req.body.longitude, req.body.latitude]).then((mapID)=>{
    db.query(`INSERT INTO permission (member_id, map_id, edit) VALUES ($1, $2, true)`, [req.body.user, mapID.rows[0].id]).then(()=>{
      res.send('');
    });
  });
});

app.post("/addfavorite", (req,res)=>{
  db.query(`INSERT INTO favorites (user_id, map_id) VALUES ($1, $2)`,[req.body.userID, req.body.mapId]).then(()=>{
    res.send('');
  });
});

app.post("/addplace",(req,res)=>{
  db.query(`INSERT INTO places (latitude, longitude, rating, name, type, image, address) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,[req.body.latitude, req.body.longitude, req.body.rating, req.body.name, req.body.type, req.body.image, req.body.address]).then((placeID) => {
    db.query(`INSERT INTO place_on_map (map_id, place_id) VALUES ($1, $2)`,[req.body.mapID, placeID.rows[0].id]).then(()=>{
      res.send('');
    });
  });
});

app.post("/userid",(req,res) => {
  console.log('im in baby');
  db.query(`SELECT id FROM users WHERE name = $1`,[req.body.username]).then((userID)=>{
    res.send(String(userID.rows[0].id));
  });
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

app.post('/map_info', (req,res) => {
  const mapId = req.body.mapId;
  db.query(`
  SELECT *
  FROM places JOIN place_on_map on (place_on_map.place_id = places.id)
  WHERE place_on_map.map_id = $1;
  `, [mapId]).then((response) => {
    res.send(response.rows);
  });
});

app.get('/maps', (req,res) => {
  db.query(`
  SELECT *
  FROM maps
  `).then((response) => {
    res.send(response.rows);
  });
});


app.post('/delete', function(req, res) {
  const placeName = req.body.placeName;
  db.query(`
  DELETE FROM places
  WHERE places.name = $1;
  `, [placeName]).then((response) => {
  }).then(()=>{
    res.send('');
  });
});

app.post('/members/add', function(req, res) {
  const {mapId, memberName} = req.body;
  console.log(mapId)
  console.log(memberName)
  db.query(`
    SELECT users.id
    FROM users
    WHERE users.name = $1
  ;
  `,[memberName]).then((response) => {
    if (response.rows.length) {
      const userid = response.rows[0].id;
      db.query(`
      INSERT INTO permission (member_id, map_id, edit) VALUES ($1, $2, true)
      `, [userid, mapId]).then(()=>{
        res.send('');
      }).catch(error => {});
    }
  }).catch(error => {});
});




app.post('/auth', (req, res) => {
  const {mapid, userName} = req.body;
  console.log('person to be auth' + userName + mapid)
  db.query(`
  SELECT *
  FROM users JOIN permission on (users.id = permission.member_id)
  WHERE permission.map_id = $1 AND users.name = $2;
  `, [mapid, userName]).then((response) => {
    if(response.rows.length) {
      res.send('authorized')
    } else {
      res.send('unauthorized')
    }
  }).catch(error => {
    console.log(error)
  });
})

app.get('/contributions/:username', (req, res) => {
  const username = req.params.username;
  db.query(`
  SELECT maps.name, maps.id
  FROM users JOIN permission ON users.id = permission.member_id
  JOIN maps ON maps.id = permission.map_id
  WHERE users.name = $1
  `, [username]).then((response) => {
    res.send(response.rows);
  }).catch(error => {
  });
});

app.get('/favorites/:username', (req, res) => {
  const username = req.params.username;
  db.query(`
  SELECT DISTINCT maps.name, maps.id
  FROM users JOIN favorites ON users.id = favorites.user_id
  JOIN maps ON maps.id = favorites.map_id
  WHERE users.name = $1
  `, [username]).then((response) => {
    res.send(response.rows);
  }).catch(error => {
  });
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
