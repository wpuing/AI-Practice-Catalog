/**
 * 格式化工具类
 * 提供常用的数据格式化功能
 */

import { DATE_FORMAT } from '@config/index.js';

/**
 * 格式化日期
 */
export function formatDate(date, format = DATE_FORMAT.DATE) {
  if (!date) {
    return '';
  }

  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) {
    return '';
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  const milliseconds = String(d.getMilliseconds()).padStart(3, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
    .replace('SSS', milliseconds);
}

/**
 * 格式化数字（千分位）
 */
export function formatNumber(num, decimals = 2) {
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }

  const number = Number(num);
  const fixed = number.toFixed(decimals);
  const parts = fixed.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return parts.join('.');
}

/**
 * 格式化货币
 */
export function formatCurrency(amount, currency = 'CNY', decimals = 2) {
  const formatted = formatNumber(amount, decimals);
  const symbols = {
    CNY: '¥',
    USD: '$',
    EUR: '€',
    GBP: '£'
  };
  const symbol = symbols[currency] || currency;
  return `${symbol}${formatted}`;
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes) {
  if (bytes === 0) {
    return '0 B';
  }

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * 格式化时长（秒转时分秒）
 */
export function formatDuration(seconds) {
  if (!seconds || seconds < 0) {
    return '00:00:00';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return [
    String(hours).padStart(2, '0'),
    String(minutes).padStart(2, '0'),
    String(secs).padStart(2, '0')
  ].join(':');
}

/**
 * 格式化百分比
 */
export function formatPercent(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }

  return `${(Number(value) * 100).toFixed(decimals)}%`;
}

/**
 * 截断文本
 */
export function truncateText(text, maxLength, suffix = '...') {
  if (!text || text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + suffix;
}

/**
 * 首字母大写
 */
export function capitalize(str) {
  if (!str) {
    return '';
  }
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * 驼峰命名转短横线命名
 */
export function camelToKebab(str) {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * 短横线命名转驼峰命名
 */
export function kebabToCamel(str) {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

export default {
  formatDate,
  formatNumber,
  formatCurrency,
  formatFileSize,
  formatDuration,
  formatPercent,
  truncateText,
  capitalize,
  camelToKebab,
  kebabToCamel
};

