// visual-effects.js
export class VisualEffects {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.particles = [];
    this.gradients = this.createGradients();
  }

  createGradients() {
    const gradients = {
      blue: this.ctx.createRadialGradient(0, 0, 0, 0, 0, 50),
      red: this.ctx.createRadialGradient(0, 0, 0, 0, 0, 50),
    };

    gradients.blue.addColorStop(0, "rgba(0, 150, 255, 0.8)");
    gradients.blue.addColorStop(0.5, "rgba(0, 100, 255, 0.5)");
    gradients.blue.addColorStop(1, "rgba(0, 50, 255, 0)");

    gradients.red.addColorStop(0, "rgba(255, 50, 0, 0.8)");
    gradients.red.addColorStop(0.5, "rgba(255, 0, 0, 0.5)");
    gradients.red.addColorStop(1, "rgba(200, 0, 0, 0)");

    return gradients;
  }

  createBubbleEffect(x, y, color, size) {
    const particleCount = Math.floor(size / 2);
    for (let i = 0; i < particleCount; i++) {
      const angle = ((Math.PI * 2) / particleCount) * i;
      const speed = Math.random() * 2 + 1;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 2,
        color,
        alpha: 1,
        life: 1,
      });
    }
  }

  createScorePopup(x, y, score) {
    return {
      x,
      y,
      text: `+${score}`,
      alpha: 1,
      vy: -2,
      life: 1,
    };
  }

  drawBubble(bubble) {
    const gradient = this.ctx.createRadialGradient(
      bubble.x,
      bubble.y,
      0,
      bubble.x,
      bubble.y,
      bubble.radius
    );

    gradient.addColorStop(0, `${bubble.color}66`);
    gradient.addColorStop(0.7, `${bubble.color}33`);
    gradient.addColorStop(1, `${bubble.color}00`);

    // Main bubble
    this.ctx.beginPath();
    this.ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = gradient;
    this.ctx.fill();

    // Shine effect
    this.ctx.beginPath();
    this.ctx.arc(
      bubble.x - bubble.radius * 0.3,
      bubble.y - bubble.radius * 0.3,
      bubble.radius * 0.2,
      0,
      Math.PI * 2
    );
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    this.ctx.fill();

    // Click feedback
    if (bubble.clickEffect) {
      this.ctx.beginPath();
      this.ctx.arc(
        bubble.x,
        bubble.y,
        bubble.radius * bubble.clickEffect,
        0,
        Math.PI * 2
      );
      this.ctx.strokeStyle = `rgba(255, 255, 255, ${bubble.clickEffect})`;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      bubble.clickEffect *= 0.9;
      if (bubble.clickEffect < 0.1) bubble.clickEffect = 0;
    }
  }

  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];

      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.alpha *= 0.96;
      particle.life *= 0.96;

      if (particle.life < 0.01) {
        this.particles.splice(i, 1);
      }
    }
  }

  drawParticles() {
    this.particles.forEach((particle) => {
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${particle.color}, ${particle.alpha})`;
      this.ctx.fill();
    });
  }

  createRippleEffect(x, y, color) {
    return {
      x,
      y,
      radius: 0,
      maxRadius: 50,
      color,
      alpha: 1,
    };
  }

  updateRipples(ripples) {
    for (let i = ripples.length - 1; i >= 0; i--) {
      const ripple = ripples[i];
      ripple.radius += 2;
      ripple.alpha *= 0.95;

      if (ripple.alpha < 0.01) {
        ripples.splice(i, 1);
      }
    }
  }

  drawRipples(ripples) {
    ripples.forEach((ripple) => {
      this.ctx.beginPath();
      this.ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = `rgba(${ripple.color}, ${ripple.alpha})`;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    });
  }
}

// Enhanced bubble effects
export class EnhancedBubble {
  constructor(x, y, radius, color, points) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.points = points;
    this.wobbleOffset = Math.random() * Math.PI * 2;
    this.wobbleSpeed = 0.05;
    this.wobbleAmount = 2;
    this.clickEffect = 0;
    this.glowIntensity = 0.5;
  }

  update() {
    // Wobble animation
    this.wobbleOffset += this.wobbleSpeed;
    const wobble = Math.sin(this.wobbleOffset) * this.wobbleAmount;
    this.radius += wobble * 0.1;

    // Glow pulse
    this.glowIntensity = 0.5 + Math.sin(this.wobbleOffset) * 0.2;
  }

  draw(ctx) {
    // Glow effect
    const gradient = ctx.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      this.radius * 1.2
    );

    gradient.addColorStop(
      0,
      `${this.color}${Math.floor(this.glowIntensity * 255).toString(16)}`
    );
    gradient.addColorStop(1, `${this.color}00`);

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 1.2, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Main bubble
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();

    // Shine effect
    const shinePosX = this.x - this.radius * 0.3;
    const shinePosY = this.y - this.radius * 0.3;
    const shineRadius = this.radius * 0.2;

    ctx.beginPath();
    ctx.arc(shinePosX, shinePosY, shineRadius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.fill();
  }
}
