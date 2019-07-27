-- Drop and recreate Users table (Example)

DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS plans CASCADE;
DROP TABLE IF EXISTS collaborators CASCADE;
DROP TABLE IF EXISTS places CASCADE;
DROP TABLE IF EXISTS place_in_plans CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS visited_places CASCADE;




CREATE TABLE users (
  id SERIAL PRIMARY KEY NOT NULL,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE plans (
  id SERIAL PRIMARY KEY NOT NULL,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_date Date
);

CREATE TABLE  collaborators (
  id SERIAL PRIMARY KEY NOT NULL,
  plan_id INTEGER NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  auth_create_map BOOLEAN,
  auth_modify_map BOOLEAN
);


CREATE TABLE places (
  id SERIAL PRIMARY KEY NOT NULL,
  lantitude INTEGER,
  longtitude INTEGER,
  title VARCHAR(255)
  -- description VARCHAR(1000),
  -- image VARCHAR(1000)
);

CREATE TABLE place_in_plans (
  plan_id INTEGER NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  place_id  INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE
);


CREATE TABLE favorites (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  place_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  added_at DATE
);

CREATE TABLE visited_places (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  place_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  visite_date DATE
);