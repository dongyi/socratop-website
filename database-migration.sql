-- 装备评论和评分功能数据库迁移脚本
-- 请在 Supabase Dashboard 的 SQL 编辑器中运行此脚本

-- 1. 创建装备评论表
CREATE TABLE IF NOT EXISTS equipment_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    sku_id UUID NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_title VARCHAR(100),
    review_content TEXT,
    pros TEXT,
    cons TEXT,
    usage_duration INTEGER CHECK (usage_duration >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 外键约束
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    FOREIGN KEY (sku_id) REFERENCES skus(id) ON DELETE CASCADE,
    
    -- 唯一约束：每个用户只能对一个SKU评价一次
    UNIQUE(user_id, sku_id)
);

-- 2. 创建装备评分汇总表（用于性能优化）
CREATE TABLE IF NOT EXISTS equipment_ratings (
    sku_id UUID PRIMARY KEY,
    average_rating DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    review_count INTEGER NOT NULL DEFAULT 0,
    rating_distribution JSONB DEFAULT '{"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 外键约束
    FOREIGN KEY (sku_id) REFERENCES skus(id) ON DELETE CASCADE
);

-- 3. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_equipment_reviews_sku_id ON equipment_reviews(sku_id);
CREATE INDEX IF NOT EXISTS idx_equipment_reviews_user_id ON equipment_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_equipment_reviews_rating ON equipment_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_equipment_reviews_created_at ON equipment_reviews(created_at DESC);

-- 4. 创建触发器函数，自动更新装备评分汇总
CREATE OR REPLACE FUNCTION update_equipment_ratings()
RETURNS TRIGGER AS $$
BEGIN
    -- 更新平均评分和评论数量
    INSERT INTO equipment_ratings (sku_id, average_rating, review_count, rating_distribution)
    VALUES (
        COALESCE(NEW.sku_id, OLD.sku_id),
        (
            SELECT COALESCE(AVG(rating), 0)::DECIMAL(3,2) 
            FROM equipment_reviews 
            WHERE sku_id = COALESCE(NEW.sku_id, OLD.sku_id)
        ),
        (
            SELECT COUNT(*) 
            FROM equipment_reviews 
            WHERE sku_id = COALESCE(NEW.sku_id, OLD.sku_id)
        ),
        (
            SELECT jsonb_build_object(
                '1', COUNT(*) FILTER (WHERE rating = 1),
                '2', COUNT(*) FILTER (WHERE rating = 2),
                '3', COUNT(*) FILTER (WHERE rating = 3),
                '4', COUNT(*) FILTER (WHERE rating = 4),
                '5', COUNT(*) FILTER (WHERE rating = 5)
            )
            FROM equipment_reviews 
            WHERE sku_id = COALESCE(NEW.sku_id, OLD.sku_id)
        )
    )
    ON CONFLICT (sku_id) DO UPDATE SET
        average_rating = (
            SELECT COALESCE(AVG(rating), 0)::DECIMAL(3,2) 
            FROM equipment_reviews 
            WHERE sku_id = EXCLUDED.sku_id
        ),
        review_count = (
            SELECT COUNT(*) 
            FROM equipment_reviews 
            WHERE sku_id = EXCLUDED.sku_id
        ),
        rating_distribution = (
            SELECT jsonb_build_object(
                '1', COUNT(*) FILTER (WHERE rating = 1),
                '2', COUNT(*) FILTER (WHERE rating = 2),
                '3', COUNT(*) FILTER (WHERE rating = 3),
                '4', COUNT(*) FILTER (WHERE rating = 4),
                '5', COUNT(*) FILTER (WHERE rating = 5)
            )
            FROM equipment_reviews 
            WHERE sku_id = EXCLUDED.sku_id
        ),
        updated_at = NOW();
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 5. 创建触发器
DROP TRIGGER IF EXISTS trigger_update_equipment_ratings ON equipment_reviews;
CREATE TRIGGER trigger_update_equipment_ratings
    AFTER INSERT OR UPDATE OR DELETE ON equipment_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_equipment_ratings();

-- 6. 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. 为评论表创建自动更新时间触发器
DROP TRIGGER IF EXISTS trigger_equipment_reviews_updated_at ON equipment_reviews;
CREATE TRIGGER trigger_equipment_reviews_updated_at
    BEFORE UPDATE ON equipment_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. 创建RLS策略
ALTER TABLE equipment_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_ratings ENABLE ROW LEVEL SECURITY;

-- 评论表RLS策略
DROP POLICY IF EXISTS "Users can view all reviews" ON equipment_reviews;
CREATE POLICY "Users can view all reviews" ON equipment_reviews
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own reviews" ON equipment_reviews;
CREATE POLICY "Users can insert their own reviews" ON equipment_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own reviews" ON equipment_reviews;
CREATE POLICY "Users can update their own reviews" ON equipment_reviews
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own reviews" ON equipment_reviews;
CREATE POLICY "Users can delete their own reviews" ON equipment_reviews
    FOR DELETE USING (auth.uid() = user_id);

-- 评分汇总表RLS策略
DROP POLICY IF EXISTS "Everyone can view equipment ratings" ON equipment_ratings;
CREATE POLICY "Everyone can view equipment ratings" ON equipment_ratings
    FOR SELECT USING (true);

-- 只允许通过触发器更新评分汇总表
DROP POLICY IF EXISTS "Only system can modify equipment ratings" ON equipment_ratings;
CREATE POLICY "Only system can modify equipment ratings" ON equipment_ratings
    FOR INSERT WITH CHECK (false);

CREATE POLICY "Only system can update equipment ratings" ON equipment_ratings
    FOR UPDATE USING (false);

CREATE POLICY "Only system can delete equipment ratings" ON equipment_ratings
    FOR DELETE USING (false);

-- 9. 添加表和列的注释
COMMENT ON TABLE equipment_reviews IS '装备评论表 - 存储用户对装备的评价和评论';
COMMENT ON TABLE equipment_ratings IS '装备评分汇总表 - 存储每个装备的平均评分和统计信息';
COMMENT ON COLUMN equipment_reviews.rating IS '评分 1-5星';
COMMENT ON COLUMN equipment_reviews.usage_duration IS '使用时长（月）';
COMMENT ON COLUMN equipment_ratings.rating_distribution IS 'JSON格式的评分分布统计';

-- 10. 创建视图，方便查询装备和评分信息
CREATE OR REPLACE VIEW equipment_with_ratings AS
SELECT 
    s.*,
    er.average_rating,
    er.review_count,
    er.rating_distribution
FROM skus s
LEFT JOIN equipment_ratings er ON s.id = er.sku_id;

-- 授权视图访问权限
GRANT SELECT ON equipment_with_ratings TO authenticated, anon;