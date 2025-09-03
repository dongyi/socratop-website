# Cloudflare Pages 部署指南

## 问题解决

原来的构建错误是因为使用了 Next.js 动态路由 (`/equipment/[id]`)，这与静态导出模式不兼容。

### 解决方案

1. **路由改为查询参数**：将 `/equipment/[id]` 改为 `/equipment-detail?id=xxx`
2. **恢复静态导出**：重新启用 `output: 'export'` 配置
3. **移除动态路由**：删除动态路由文件夹结构

### 具体更改

#### 1. Next.js 配置 (next.config.ts)
```typescript
const nextConfig: NextConfig = {
  output: 'export',  // 恢复静态导出
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};
```

#### 2. 路由结构更改
- **原来**: `/src/app/equipment/[id]/page.tsx`
- **现在**: `/src/app/equipment-detail/page.tsx` (使用 `useSearchParams` 获取 ID)

#### 3. 链接更新
- **原来**: `href={/equipment/${item.id}}`
- **现在**: `href={/equipment-detail?id=${item.id}}`

## Cloudflare Pages 配置

### 构建设置
- **构建命令**: `npm run build`
- **构建输出目录**: `out`
- **Node.js 版本**: 18 或更高

### 环境变量
确保在 Cloudflare Pages 控制台中设置以下环境变量：

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret
NEXT_PUBLIC_STRAVA_REDIRECT_URI=https://your-domain.pages.dev/auth/strava/callback
```

### 部署步骤

1. **连接 Git 仓库**
   - 在 Cloudflare Pages 控制台中连接你的 GitHub 仓库
   - 选择主分支 (main 或 master)

2. **配置构建设置**
   - 框架预设: Next.js (Static HTML Export)
   - 构建命令: `npm run build`
   - 构建输出目录: `out`

3. **设置环境变量**
   - 在 Pages 项目设置中添加所有必需的环境变量
   - 注意 Strava 回调 URL 要使用你的 Pages 域名

4. **部署触发**
   - 每次推送到主分支将自动触发部署
   - 也可以手动触发部署

## 功能验证

部署完成后，验证以下功能：

### 装备浏览器 (`/equipment-browser`)
- [ ] 页面正常加载
- [ ] 搜索和筛选功能正常
- [ ] 排序功能正常
- [ ] "查看详情"链接正确跳转

### 装备详情页 (`/equipment-detail?id=xxx`)
- [ ] 通过 URL 参数正确加载装备信息
- [ ] 评分统计显示正确
- [ ] 评论列表加载正常
- [ ] 用户交互功能正常（需登录测试）

### 评价系统
- [ ] 评价模态框正常打开
- [ ] 评价提交功能正常
- [ ] 评分统计自动更新

## 故障排除

### 常见问题

1. **环境变量未生效**
   - 确保变量名完全正确
   - 重新部署项目让变量生效

2. **Supabase 连接失败**
   - 检查 CORS 设置，允许你的 Pages 域名
   - 验证 API 密钥的权限

3. **路由404错误**
   - 确保 `_redirects` 文件正确配置
   - 检查 SPA 重定向设置

4. **构建失败**
   - 检查 Node.js 版本兼容性
   - 确保所有依赖都已安装

### 调试技巧

1. **本地测试**
   ```bash
   npm run build
   npm run start
   ```

2. **检查构建输出**
   ```bash
   ls -la out/
   cat out/equipment-detail/index.html
   ```

3. **验证环境变量**
   - 在浏览器开发者工具中检查网络请求
   - 确认 API 调用使用正确的端点

## 性能优化

### 静态资源优化
- 图片已设置为 `unoptimized: true`
- CSS 和 JS 文件自动压缩和缓存

### 数据库优化
- 使用索引提高查询性能
- 评分汇总表减少实时计算
- 适当的 RLS 策略保证安全

### CDN 优化
- Cloudflare 自动提供全球 CDN
- 静态资源缓存策略优化
- 自动压缩和优化

## 监控和维护

### 性能监控
- 使用 Cloudflare Analytics 监控访问量
- 监控页面加载时间和用户体验

### 错误追踪
- 检查 Cloudflare Pages 构建日志
- 监控浏览器控制台错误
- 设置 Supabase 错误告警

### 定期维护
- 定期检查依赖包更新
- 监控 API 使用量和限制
- 备份重要的用户数据