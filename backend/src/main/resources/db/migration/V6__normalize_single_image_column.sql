-- V6: Chuẩn hoá cột ảnh cho bảng events: chỉ dùng main_image_url
-- 1) Nếu còn cột cũ image_url thì drop
SET @legacy_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME   = 'events'
    AND COLUMN_NAME  = 'image_url'
);

SET @ddl1 := IF(@legacy_exists > 0,
  'ALTER TABLE `events` DROP COLUMN `image_url`',
  'SELECT 1'
);
PREPARE s1 FROM @ddl1; EXECUTE s1; DEALLOCATE PREPARE s1;

-- 2) Nếu CHƯA có main_image_url thì thêm
SET @main_exists := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME   = 'events'
    AND COLUMN_NAME  = 'main_image_url'
);

SET @ddl2 := IF(@main_exists = 0,
  'ALTER TABLE `events` ADD COLUMN `main_image_url` VARCHAR(512) NULL AFTER `description`',
  'SELECT 1'
);
PREPARE s2 FROM @ddl2; EXECUTE s2; DEALLOCATE PREPARE s2;

-- 3) Đảm bảo kiểu/độ dài đúng (nếu đã tồn tại)
SET @ddl3 := IF(@main_exists > 0,
  'ALTER TABLE `events` MODIFY COLUMN `main_image_url` VARCHAR(512) NULL',
  'SELECT 1'
);
PREPARE s3 FROM @ddl3; EXECUTE s3; DEALLOCATE PREPARE s3;
