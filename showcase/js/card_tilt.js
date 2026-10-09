/**
 * V.I.S.O.R. 3D Floating Card Parallax Engine
 * Provides physical 3D perspective tilt and dynamic sheen lighting on cards.
 */

class CardTiltEngine {
  constructor(options = {}) {
    this.maxTilt = options.maxTilt || 14; // Maximum tilt angle in degrees
    this.perspective = options.perspective || 1200;
    this.scale = options.scale || 1.025;
    this.speed = options.speed || 300;
    this.easing = 'cubic-bezier(.03,.98,.52,.99)';
    this.init();
  }

  init() {
    const cards = document.querySelectorAll('.floating-card, [data-tilt]');
    cards.forEach(card => this.attachEvents(card));
  }

  attachEvents(card) {
    let bounds = null;
    let isHovered = false;
    let rafId = null;

    const onMouseEnter = () => {
      bounds = card.getBoundingClientRect();
      isHovered = true;
      card.style.transition = `transform ${this.speed}ms ${this.easing}, box-shadow 300ms ease, border-color 300ms ease`;
    };

    const onMouseMove = (e) => {
      if (!isHovered || !bounds) bounds = card.getBoundingClientRect();

      const mouseX = e.clientX - bounds.left;
      const mouseY = e.clientY - bounds.top;

      // Update dynamic radial light position in CSS variables
      card.style.setProperty('--mouse-x', `${mouseX}px`);
      card.style.setProperty('--mouse-y', `${mouseY}px`);

      // Calculate normalized tilt (-0.5 to +0.5)
      const xNorm = (mouseX / bounds.width) - 0.5;
      const yNorm = (mouseY / bounds.height) - 0.5;

      const tiltX = -yNorm * this.maxTilt;
      const tiltY = xNorm * this.maxTilt;

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        card.style.transform = `perspective(${this.perspective}px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) scale3d(${this.scale}, ${this.scale}, ${this.scale}) translateZ(15px)`;
      });
    };

    const onMouseLeave = () => {
      isHovered = false;
      if (rafId) cancelAnimationFrame(rafId);
      card.style.transition = `transform 500ms ease-out, box-shadow 400ms ease, border-color 300ms ease`;
      card.style.transform = `perspective(${this.perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1) translateZ(0px)`;
    };

    // Touch support for mobile devices
    const onTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        bounds = card.getBoundingClientRect();
        const touch = e.touches[0];
        const mouseX = touch.clientX - bounds.left;
        const mouseY = touch.clientY - bounds.top;

        const xNorm = Math.max(-0.5, Math.min(0.5, (mouseX / bounds.width) - 0.5));
        const yNorm = Math.max(-0.5, Math.min(0.5, (mouseY / bounds.height) - 0.5));

        const tiltX = -yNorm * (this.maxTilt * 0.7);
        const tiltY = xNorm * (this.maxTilt * 0.7);

        card.style.transform = `perspective(${this.perspective}px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) scale3d(1.01, 1.01, 1.01) translateZ(8px)`;
      }
    };

    const onTouchEnd = () => {
      card.style.transition = `transform 400ms ease-out`;
      card.style.transform = `perspective(${this.perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1) translateZ(0px)`;
    };

    card.addEventListener('mouseenter', onMouseEnter, { passive: true });
    card.addEventListener('mousemove', onMouseMove, { passive: true });
    card.addEventListener('mouseleave', onMouseLeave, { passive: true });
    card.addEventListener('touchmove', onTouchMove, { passive: true });
    card.addEventListener('touchend', onTouchEnd, { passive: true });
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.cardTiltEngine = new CardTiltEngine();
});
