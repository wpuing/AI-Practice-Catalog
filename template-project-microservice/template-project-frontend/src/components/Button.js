/**
 * 按钮组件
 */

export function Button({
  text = '',
  type = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  onClick = () => {},
  className = '',
  ...attrs
}) {
  const button = document.createElement('button');
  button.className = `btn btn-${type} btn-${size} ${className}`.trim();
  button.textContent = loading ? '加载中...' : text;
  button.disabled = disabled || loading;

  if (onClick) {
    button.addEventListener('click', onClick);
  }

  // 设置其他属性
  Object.keys(attrs).forEach(key => {
    button.setAttribute(key, attrs[key]);
  });

  return button;
}

export default Button;

