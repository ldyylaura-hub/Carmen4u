-- Insert Idol Info
INSERT INTO idol_info (name, stage_name, bio, basic_info, concept_colors)
VALUES (
  'Carmen', 
  'Carmen', 
  'A rising star with a voice that touches souls and a vision that inspires millions. Known for her unique blend of pop and ethereal sounds.',
  '{"height": "168cm", "mbti": "ENFP", "hobbies": ["Songwriting", "Photography", "Stargazing"]}',
  'Pink & Purple'
)
ON CONFLICT DO NOTHING; -- Avoid duplicates if re-run (though no unique constraint on name, good practice)

-- Insert Timeline Events
INSERT INTO timeline_events (idol_id, event_date, title, description, category, display_order)
SELECT id, '2020-05-15', 'The Beginning', 'Officially debuted with the single "Starlight", topping charts instantly.', 'milestone', 1
FROM idol_info WHERE stage_name = 'Carmen';

INSERT INTO timeline_events (idol_id, event_date, title, description, category, display_order)
SELECT id, '2021-08-20', 'Rookie of the Year', 'Won "Rookie of the Year" at the Global Music Awards, cementing her status as a super rookie.', 'award', 2
FROM idol_info WHERE stage_name = 'Carmen';

INSERT INTO timeline_events (idol_id, event_date, title, description, category, display_order)
SELECT id, '2022-03-10', 'First Mini Album', 'Released "Nebula", exploring deeper musical themes and achieving double platinum sales.', 'release', 3
FROM idol_info WHERE stage_name = 'Carmen';

INSERT INTO timeline_events (idol_id, event_date, title, description, category, display_order)
SELECT id, '2023-11-10', 'Galaxy World Tour', 'Kicked off the "Galaxy" world tour in Seoul, selling out stadiums across 5 continents.', 'concert', 4
FROM idol_info WHERE stage_name = 'Carmen';

-- Insert Media Items
INSERT INTO media_items (idol_id, type, title, url, display_order)
SELECT id, 'photo', 'Concept Photo: Nebula', 'https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=2070&auto=format&fit=crop', 1
FROM idol_info WHERE stage_name = 'Carmen';

INSERT INTO media_items (idol_id, type, title, url, display_order)
SELECT id, 'photo', 'Stage Performance: Tokyo', 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2070&auto=format&fit=crop', 2
FROM idol_info WHERE stage_name = 'Carmen';

INSERT INTO media_items (idol_id, type, title, url, display_order)
SELECT id, 'photo', 'Backstage Moment', 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=2070&auto=format&fit=crop', 3
FROM idol_info WHERE stage_name = 'Carmen';

INSERT INTO media_items (idol_id, type, title, url, display_order)
SELECT id, 'video', 'Starlight MV', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1
FROM idol_info WHERE stage_name = 'Carmen';
