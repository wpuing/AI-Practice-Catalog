/**
 * 输入框组件
 */

export function Input({
  type = 'text',
  placeholder = '',
  value = '',
  disabled = false,
  required = false,
  onChange = () => {},
  onBlur = () => {},
  className = '',
  ...attrs
}) {
  const input = document.createElement('input');
  input.type = type;
  input.placeholder = placeholder;
  input.value = value;
  input.disabled = disabled;
  input.required = required;
  input.className = `input ${className}`.trim();

  if (onChange) {
    input.addEventListener('input', (e) => onChange(e.target.value, e));
  }

  if (onBlur) {
    input.addEventListener('blur', (e) => onBlur(e.target.value, e));
  }

  // 设置其他属性
  Object.keys(attrs).forEach(key => {
    input.setAttribute(key, attrs[key]);
  });

  return input;
}

export default Input;

