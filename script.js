// ========================================
// SMOOTH SCROLL NAVIGATION
// ========================================

document.querySelectorAll("a[href^='#']").forEach(link => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    const targetId = this.getAttribute("href");
    const targetElement = document.querySelector(targetId);
    
    if (targetElement) {
      const headerOffset = 80;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  });
});

// ========================================
// HEADER SCROLL EFFECT
// ========================================

let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  
  if (currentScroll > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
  
  lastScroll = currentScroll;
});

// ========================================
// SCROLL ANIMATIONS
// ========================================

const observerOptions = {
  threshold: 0.15,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

// Observe section titles
document.querySelectorAll('.section-title').forEach(title => {
  observer.observe(title);
});

// Observe narrative text
document.querySelectorAll('.narrative-text').forEach(text => {
  observer.observe(text);
});

// Observe vision content
document.querySelectorAll('.vision-content').forEach(content => {
  observer.observe(content);
});

// Observe technical content
document.querySelectorAll('.technical-content').forEach(content => {
  observer.observe(content);
});

// Observe innovation cards with stagger effect
const cards = document.querySelectorAll('.innovation-card');
cards.forEach((card, index) => {
  setTimeout(() => {
    observer.observe(card);
  }, index * 100);
});

// Observe FAQ items with stagger effect
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach((item, index) => {
  setTimeout(() => {
    observer.observe(item);
  }, index * 100);
});

// ========================================
// QUANTUM PARTICLE BACKGROUND
// ========================================

const quantumBg = document.getElementById('quantumBg');

// Create quantum particles
function createQuantumParticles() {
  if (!quantumBg) return; // Guard against missing element
  
  const particleCount = window.innerWidth < 768 ? 15 : 30;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'quantum-particle';
    
    // Random position
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    
    // Random color from quantum palette
    const colors = ['#00d9ff', '#a855f7', '#14b8a6'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    // Random size
    const size = Math.random() * 3 + 1;
    
    // Random animation duration
    const duration = Math.random() * 20 + 10;
    
    const animName = createParticleAnimation(i);
    
    particle.style.cssText = `
      position: absolute;
      left: ${x}%;
      top: ${y}%;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: 50%;
      opacity: 0;
      box-shadow: 0 0 10px ${color}, 0 0 20px ${color};
      animation: ${animName} ${duration}s ease-in-out infinite;
      animation-delay: ${Math.random() * 5}s;
    `;
    
    quantumBg.appendChild(particle);
  }
}

// Add base particle animation styles
const style = document.createElement('style');
style.textContent = `
  .quantum-particle {
    pointer-events: none;
  }
`;
document.head.appendChild(style);

// Create unique animation for each particle
function createParticleAnimation(index) {
  const animName = `particleFloat${index}`;
  const midX = Math.random() * 100 - 50;
  const midY = Math.random() * 100 - 50;
  const endX = Math.random() * 200 - 100;
  const endY = Math.random() * 200 - 100;
  
  const keyframes = `
    @keyframes ${animName} {
      0% {
        opacity: 0;
        transform: translate(0, 0) scale(0);
      }
      10% {
        opacity: 0.6;
      }
      50% {
        opacity: 0.8;
        transform: translate(${midX}px, ${midY}px) scale(1);
      }
      90% {
        opacity: 0.6;
      }
      100% {
        opacity: 0;
        transform: translate(${endX}px, ${endY}px) scale(0);
      }
    }
  `;
  
  const styleSheet = document.createElement('style');
  styleSheet.textContent = keyframes;
  document.head.appendChild(styleSheet);
  
  return animName;
}

// Initialize particles on load
window.addEventListener('load', () => {
  createQuantumParticles();
});

// ========================================
// PERFORMANCE OPTIMIZATIONS
// ========================================

// Debounce resize events
let resizeTimer;
let previousWidth = window.innerWidth;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    // Re-initialize particles on significant resize
    const currentWidth = window.innerWidth;
    if (quantumBg && Math.abs(currentWidth - previousWidth) > 100) {
      quantumBg.innerHTML = '';
      createQuantumParticles();
      previousWidth = currentWidth;
    }
  }, 250);
});

// ========================================
// KEYBOARD NAVIGATION ENHANCEMENT
// ========================================

// Add visible focus for keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    document.body.classList.add('keyboard-nav');
  }
});

document.addEventListener('mousedown', () => {
  document.body.classList.remove('keyboard-nav');
});

// ========================================
// PAGE LOAD OPTIMIZATION
// ========================================

// Lazy load images (if any added in future)
if ('loading' in HTMLImageElement.prototype) {
  const images = document.querySelectorAll('img[loading="lazy"]');
  images.forEach(img => {
    if (img.dataset.src) {
      img.src = img.dataset.src;
    }
  });
} else {
  // Fallback for browsers that don't support lazy loading
  const lazyImages = document.querySelectorAll('img[data-src]');
  if (lazyImages.length > 0) {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
  }
}
