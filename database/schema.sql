USE campus_gig;

ALTER TABLE projects ADD COLUMN freelancerId INT;
ALTER TABLE users ADD COLUMN number VARCHAR(20) AFTER email;

ALTER TABLE projects
ADD CONSTRAINT freelancer
FOREIGN KEY (freelancerId) REFERENCES users(userId)
ON DELETE SET NULL;

SELECT * FROM users;
SELECT * FROM projects;
SELECT * FROM orders;	

DESCRIBE users;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS bids;

ALTER TABLE projects DROP FOREIGN KEY freelancer;

TRUNCATE TABLE users;
TRUNCATE TABLE projects;
TRUNCATE TABLE orders;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  userId INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  number VARCHAR(20) UNIQUE NOT NULL,
  role ENUM('client', 'freelancer') NOT NULL
);

CREATE TABLE projects (
  projectId INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  budget DECIMAL(10,2) NOT NULL,
  deadline DATE NOT NULL,
  status ENUM('available', 'in_progress', 'completed') DEFAULT 'available',
  freelancerId INT NULL,
  FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE,
  FOREIGN KEY (freelancerId) REFERENCES users(userId) ON DELETE SET NULL
);

CREATE TABLE orders (
  orderId INT AUTO_INCREMENT PRIMARY KEY,
  projectId INT NOT NULL,
  freelancerId INT NOT NULL,
  agreedAmount INT NOT NULL,
  acceptedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (projectId) REFERENCES projects(projectId) ON DELETE CASCADE,
  FOREIGN KEY (freelancerId) REFERENCES users(userId)
);


