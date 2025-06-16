SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS `m183_lb2` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE `m183_lb2`;

--
-- Table structure for table `tasks`
--
DROP TABLE IF EXISTS `tasks`;
CREATE TABLE IF NOT EXISTS `tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `task` varchar(255) NOT NULL,
  `user_id` int NOT NULL,
  `status` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Sample data for table `tasks`
--
INSERT INTO `tasks` (`id`, `task`, `user_id`, `status`) VALUES
(1, 'Redesign login page', 1, 0),
(2, 'Implement user login', 1, 0),
(3, 'Create database', 1, 0),
(4, 'Implement MFA', 1, 0);

--
-- Table structure for table `users`
--
DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Sample data for table `users`
-- The plain text password is 'admin'.
-- You can generate new hashes using the hash-password.js script.
--
INSERT INTO `users` (`id`, `username`, `password`) VALUES
(1, 'nussbaumerv9@gmail.com', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4');
COMMIT;