CREATE TABLE `channels` (
  `id` INT(11) AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(25),
  `login` VARCHAR(50),
  `prefix` VARCHAR(25),
  `added` TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  `mode` TINYINT(1) DEFAULT 1,
  `is_modded` TINYINT(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `conduits` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `ignored_users` (
  `user_id` VARCHAR(25) UNIQUE,
  `reason` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `permissions` (
  `user_id` VARCHAR(25) UNIQUE,
  `permission` INT(2)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tokens` (
  `name` VARCHAR(255) NOT NULL PRIMARY KEY,
  `access_token` VARCHAR(255) NOT NULL,
  `refresh_token` VARCHAR(255) DEFAULT NULL,
  `expires_at` VARCHAR(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `subscriptions` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `type` VARCHAR(50),
  `version` INT(2),
  `channel_id` VARCHAR(20)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;