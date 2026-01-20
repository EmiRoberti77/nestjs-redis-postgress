SELECT *
FROM ppp_telemetry
WHERE ppp_id = 'PPP-001'
ORDER BY ts DESC
LIMIT 1;

SELECT *
FROM ppp_telemetry
WHERE (data->'link'->>'rssi')::int < -80;


SELECT *
FROM ppp_telemetry
WHERE data ? 'link';


SELECT *
FROM ppp_telemetry
WHERE data @> '{"link":{"type":"cell"}}';
