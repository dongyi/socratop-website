-- 为评论添加图片支持
-- 在 Supabase Dashboard 的 SQL 编辑器中运行此脚本

-- 1. 为评论表添加图片字段
ALTER TABLE equipment_reviews 
ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';

-- 2. 添加字段注释
COMMENT ON COLUMN equipment_reviews.image_urls IS '评论配图URL数组，最多支持5张图片';

-- 3. 创建评论图片存储桶（需要在Supabase Dashboard中手动创建）
-- Bucket name: review-images
-- Public: true (用于显示图片)
-- File size limit: 5MB
-- Allowed file types: image/jpeg, image/png, image/webp

-- 4. 创建RLS策略允许用户上传和查看评论图片
-- 这些策略需要在Storage -> Policies中设置：

-- 策略1: 允许认证用户上传到自己的文件夹
-- INSERT policy on review-images bucket:
-- (auth.uid()::text = (storage.foldername(name))[1])

-- 策略2: 允许所有人查看评论图片
-- SELECT policy on review-images bucket:
-- true

-- 5. 示例文件路径结构：
-- /review-images/{user_id}/{review_id}/{timestamp}_{filename}
-- 例如：/review-images/user123/review456/1640995200000_IMG_001.jpg