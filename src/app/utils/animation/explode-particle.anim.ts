export class ExplodeParticle {
  /**
   * Opacity
   */
  static opacity = 1;

  originX: any;
  originY: any;
  velocityX: number;
  velocityY: number;
  opacity: number;

  constructor(
    public x: any,
    public y: any,
    public velocity: number,
    public angle: number,
    public radius: any
  ) {
    this.x = this.round(x);
    this.y = this.round(y);
    this.originX = x;
    this.originY = y;
    this.velocityX = Math.cos(angle) * velocity;
    this.velocityY = Math.sin(angle) * velocity;
    this.radius = radius;
  }
  /**
   * Update
   */
  update(time: number) {
    this.x = this.round(this.originX + this.velocityX * time);
    this.y = this.round(this.originY + this.velocityY * time);
  }

  /**
   * Round
   */
  round(value: number) {
    return (0.5 + value) | 0;
  }
}
