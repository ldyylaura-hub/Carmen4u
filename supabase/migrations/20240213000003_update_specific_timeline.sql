-- Clear existing timeline events to avoid duplicates and outdated info
DELETE FROM timeline_events;

-- Insert new specific events provided by user

-- 1. Debut: The Chase (2.24)
INSERT INTO timeline_events (idol_id, event_date, title, description, category, display_order, image_url)
SELECT id, '2025-02-24', 'The Chase (Single)', '正式出道 (Official Debut)', 'debut', 1, 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2070&auto=format&fit=crop'
FROM idol_info WHERE stage_name = 'Carmen';

-- 2. Endorsement: Mega (2.24)
INSERT INTO timeline_events (idol_id, event_date, title, description, category, display_order, image_url)
SELECT id, '2025-02-24', 'Mega Endorsement', '出道首个代言（团体） (First Group Endorsement)', 'endorsement', 2, 'https://images.unsplash.com/photo-1550614000-4b9519e02a15?q=80&w=2070&auto=format&fit=crop'
FROM idol_info WHERE stage_name = 'Carmen';

-- 3. Birthday (3.28)
INSERT INTO timeline_events (idol_id, event_date, title, description, category, display_order, image_url)
SELECT id, '2025-03-28', 'Happy Carmen Day', '出道后首次生日 (First Birthday after Debut)', 'personal', 3, 'https://images.unsplash.com/photo-1530103862676-de3c9da59af7?q=80&w=2070&auto=format&fit=crop'
FROM idol_info WHERE stage_name = 'Carmen';

-- 4. Comeback: Style (6.18)
INSERT INTO timeline_events (idol_id, event_date, title, description, category, display_order, image_url)
SELECT id, '2025-06-18', 'Style (Single)', '第一次回归（单曲回归） (1st Comeback - Single)', 'comeback', 4, 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2070&auto=format&fit=crop'
FROM idol_info WHERE stage_name = 'Carmen';

-- 5. ISAC (8.16)
INSERT INTO timeline_events (idol_id, event_date, title, description, category, display_order, image_url)
SELECT id, '2025-08-16', 'ISAC Gold Medal', '参与接力拿下金牌 (Won Gold in Relay at ISAC)', 'variety', 5, 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2070&auto=format&fit=crop'
FROM idol_info WHERE stage_name = 'Carmen';

-- 6. Comeback: Focus (10.20)
INSERT INTO timeline_events (idol_id, event_date, title, description, category, display_order, image_url)
SELECT id, '2025-10-20', 'Focus (Mini Album)', '第二次回归（mini album回归） (2nd Comeback - Mini Album)', 'comeback', 6, 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop'
FROM idol_info WHERE stage_name = 'Carmen';
