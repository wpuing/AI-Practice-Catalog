/**
 * 404 页面
 */

export default function NotFoundPage() {
  return `
    <div class="not-found-page">
      <div class="not-found-content">
        <h1>404</h1>
        <h2>页面未找到</h2>
        <p>抱歉，您访问的页面不存在</p>
        <a href="/" data-router class="btn btn-primary">返回首页</a>
      </div>
    </div>
  `;
}

