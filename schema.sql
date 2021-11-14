
create database mindfulTest;
use mindfulTest;

CREATE TABLE posts (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  description VARCHAR
(255),
  title VARCHAR
(255),
  image_url VARCHAR
(255),
  `timestamp` TIMESTAMP DEFAULT NOW
()
);

-- CREATE TABLE moods(
--    id INTEGER PRIMARY KEY AUTO_INCREMENT,
--    `timestamp` TIMESTAMP DEFAULT NOW(),
--    rating INTEGER 
-- )

-- create database mindfulTest;
-- use mindfulTest;

-- CREATE TABLE posts (
--   id INTEGER PRIMARY KEY AUTO_INCREMENT,
--   description VARCHAR(255),
--   title VARCHAR(255),
--   image_url VARCHAR(255),
--   `timestamp` TIMESTAMP DEFAULT NOW()
-- );


-- CREATE USER 'testUser'@'localhost' IDENTIFIED WITH mysql_native_password BY 'testUser';
-- GRANT ALL PRIVILEGES ON *.* TO 'testUser'@'localhost';