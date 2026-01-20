
CREATE TABLE ppp_telemetry (
  id         bigserial PRIMARY KEY,
  ppp_id     text NOT NULL,
  ts         timestamptz NOT NULL DEFAULT now(),
  event_type text NOT NULL,
  data       jsonb NOT NULL
);

-- Common query pattern: “latest for PPP”
CREATE INDEX ppp_telemetry_ppp_ts_idx ON ppp_telemetry (ppp_id, ts DESC);

-- Query inside JSONB efficiently
CREATE INDEX ppp_telemetry_data_gin_idx ON ppp_telemetry USING GIN (data);
