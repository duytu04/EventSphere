-- =========================================
-- V4__upgrade_events_single_image.sql  (idempotent, no triggers)
-- =========================================
SET @db := DATABASE();

-- 1) RENAME title -> name (nếu còn title)
SET @exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='events' AND COLUMN_NAME='title'
);
SET @sql := IF(@exists=1,
  'ALTER TABLE events RENAME COLUMN title TO name',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2) RENAME venue -> location
SET @exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='events' AND COLUMN_NAME='venue'
);
SET @sql := IF(@exists=1,
  'ALTER TABLE events RENAME COLUMN venue TO location',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3) RENAME total_seats -> capacity
SET @exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='events' AND COLUMN_NAME='total_seats'
);
SET @sql := IF(@exists=1,
  'ALTER TABLE events RENAME COLUMN total_seats TO capacity',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 4) RENAME seats_avail -> seats_available
SET @exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='events' AND COLUMN_NAME='seats_avail'
);
SET @sql := IF(@exists=1,
  'ALTER TABLE events RENAME COLUMN seats_avail TO seats_available',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 5) ADD main_image_url nếu chưa có
SET @exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=@db AND TABLE_NAME='events' AND COLUMN_NAME='main_image_url'
);
SET @sql := IF(@exists=0,
  'ALTER TABLE events ADD COLUMN main_image_url VARCHAR(512) NULL AFTER description',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 6) Chuẩn hoá status + CHECK (IDEMPOTENT)
-- 6.1) status type/DEFAULT
ALTER TABLE events
  MODIFY COLUMN status VARCHAR(30) NOT NULL DEFAULT 'DRAFT';

-- 6.2) chk_events_status
SET @has := (
  SELECT COUNT(*) FROM information_schema.table_constraints
  WHERE table_schema=@db AND table_name='events'
    AND constraint_name='chk_events_status' AND constraint_type='CHECK'
);
SET @sql := IF(@has=0,
  'ALTER TABLE events ADD CONSTRAINT chk_events_status CHECK (status IN (''DRAFT'',''PENDING_APPROVAL'',''APPROVED'',''REJECTED''))',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 6.3) chk_events_time
SET @has := (
  SELECT COUNT(*) FROM information_schema.table_constraints
  WHERE table_schema=@db AND table_name='events'
    AND constraint_name='chk_events_time' AND constraint_type='CHECK'
);
SET @sql := IF(@has=0,
  'ALTER TABLE events ADD CONSTRAINT chk_events_time CHECK (start_time < end_time)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 6.4) chk_events_capacity
SET @has := (
  SELECT COUNT(*) FROM information_schema.table_constraints
  WHERE table_schema=@db AND table_name='events'
    AND constraint_name='chk_events_capacity' AND constraint_type='CHECK'
);
SET @sql := IF(@has=0,
  'ALTER TABLE events ADD CONSTRAINT chk_events_capacity CHECK (capacity >= 0)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 6.5) chk_events_seats_range
SET @has := (
  SELECT COUNT(*) FROM information_schema.table_constraints
  WHERE table_schema=@db AND table_name='events'
    AND constraint_name='chk_events_seats_range' AND constraint_type='CHECK'
);
SET @sql := IF(@has=0,
  'ALTER TABLE events ADD CONSTRAINT chk_events_seats_range CHECK (seats_available >= 0 AND seats_available <= capacity)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 7) Index có điều kiện (tránh CREATE INDEX IF NOT EXISTS)
-- idx_events_status_start (status, start_time)
SET @exists := (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema=@db AND table_name='events' AND index_name='idx_events_status_start'
);
SET @sql := IF(@exists=0,
  'CREATE INDEX idx_events_status_start ON events (status, start_time)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- idx_events_org_status (organizer_id, status)
SET @exists := (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema=@db AND table_name='events' AND index_name='idx_events_org_status'
);
SET @sql := IF(@exists=0,
  'CREATE INDEX idx_events_org_status ON events (organizer_id, status)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- (tuỳ chọn) FULLTEXT name+description
SET @exists := (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema=@db AND table_name='events' AND index_name='ftx_events_name_desc'
);
SET @sql := IF(@exists=0,
  'ALTER TABLE events ADD FULLTEXT INDEX ftx_events_name_desc (name, description)',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- NOTE: Bỏ TRIGGER ở V4 để tránh DELIMITER trong SQL migration.
-- Nếu cần, sẽ thêm bằng Java-based migration hoặc V5 tách riêng.
