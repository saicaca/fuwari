# GitHub Actions 测试

这是一个测试文件，用于触发GitHub Actions工作流。

## 测试目的

- 测试代码质量检查工作流
- 测试构建和检查工作流
- 测试部署工作流

## 当前时间

测试时间：2024年12月19日
PR测试时间：2024年12月19日 18:14

## 工作流说明

1. **Code Quality** - 代码质量检查
   - TypeScript类型检查
   - Astro检查
   - ESLint检查
   - Prettier格式检查

2. **Build and Check** - 构建和检查
   - 多Node.js版本测试（22, 23）
   - 依赖安装
   - 代码质量检查
   - Astro构建

3. **Deploy to GitHub Pages** - 部署到GitHub Pages
   - 自动构建
   - 部署到GitHub Pages