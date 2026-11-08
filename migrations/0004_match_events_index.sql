CREATE INDEX IF NOT EXISTS club_events_by_match
ON club_records (json_extract(payload, '$.matchId'), record_id)
WHERE collection = 'events';
