-- Reset Flyway schema history
USE eventsphere;
DROP TABLE IF EXISTS flyway_schema_history;

-- Drop all existing tables to start fresh (in correct order due to foreign keys)
DROP TABLE IF EXISTS admin_notifications;
DROP TABLE IF EXISTS event_edit_requests;
DROP TABLE IF EXISTS registrations;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

-- Show tables to confirm they are dropped
SHOW TABLES;
