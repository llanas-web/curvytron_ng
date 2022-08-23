import { Avatar } from "src/app/models/avatar.model";
import { Canvas } from "src/app/services/core/canvas";
import { ExplodeParticle } from "./explode-particle.anim";

export class Explode {
  /**
   * Canvas width
   */
  static width = 10;

  /**
   * Angle variation
   */
  static angleVariation = Math.PI / 8;

  /**
   * Number of particles to generate
   */
  static particleTotal = 20;

  /**
   * Animation duration
   */
  static duration = 500;

  particles = new Array(Explode.particleTotal);
  canvas = new Canvas(Explode.width, Explode.width);
  created = new Date().getTime();
  done = false;
  cleared = false;
  angleVariation: number;
  lastRender: number;
  duration: number;

  constructor(avatar: Avatar, public effect: Canvas) {
    var width = Explode.width / 2;

    this.canvas.drawCircle(width, width, width, avatar.color);

    for (var i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i] = new ExplodeParticle(
        avatar.x * this.effect.scale,
        avatar.y * this.effect.scale,
        this.randomize((avatar.velocity / 750) * this.effect.scale, 0.1),
        avatar.angle + this.angleVariation * (Math.random() * 2 - 1),
        this.effect.round(
          this.randomize(avatar.radius, 0.5) * this.effect.scale
        )
      );
    }
  }

  /**
   * Randomize value
   */
  randomize(value: number, factor: number) {
    return value + value * factor * (Math.random() * 2 - 1);
  }

  /**
   * Draw particles
   */
  draw() {
    if (this.done) {
      return;
    }

    this.clear();

    this.lastRender = new Date().getTime();
    this.cleared = false;

    var age = this.lastRender - this.created;

    if (age <= this.duration) {
      var step = age / this.duration;

      this.effect.setOpacity(ExplodeParticle.prototype.opacity * (1.2 - step));

      for (
        var particle: {
            update: (arg0: number) => void;
            x: number;
            y: number;
            radius: number;
          },
          i = this.particles.length - 1;
        i >= 0;
        i--
      ) {
        particle = this.particles[i];
        particle.update(age);
        this.effect.drawImage(
          this.canvas.element,
          particle.x,
          particle.y,
          particle.radius,
          particle.radius
        );
      }

      this.effect.setOpacity(1);
    } else {
      this.clear();
      this.done = true;
    }
  }

  /**
   * Clear particles from cache
   */
  clear() {
    if (this.cleared) {
      return;
    }

    for (
      var particle: { x: number; y: number; radius: number },
        width: any,
        i = this.particles.length - 1;
      i >= 0;
      i--
    ) {
      particle = this.particles[i];
      this.effect.clearZone(
        particle.x,
        particle.y,
        particle.radius,
        particle.radius
      );
    }

    this.cleared = true;
  }
}
