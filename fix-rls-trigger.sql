-- 修复触发器RLS权限问题
-- 在 Supabase Dashboard 的 SQL 编辑器中运行此脚本

-- 方案1：暂时禁用 equipment_ratings 表的RLS，因为它只通过触发器更新
ALTER TABLE equipment_ratings DISABLE ROW LEVEL SECURITY;

-- 或者方案2：创建允许触发器操作的策略（如果选择方案1就不需要运行下面的代码）
-- DROP POLICY IF EXISTS "Only system can modify equipment ratings" ON equipment_ratings;
-- DROP POLICY IF EXISTS "Only system can update equipment ratings" ON equipment_ratings;
-- DROP POLICY IF EXISTS "Only system can delete equipment ratings" ON equipment_ratings;

-- CREATE POLICY "Allow trigger to insert equipment ratings" ON equipment_ratings
--     FOR INSERT WITH CHECK (true);
-- 
-- CREATE POLICY "Allow trigger to update equipment ratings" ON equipment_ratings
--     FOR UPDATE USING (true);
-- 
-- CREATE POLICY "Allow trigger to delete equipment ratings" ON equipment_ratings
--     FOR DELETE USING (true);