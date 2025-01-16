import { defineMiddleware } from 'astro:middleware'

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url)
  const path = url.pathname

  // 检查是否为纯数字路径（添加开头和结尾的严格匹配）
  const isNumberPath = /^\/\d+\/?$/.test(path)
  if (isNumberPath) {
    return next()
  }

  // 其他排除规则
  if (path === '/' || 
      path.startsWith('/posts/') || 
      path.startsWith('/tags/') || 
      path.startsWith('/categories/') ||
      path.startsWith('/public/') ||
      path.startsWith('/assets/') ||
      path.startsWith('/archive/') ||
      path.startsWith('/about/') ||
      path.match(/\.(jpg|jpeg|png|gif|svg|css|js|ico|woff|woff2)$/)) {
    return next()
  }

  // 重定向到 /posts/ 路径
  return context.redirect(`/posts${path}/`, 302)
})
