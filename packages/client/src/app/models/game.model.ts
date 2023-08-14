import { Collection } from "@shared/collection";
import { BaseGame } from "@shared/model/BaseGame";
import { boundMethod } from "autobind-decorator";
import { BonusManagerService } from "../services/bonus-manager.service";
import { Canvas } from "../services/core/canvas";
import { Explode } from "../utils/animation/explode.anim";
import { Avatar } from "./avatar.model";
import { Room } from "./room.model";

export class Game extends BaseGame {
  /**
   * Margin between player an bonus stack
   */
  static stackMargin = 15;

  /**
   * Background color
   */
  static backgroundColor = "#222222";

  animations = [];
  render: HTMLElement;
  gameInfos: HTMLElement;
  canvas: Canvas;
  background: Canvas;
  effect: Canvas;
  avatars: Collection<Avatar>;
  bonusManager: BonusManagerService;
  roundWinner = null;

  constructor(room: Room) {
    super(room);

    this.bonusManager = new BonusManagerService(this);

    this.avatars = room.players.map<Avatar>((player) => player.getAvatar());
    this.size = this.getSize(this.avatars.count());

    this.animations = [];

    window.addEventListener("error", this.stop);
    window.addEventListener("resize", this.onResize);

    for (var avatar: any, i = this.avatars.items.length - 1; i >= 0; i--) {
      this.avatars.items[i].on("die", this.onDie);
    }
  }

  /**
   * Load DOM
   */
  loadDOM() {
    this.render = document.getElementById("render");
    this.gameInfos = document.getElementById("game-infos");
    this.canvas = new Canvas(
      0,
      0,
      document.getElementById("game") as HTMLCanvasElement
    );
    this.background = new Canvas(
      0,
      0,
      document.getElementById("background") as HTMLCanvasElement
    );
    this.effect = new Canvas(
      0,
      0,
      document.getElementById("effect") as HTMLCanvasElement
    );

    this.bonusManager.loadDOM();
    this.onResize();
  }

  /**
   * Get new frame
   */
  newFrame() {
    this.frame = window.requestAnimationFrame(this.loop);
  }

  /**
   * Clear frame
   */
  clearFrame() {
    window.cancelAnimationFrame(this.frame);
    this.frame = null;
  }

  /**
   * On frame
   *
   * @param {Number} step
   */
  onFrame(step: number) {
    this.draw(step);
  }

  /**
   * On round new
   */
  onRoundNew() {
    BaseGame.prototype.onRoundNew.call(this);
    this.repaint();
  }

  /**
   * On start
   */
  onStart() {
    this.effect.clear();
    BaseGame.prototype.onStart.call(this);
  }

  /**
   * Is tie break
   *
   * @return {Boolean}
   */
  isTieBreak(): boolean {
    var maxScore = this.maxScore;

    return this.avatars.match((avatar) => avatar.score >= maxScore) !== null;
  }

  /**
   * Are all avatars ready?
   *
   * @return {Boolean}
   */
  isReady(): boolean {
    return this.started ? true : BaseGame.prototype.isReady.call(this);
  }

  /**
   * Clear trails
   */
  clearTrails() {
    this.clearBackground();
  }

  /**
   * End
   */
  end() {
    if (super.end()) {
      window.removeEventListener("error", this.stop);
      window.removeEventListener("resize", this.onResize);
      return true;
    }
  }

  /**
   * Update size
   */
  setSize() {
    BaseGame.prototype.setSize.call(this);
    this.onResize();
  }

  /**
   * Repaint
   */
  repaint() {
    this.animations.length = 0;
    this.clearBackground();
    this.effect.clear();
    this.canvas.clear();
    this.draw();
  }

  /**
   * Draw
   */
  draw(step?: number) {
    for (
      var animation: { draw: () => void; done: any; cleared: any },
        a = this.animations.length - 1;
      a >= 0;
      a--
    ) {
      animation = this.animations[a];
      animation.draw();
      if (animation.done && animation.cleared) {
        this.animations.splice(a, 1);
      }
    }

    for (var avatar: Avatar, i = this.avatars.items.length - 1; i >= 0; i--) {
      avatar = this.avatars.items[i];
      if (avatar.present && (avatar.alive || avatar.changed)) {
        this.clearAvatar(avatar);
        this.clearBonusStack(avatar);
      }
    }

    for (let avatar: Avatar, i = this.avatars.items.length - 1; i >= 0; i--) {
      avatar = this.avatars.items[i];
      if (avatar.present && (avatar.alive || avatar.changed)) {
        if (avatar.alive) {
          avatar.update(this.frame ? step : 0);
        }

        this.drawTail(avatar);
        this.drawAvatar(avatar);
        this.drawBonusStack(avatar);

        if (!this.frame && avatar.local) {
          this.drawArrow(avatar);
        }
      }
    }

    this.bonusManager.draw();
  }

  /**
   * Draw tail
   *
   * @param {Avatar} avatar
   */
  drawTail(avatar: Avatar) {
    var points = avatar.trail.getLastSegment();

    if (points) {
      this.background.drawLineScaled(
        points,
        avatar.width,
        avatar.color,
        "round"
      );
    }
  }

  /**
   * Draw avatar
   *
   * @param {Avatar} avatar
   */
  drawAvatar(avatar: Avatar) {
    this.canvas.drawImageTo(
      avatar.canvas.element,
      avatar.startX,
      avatar.startY
    );
    avatar.clearX = avatar.startX;
    avatar.clearY = avatar.startY;
    avatar.clearWidth = avatar.canvas.element.width;
  }

  /**
   * Clear bonus from the canvas
   *
   * @param {Bonus} bonus
   */
  clearAvatar(avatar: { clearX: number; clearY: number; clearWidth: number }) {
    this.canvas.clearZone(
      avatar.clearX,
      avatar.clearY,
      avatar.clearWidth,
      avatar.clearWidth
    );
  }

  /**
   * Clear bonus stack
   *
   * @param {Avatar} avatar
   */
  clearBonusStack(avatar: Avatar) {
    if (avatar.bonusStack.lastWidth) {
      this.canvas.clearZone(
        avatar.startX + Game.stackMargin,
        avatar.startY + Game.stackMargin,
        avatar.bonusStack.lastWidth,
        avatar.bonusStack.lastHeight
      );
    }
  }

  /**
   * Draw bonus stack
   *
   * @param {Avatar} avatar
   */
  drawBonusStack(avatar: Avatar) {
    if (avatar.hasBonus()) {
      avatar.bonusStack.lastWidth = avatar.bonusStack.canvas.element.width;
      avatar.bonusStack.lastHeight = avatar.bonusStack.canvas.element.height;

      this.canvas.drawImageTo(
        avatar.bonusStack.canvas.element,
        avatar.startX + Game.stackMargin,
        avatar.startY + Game.stackMargin
      );
    }
  }

  /**
   * Draw arrow
   *
   * @param {Avatar} avatar
   */
  drawArrow(avatar: Avatar) {
    this.effect.drawImageScaledAngle(
      avatar.arrow.element,
      avatar.x - 5,
      avatar.y - 5,
      10,
      10,
      avatar.angle
    );
  }

  /**
   * Clear background with color
   */
  clearBackground() {
    this.background.color(Game.backgroundColor);
  }

  @boundMethod
  onDie(avatar: Avatar) {
    this.animations.push(new Explode(avatar, this.effect));
  }

  @boundMethod
  onResize() {
    var w = window,
      d = document,
      e = d.documentElement,
      g = document.body,
      x = w.innerWidth || e.clientWidth || g.clientWidth,
      y = w.innerHeight || e.clientHeight || g.clientHeight;

    var width = Math.min(x - this.gameInfos.clientWidth - 8, y - 8),
      scale = width / this.size,
      avatar: Avatar;

    this.render.style.width = width + 8 + "px";
    this.render.style.height = width + 8 + "px";
    this.canvas.setDimension(width, width, scale);
    this.effect.setDimension(width, width, scale);
    this.background.setDimension(width, width, scale, true);
    this.bonusManager.setDimension(width, scale);

    for (var i = this.avatars.items.length - 1; i >= 0; i--) {
      avatar = this.avatars.items[i];

      avatar.setScale(scale);

      if (typeof avatar.input !== "undefined") {
        avatar.input.setWidth(x);
      }
    }
  }
}
