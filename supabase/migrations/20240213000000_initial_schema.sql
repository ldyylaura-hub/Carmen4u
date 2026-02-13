-- 创建偶像信息表
CREATE TABLE IF NOT EXISTS idol_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    stage_name VARCHAR(100),
    birth_date DATE,
    group_name VARCHAR(100),
    debut_date DATE,
    concept_colors VARCHAR(100),
    basic_info JSONB DEFAULT '{}',
    bio TEXT,
    achievements JSONB DEFAULT '[]',
    stats JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建时间轴事件表
CREATE TABLE IF NOT EXISTS timeline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idol_id UUID REFERENCES idol_info(id) ON DELETE CASCADE,
    event_date DATE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    image_url TEXT,
    category VARCHAR(50),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建媒体项目表
CREATE TABLE IF NOT EXISTS media_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idol_id UUID REFERENCES idol_info(id) ON DELETE CASCADE,
    type VARCHAR(20) CHECK (type IN ('photo', 'video', 'audio')),
    title VARCHAR(200) NOT NULL,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    metadata JSONB DEFAULT '{}',
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建留言表
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建点赞表
CREATE TABLE IF NOT EXISTS likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, comment_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_timeline_events_idol_id ON timeline_events(idol_id);
CREATE INDEX IF NOT EXISTS idx_timeline_events_date ON timeline_events(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_timeline_events_category ON timeline_events(category);
CREATE INDEX IF NOT EXISTS idx_media_items_idol_id ON media_items(idol_id);
CREATE INDEX IF NOT EXISTS idx_media_items_type ON media_items(type);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_comment_id ON likes(comment_id);

-- 启用 RLS (Row Level Security)
ALTER TABLE idol_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- 设置 RLS 策略 (Policies)

-- idol_info: 所有人可读
CREATE POLICY "Public profiles are viewable by everyone" ON idol_info FOR SELECT USING (true);

-- timeline_events: 所有人可读
CREATE POLICY "Timeline events are viewable by everyone" ON timeline_events FOR SELECT USING (true);

-- media_items: 所有人可读
CREATE POLICY "Media items are viewable by everyone" ON media_items FOR SELECT USING (true);

-- users: 所有人可读基本信息 (实际应用中可能需要更细粒度控制，这里简化)
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
-- users: 用户只能更新自己的信息
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- comments: 所有人可读
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
-- comments: 认证用户可以创建评论
CREATE POLICY "Authenticated users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
-- comments: 用户可以删除自己的评论
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- likes: 所有人可读
CREATE POLICY "Likes are viewable by everyone" ON likes FOR SELECT USING (true);
-- likes: 认证用户可以创建点赞
CREATE POLICY "Authenticated users can create likes" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
-- likes: 用户可以删除自己的点赞
CREATE POLICY "Users can delete own likes" ON likes FOR DELETE USING (auth.uid() = user_id);

-- 设置权限 (Grants)
GRANT SELECT ON idol_info TO anon, authenticated;
GRANT SELECT ON timeline_events TO anon, authenticated;
GRANT SELECT ON media_items TO anon, authenticated;
GRANT SELECT ON comments TO anon, authenticated;
GRANT SELECT ON likes TO anon, authenticated;
GRANT SELECT ON users TO anon, authenticated;

GRANT INSERT, UPDATE, DELETE ON comments TO authenticated;
GRANT INSERT, UPDATE, DELETE ON likes TO authenticated;
GRANT INSERT, UPDATE ON users TO authenticated;
