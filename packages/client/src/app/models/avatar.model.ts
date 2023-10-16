import { BaseAvatar } from "@shared/model/BaseAvatar";
import { Canvas } from "../services/core/canvas";
import { PlayerInput } from "./player-input.model";
import { Player } from "./player.model";
import { Trail } from "./trail.model";

export class Avatar extends BaseAvatar {
  /**
   * Array width
   */
  static arrowWidth = 3;

  /**
   * Arrow canvas size
   */
  static arrowSize = 200;

  local: boolean;
  canvas = new Canvas(100, 100);
  arrow = new Canvas(Avatar.arrowSize, Avatar.arrowSize);
  width = this.radius * 2;
  canvasWidth = this.canvas.element.width;
  canvasRadius = this.canvasWidth / 2;
  clearWidth = this.canvasWidth;
  startX = 0;
  startY = 0;
  clearX = 0;
  clearY = 0;
  elements = {
    root: null,
    roundScore: null,
    score: null,
  };
  input: any;
  changed: any;
  declare trail: Trail;

  constructor(player: Player) {
    super(player.id, player.name, player.color);

    this.trail = new Trail(this);
    this.local = player.local;

    if (this.local) {
      this.input = new PlayerInput(this, player.getBinding());
    }

    this.drawArrow();
  }

  /**
   * Update
   */
  update(step: number) {
    if (!this.changed && this.alive) {
      this.updateAngle(step);
      this.updatePosition(step);
      this.updateVelocities();
    }

    this.startX = this.canvas.round(
      this.x * this.canvas.scale - this.canvasRadius
    );
    this.startY = this.canvas.round(
      this.y * this.canvas.scale - this.canvasRadius
    );
    this.changed = false;
  }

  /**
   * Set position (from server)
   */
  setPositionFromServer(x: number, y: number) {
    super.setPosition(x, y);

    this.changed = true;

    if (this.printing) {
      this.addPoint(x, y);
    }
  }

  /**
   * Set scale
   */
  setScale(scale: number) {
    var width = Math.ceil(this.width * scale);
    this.canvas.setDimension(width, width, scale);
    this.changed = true;
    this.canvasWidth = this.canvas.element.width;
    this.canvasRadius = this.canvas.element.width / 2;
    this.drawHead();
  }

  /**
   * Set radius
   *
   * @param {Number} radius
   */
  setRadius(radius: any) {
    BaseAvatar.prototype.setRadius.call(this, radius);
    this.updateWidth();
    this.drawHead();
  }

  /**
   * Set color
   *
   * @param {String} color
   */
  setColor(color: any) {
    BaseAvatar.prototype.setColor.call(this, color);
    this.drawHead();
  }

  /**
   * Set score
   *
   * @param {Number} score
   */
  setScore(score: number) {
    var diff = score - this.score;

    BaseAvatar.prototype.setScore.call(this, score);

    this.roundScore = diff;
  }

  /**
   * Die
   */
  die() {
    BaseAvatar.prototype.die.call(this);
    this.emit("die", this);
  }

  /**
   * Draw head
   */
  drawHead() {
    this.canvas.clear();
    this.canvas.drawCircle(
      this.canvasRadius,
      this.canvasRadius,
      this.radius * this.canvas.scale,
      this.color
    );
  }

  /**
   * Draw arrow
   */
  drawArrow() {
    var arrowLines = [
      [
        [Avatar.arrowSize * 0.65, Avatar.arrowSize * 0.5],
        [Avatar.arrowSize * 0.95, Avatar.arrowSize * 0.5],
      ],
      [
        [Avatar.arrowSize * 0.85, Avatar.arrowSize * 0.4],
        [Avatar.arrowSize * 0.95, Avatar.arrowSize * 0.5],
        [Avatar.arrowSize * 0.85, Avatar.arrowSize * 0.6],
      ],
    ];

    this.arrow.clear();

    for (var i = arrowLines.length - 1; i >= 0; i--) {
      this.arrow.drawLine(
        arrowLines[i],
        (Avatar.arrowSize * Avatar.arrowWidth) / 100,
        this.color,
        "round"
      );
    }
  }

  /**
   * Update width
   */
  updateWidth() {
    this.width = this.radius * 2;
    this.setScale(this.canvas.scale);
  }

  /**
   * Destroy
   */
  destroy() {
    this.trail.clear();
    this.canvas.clear();
    this.arrow.clear();

    if (this.input) {
      this.input.detachEvents();
      this.input = null;
    }

    BaseAvatar.prototype.destroy.call(this);
  }

  /**
   * Clear
   */
  clear() {
    BaseAvatar.prototype.clear.call(this);
    this.updateWidth();
    this.drawHead();
  }

  /**
   * Set
   *
   * @param {String} property
   * @param {Object} value
   */
  set(property: string | string[], value: any) {
    var method = "set" + property[0].toUpperCase() + property.slice(1);
    console.log(method);

    if (typeof this[method] !== "undefined") {
      this[method](value);
    } else {
      throw "Unknown setter " + method;
    }
  }

  /**
   * Has bonus
   */
  hasBonus() {
    return !this.bonusStack.bonuses.isEmpty();
  }
}
