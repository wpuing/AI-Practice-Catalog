/**
 * 主题管理组件
 */

// 辅助函数：将十六进制颜色转换为RGB
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// 计算对比色（互补色或高对比度色）
export function getContrastColor(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return { r: 0, g: 255, b: 0 }; // 默认绿色
  
  // 计算亮度
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  
  // 如果原色较亮，使用深色对比；如果原色较暗，使用亮色对比
  if (brightness > 128) {
    // 原色较亮，使用深色代码雨（深绿/青色）
    return { r: 0, g: 200, b: 150 };
  } else {
    // 原色较暗，使用亮色代码雨（亮绿/青色）
    return { r: 0, g: 255, b: 200 };
  }
}

export function initThemeRotation() {
  const themes = [
    { primary: '#667eea', secondary: '#764ba2', primaryRgb: '102, 126, 234', secondaryRgb: '118, 75, 162' },
    { primary: '#f093fb', secondary: '#f5576c', primaryRgb: '240, 147, 251', secondaryRgb: '245, 87, 108' },
    { primary: '#4facfe', secondary: '#00f2fe', primaryRgb: '79, 172, 254', secondaryRgb: '0, 242, 254' },
    { primary: '#43e97b', secondary: '#38f9d7', primaryRgb: '67, 233, 123', secondaryRgb: '56, 249, 215' },
    { primary: '#fa709a', secondary: '#fee140', primaryRgb: '250, 112, 154', secondaryRgb: '254, 225, 64' }
  ];
  
  let currentTheme = 0;
  const background = document.querySelector('.login-background');
  const card = document.querySelector('.login-card');
  
  // 立即应用第一个主题
  applyTheme(0);
  
  setInterval(() => {
    currentTheme = (currentTheme + 1) % themes.length;
    applyTheme(currentTheme);
  }, 5000); // 每5秒切换一次主题
  
  function applyTheme(index) {
    const theme = themes[index];
    
    if (background) {
      background.setAttribute('data-theme', index);
      background.style.setProperty('--theme-primary', theme.primary);
      background.style.setProperty('--theme-secondary', theme.secondary);
      background.style.setProperty('--theme-primary-rgb', theme.primaryRgb);
      background.style.setProperty('--theme-secondary-rgb', theme.secondaryRgb);
    }
    
    if (card) {
      card.setAttribute('data-theme', index);
      card.style.setProperty('--theme-primary', theme.primary);
      card.style.setProperty('--theme-secondary', theme.secondary);
      card.style.setProperty('--theme-primary-rgb', theme.primaryRgb);
      card.style.setProperty('--theme-secondary-rgb', theme.secondaryRgb);
    }
    
    // 更新立方体颜色
    const cubeFaces = document.querySelectorAll('.cube-face');
    cubeFaces.forEach(face => {
      face.style.background = `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`;
      
      // 更新代码雨颜色以形成对比
      const codeChars = face.querySelectorAll('.code-char');
      // 计算对比色
      const contrastColor = getContrastColor(theme.primary);
      codeChars.forEach(char => {
        char.style.color = `rgba(${contrastColor.r}, ${contrastColor.g}, ${contrastColor.b}, 0.9)`;
        char.style.textShadow = `
          0 0 3px rgba(${contrastColor.r}, ${contrastColor.g}, ${contrastColor.b}, 1),
          0 0 6px rgba(${contrastColor.r}, ${contrastColor.g}, ${contrastColor.b}, 0.8),
          0 0 9px rgba(${contrastColor.r}, ${contrastColor.g}, ${contrastColor.b}, 0.5)
        `;
      });
    });
  }
}

