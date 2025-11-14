/**
 * 3D立方体动画组件
 */

import { initCodeRain } from './CodeRain.js';

export function initCubeAnimation() {
  const cube = document.querySelector('.cube-3d');
  if (cube) {
    // CSS动画已经处理了旋转，这里可以添加额外的交互效果
    cube.addEventListener('mouseenter', () => {
      cube.style.animationPlayState = 'paused';
    });
    cube.addEventListener('mouseleave', () => {
      cube.style.animationPlayState = 'running';
    });
  }
  
  // 初始化代码雨效果
  initCodeRain();
}

