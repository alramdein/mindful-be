
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

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTO_INCREMENT, 
  sub VARCHAR (255) UNIQUE,
  name VARCHAR (255),
  avatar VARCHAR (255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE rooms (
  id INTEGER PRIMARY KEY AUTO_INCREMENT, 
  roomid VARCHAR (255)
);

CREATE TABLE chat_rooms (
  id INTEGER PRIMARY KEY AUTO_INCREMENT, 
  room_id INTEGER,
  owner_id INTEGER,
  partner_id INTEGER,
  CONSTRAINT fk_roomid FOREIGN KEY (room_id) 
    REFERENCES rooms(id),
  CONSTRAINT fk_owner_id FOREIGN KEY (owner_id) 
    REFERENCES users(id),
  CONSTRAINT fk_partner_id FOREIGN KEY (partner_id) 
    REFERENCES users(id)
);

CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  user_id INTEGER,
  room_id INTEGER, 
  message TEXT,
  `timestamp` TIMESTAMP DEFAULT NOW(),
  isSeen BOOLEAN,
  CONSTRAINT fk_roomid_messages FOREIGN KEY (room_id) REFERENCES rooms(id),
  CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id)
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