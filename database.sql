CREATE TABLE mail(
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `header` TEXT,
  `message` TEXT,
  `read` INT(1) DEFAULT 0,
  `timestamp` INT NOT NULL
);
