SELECT
    l.id AS lead_id,
    l.source,
    l.stage,
    l.message,
    l.created_at,
    c.name AS contact_name,
    c.phone AS raw_phone,
    c.phone_normalized,
    c.email AS contact_email,
    c.contact_type,
    p.title AS property_title,
    p.city AS property_city,
    p.reference_code AS property_ref
FROM leads l
JOIN contacts c ON c.id = l.contact_id
LEFT JOIN properties p ON p.id = l.property_id
ORDER BY l.created_at DESC
LIMIT 1;