-- V5: Add 1 cột ảnh chính cho bảng events (idempotent, MySQL 8)
-- Nếu cột chưa có thì mới ADD
SET @col_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'events'
    AND COLUMN_NAME = 'main_image_url'
);

SET @ddl := IF(@col_exists = 0,
  'ALTER TABLE `events` ADD COLUMN `main_image_url` VARCHAR(512) NULL AFTER `description`',
  'SELECT 1'
);

PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
