-- Drop and recreate Users table (Example)

DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS permission CASCADE;
DROP TABLE IF EXISTS maps CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS places CASCADE;
DROP TABLE IF EXISTS place_on_map CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY NOT NULL,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE maps (
  id SERIAL PRIMARY KEY NOT NULL,
  name VARCHAR(255) NOT NULL,
  longitude VARCHAR(255) NOT NULL,
  latitude VARCHAR(255) NOT NULL
);

CREATE TABLE places (
  id SERIAL PRIMARY KEY NOT NULL,
  latitude VARCHAR(255),
  longitude VARCHAR(255),
  rating VARCHAR(255),
  name VARCHAR(255),
  type VARCHAR(1000),
  image VARCHAR(1000),
  address VARCHAR(255)
);

CREATE TABLE permission (
  id SERIAL PRIMARY KEY NOT NULL,
  member_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  map_id INTEGER NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
  edit BOOLEAN
);


CREATE TABLE favorites (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  map_id INTEGER NOT NULL REFERENCES maps(id) ON DELETE CASCADE
);

CREATE TABLE place_on_map (
  id SERIAL PRIMARY KEY NOT NULL,
  map_id INTEGER NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
  place_id  INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE
);
