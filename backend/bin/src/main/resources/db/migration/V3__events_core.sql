CREATE TABLE IF NOT EXISTS events (
  event_id     BIGINT AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(200) NOT NULL,
  description  TEXT,
  category     VARCHAR(60),
  venue        VARCHAR(120),
  start_time   DATETIME NOT NULL,
  end_time     DATETIME NOT NULL,
  total_seats  INT NOT NULL DEFAULT 0,
  seats_avail  INT NOT NULL DEFAULT 0,
  status       VARCHAR(20) NOT NULL DEFAULT 'DRAFT', -- DRAFT, PENDING_APPROVAL, APPROVED, REJECTED
  organizer_id BIGINT,
  version      BIGINT NOT NULL DEFAULT 0,            -- optimistic lock
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_events_status (status),
  INDEX idx_events_start (start_time),
  INDEX idx_events_title (title)
);
