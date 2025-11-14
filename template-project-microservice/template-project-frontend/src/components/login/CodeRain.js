/**
 * 代码雨组件
 */

export function initCodeRain() {
  const codeRainContainers = document.querySelectorAll('.code-rain');
  const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
  const codeChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+-=[]{}|;:,.<>?';
  const allChars = chars + codeChars;
  
  codeRainContainers.forEach((container, index) => {
    // 创建多列代码雨
    const columns = 10; // 每面10列
    for (let i = 0; i < columns; i++) {
      const column = document.createElement('div');
      column.className = 'code-column';
      column.style.left = `${(i * 100) / columns}%`;
      const delay = (i * 0.15) + (index * 0.3) + Math.random() * 0.5;
      column.style.animationDelay = `${delay}s`;
      const duration = 2.5 + Math.random() * 1.5;
      column.style.animationDuration = `${duration}s`;
      
      // 创建字符
      const charCount = 12; // 每列12个字符
      for (let j = 0; j < charCount; j++) {
        const char = document.createElement('span');
        char.className = 'code-char';
        char.textContent = allChars[Math.floor(Math.random() * allChars.length)];
        char.style.top = `${(j * 100) / charCount}%`;
        char.style.animationDelay = `${j * (duration / charCount)}s`;
        char.style.animationDuration = `${duration}s`;
        // 随机改变一些字符的亮度（使用对比色高亮）
        if (Math.random() > 0.7) {
          char.style.opacity = '1';
          char.style.textShadow = '0 0 5px rgba(0, 255, 200, 1), 0 0 10px rgba(0, 255, 200, 1), 0 0 15px rgba(0, 255, 200, 0.8)';
        }
        column.appendChild(char);
      }
      
      container.appendChild(column);
    }
    
    // 定期更新字符内容，让代码雨更生动
    setInterval(() => {
      const chars = container.querySelectorAll('.code-char');
      chars.forEach(char => {
        if (Math.random() > 0.7) {
          char.textContent = allChars[Math.floor(Math.random() * allChars.length)];
        }
      });
    }, 200);
  });
}

