CREATE TABLE IF NOT EXISTS scrapbook_login_attempts (
  client TEXT PRIMARY KEY,
  window INTEGER NOT NULL,
  attempts INTEGER NOT NULL
);
