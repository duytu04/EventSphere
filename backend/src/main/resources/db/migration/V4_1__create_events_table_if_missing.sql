-- V4_1: đảm bảo bảng `events` tồn tại trước khi V5 ALTER
CREATE TABLE IF NOT EXISTS `events` (
  `id`            BIGINT NOT NULL AUTO_INCREMENT,
  `title`         VARCHAR(255) NOT NULL,
  `description`   TEXT NULL,
  `category`      VARCHAR(50) NULL,
  `venue`         VARCHAR(255) NULL,
  `start_time`    DATETIME(6) NULL,
  `end_time`      DATETIME(6) NULL,
  `total_seats`   INT NOT NULL DEFAULT 0,
  `seats_avail`   INT NOT NULL DEFAULT 0,
  `status`        VARCHAR(50) NOT NULL DEFAULT 'PENDING_APPROVAL',
  `organizer_id`  BIGINT NULL,
  `version`       BIGINT NOT NULL DEFAULT 0,
  `created_at`    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_events_start_time` (`start_time`),
  INDEX `idx_events_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
