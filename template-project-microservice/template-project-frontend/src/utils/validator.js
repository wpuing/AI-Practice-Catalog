/**
 * 验证工具类
 * 提供常用的数据验证功能
 */

/**
 * 验证邮箱格式
 */
export function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * 验证手机号格式（中国大陆）
 */
export function validatePhone(phone) {
  const regex = /^1[3-9]\d{9}$/;
  return regex.test(phone);
}

/**
 * 验证URL格式
 */
export function validateUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 验证身份证号格式（中国大陆）
 */
export function validateIdCard(idCard) {
  const regex = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
  return regex.test(idCard);
}

/**
 * 验证密码强度
 * 至少8位，包含字母和数字
 */
export function validatePassword(password) {
  const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
  return regex.test(password);
}

/**
 * 验证是否为空
 */
export function isEmpty(value) {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === 'string' && value.trim() === '') {
    return true;
  }
  if (Array.isArray(value) && value.length === 0) {
    return true;
  }
  if (typeof value === 'object' && Object.keys(value).length === 0) {
    return true;
  }
  return false;
}

/**
 * 验证是否为数字
 */
export function isNumber(value) {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * 验证是否为整数
 */
export function isInteger(value) {
  return Number.isInteger(value);
}

/**
 * 验证是否为有效的日期
 */
export function isValidDate(date) {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * 验证字符串长度
 */
export function validateLength(str, min, max) {
  if (typeof str !== 'string') {
    return false;
  }
  const length = str.length;
  if (min !== undefined && length < min) {
    return false;
  }
  if (max !== undefined && length > max) {
    return false;
  }
  return true;
}

/**
 * 验证数字范围
 */
export function validateRange(num, min, max) {
  if (!isNumber(num)) {
    return false;
  }
  if (min !== undefined && num < min) {
    return false;
  }
  if (max !== undefined && num > max) {
    return false;
  }
  return true;
}

/**
 * 验证文件类型
 */
export function validateFileType(file, allowedTypes) {
  if (!file || !file.type) {
    return false;
  }
  return allowedTypes.includes(file.type);
}

/**
 * 验证文件大小
 */
export function validateFileSize(file, maxSize) {
  if (!file || !file.size) {
    return false;
  }
  return file.size <= maxSize;
}

export default {
  validateEmail,
  validatePhone,
  validateUrl,
  validateIdCard,
  validatePassword,
  isEmpty,
  isNumber,
  isInteger,
  isValidDate,
  validateLength,
  validateRange,
  validateFileType,
  validateFileSize
};

