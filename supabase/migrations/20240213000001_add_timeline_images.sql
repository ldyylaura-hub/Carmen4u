-- Add Debut and Comeback events with images
INSERT INTO timeline_events (idol_id, event_date, title, description, category, display_order, image_url)
SELECT id, '2025-02-24', 'Official Debut', 'Carmen officially debuted with the single "First Love" under SM Entertainment, captivating the world with her unique voice.', 'milestone', 1, 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2070&auto=format&fit=crop'
FROM idol_info WHERE stage_name = 'Carmen';

INSERT INTO timeline_events (idol_id, event_date, title, description, category, display_order, image_url)
SELECT id, '2025-08-15', 'Summer Comeback', 'Released her first mini-album "Tropical Dreams", featuring the hit summer anthem "Breeze".', 'release', 2, 'https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=2070&auto=format&fit=crop'
FROM idol_info WHERE stage_name = 'Carmen';

INSERT INTO timeline_events (idol_id, event_date, title, description, category, display_order, image_url)
SELECT id, '2025-12-20', 'Winter Special', 'A special winter ballad "Snowflake" dedicated to her fans, showcasing her emotional vocal range.', 'release', 3, 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=2070&auto=format&fit=crop'
FROM idol_info WHERE stage_name = 'Carmen';
