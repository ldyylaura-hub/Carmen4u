-- Clear existing timeline events to avoid duplicates
DELETE FROM timeline_events;

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

-- 4. Endorsement: Scalett (6.9)
INSERT INTO timeline_events (idol_id, event_date, title, description, category, display_order, image_url)
SELECT id, '2025-06-09', 'Scalett Endorsement', '第二个团体代言，家乡本土代言，扩大家乡知名度 (2nd Group Endorsement, Hometown Brand)', 'endorsement', 4, 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=2070&auto=format&fit=crop'
FROM idol_info WHERE stage_name = 'Carmen';

-- 5. Comeback: Style (6.18)
INSERT INTO timeline_events (idol_id, event_date, title, description, category, display_order, image_url)
SELECT id, '2025-06-18', 'Style (Single)', '第一次回归（单曲回归） (1st Comeback - Single)', 'comeback', 5, 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2070&auto=format&fit=crop'
FROM idol_info WHERE stage_name = 'Carmen';

-- 6. Endorsement: 2an (7.21)
INSERT INTO timeline_events (idol_id, event_date, title, description, category, display_order, image_url)
SELECT id, '2025-07-21', '2an Endorsement', '第三个团体代言 (3rd Group Endorsement)', 'endorsement', 6, 'https://images.unsplash.com/photo-1596462502278-27bfdd403348?q=80&w=2070&auto=format&fit=crop'
FROM idol_info WHERE stage_name = 'Carmen';

-- 7. Endorsement: KB Bank (8.11)
INSERT INTO timeline_events (idol_id, event_date, title, description, category, display_order, image_url)
SELECT id, '2025-08-11', 'KB Bank Endorsement', '第四个团体代言（大代言） (4th Group Endorsement - Major Brand)', 'endorsement', 7, 'https://images.unsplash.com/photo-1565514020176-db708b5e4063?q=80&w=2070&auto=format&fit=crop'
FROM idol_info WHERE stage_name = 'Carmen';

-- 8. ISAC (8.16)
INSERT INTO timeline_events (idol_id, event_date, title, description, category, display_order, image_url)
SELECT id, '2025-08-16', 'ISAC Gold Medal', '参与接力拿下金牌 (Won Gold in Relay at ISAC)', 'variety', 8, 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2070&auto=format&fit=crop'
FROM idol_info WHERE stage_name = 'Carmen';

-- 9. Comeback: Focus (10.20)
INSERT INTO timeline_events (idol_id, event_date, title, description, category, display_order, image_url)
SELECT id, '2025-10-20', 'Focus (Mini Album)', '第二次回归（mini album回归） (2nd Comeback - Mini Album)', 'comeback', 9, 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop'
FROM idol_info WHERE stage_name = 'Carmen';

-- 10. Endorsement: Lily Brown (10.21)
INSERT INTO timeline_events (idol_id, event_date, title, description, category, display_order, image_url)
SELECT id, '2025-10-21', 'Lily Brown Endorsement', '第五个团体代言 (5th Group Endorsement)', 'endorsement', 10, 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop'
FROM idol_info WHERE stage_name = 'Carmen';

-- 11. Endorsement: Converse (11.7)
INSERT INTO timeline_events (idol_id, event_date, title, description, category, display_order, image_url)
SELECT id, '2025-11-07', 'Converse Endorsement', '第六个团体代言 (6th Group Endorsement)', 'endorsement', 11, 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=2070&auto=format&fit=crop'
FROM idol_info WHERE stage_name = 'Carmen';

-- 12. Doll Birth (2026.1.10)
INSERT INTO timeline_events (idol_id, event_date, title, description, category, display_order, image_url)
SELECT id, '2026-01-10', 'Official Doll Birth', '卡门的第一只官方娃娃出生啦^^ (Carmen''s First Official Doll Released)', 'merchandise', 12, 'https://images.unsplash.com/photo-1589802829985-817e51171b92?q=80&w=2070&auto=format&fit=crop'
FROM idol_info WHERE stage_name = 'Carmen';
