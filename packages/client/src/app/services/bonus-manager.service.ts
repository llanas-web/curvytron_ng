import { Injectable } from "@angular/core";
import { Collection } from "@shared/collection";
import { BaseBonusManager } from "@shared/manager/BaseBonusManager";
import { boundMethod } from "autobind-decorator";
import { MapBonus } from "../models/bonus/map-bonus.model";
import { SpriteAsset } from "../utils/assets/sprite.asset";
import { Canvas } from "./core/canvas";

@Injectable({
  providedIn: "root",
})
export class BonusManagerService extends BaseBonusManager {
  /**
   * Assets
   */
  static assets = {};

  /**
   * Bonuses position on the sprite
   */
  static spritePosition = [
    "BonusSelfFast",
    "BonusEnemyFast",
    "BonusSelfSlow",
    "BonusEnemySlow",
    "BonusGameBorderless",
    "BonusSelfMaster",
    "BonusEnemyBig",
    "BonusAllColor",
    "BonusEnemyInverse",
    "BonusSelfSmall",
    "BonusGameClear",
    "BonusEnemyStraightAngle",
  ];

  loaded: boolean;
  sprite: SpriteAsset;
  canvas: Canvas;

  declare bonuses: Collection<MapBonus>;

  constructor() {
    super();

    this.bonuses = new Collection<MapBonus>([], "id", true);
    this.bonuses.index = false;

    this.loaded = false;
    this.sprite = new SpriteAsset(
      "assets/images/bonus.png",
      3,
      4,
      this.onLoad,
      true
    );
  }

  /**
   * Load DOM
   */
  loadDOM() {
    this.canvas = new Canvas(
      0,
      0,
      document.getElementById("bonus") as HTMLCanvasElement
    );
  }

  /**
   * Remove bonus
   */
  remove(bonus: MapBonus) {
    this.clearBonus(bonus);
    return super.remove(bonus);
  }

  /**
   * Clear
   */
  clear() {
    this.canvas.clear();
    super.clear();
  }

  /**
   * Draw
   */
  draw() {
    for (var bonus, i = this.bonuses.items.length - 1; i >= 0; i--) {
      bonus = this.bonuses.items[i];
      if (!bonus.animation.done && bonus.drawWidth) {
        this.clearBonus(bonus);
      }
    }

    for (let bonus, i = this.bonuses.items.length - 1; i >= 0; i--) {
      bonus = this.bonuses.items[i];
      if (!bonus.animation.done) {
        bonus.update();
        this.drawBonus(bonus);
      }
    }
  }

  /**
   * Draw bonus
   */
  drawBonus(bonus: MapBonus) {
    this.canvas.drawImageScaled(
      bonus.asset,
      bonus.drawX,
      bonus.drawY,
      bonus.drawWidth,
      bonus.drawWidth
    );
  }

  /**
   * Clear bonus from the canvas
   */
  clearBonus(bonus: MapBonus) {
    this.canvas.clearZoneScaled(
      bonus.drawX,
      bonus.drawY,
      bonus.drawWidth,
      bonus.drawWidth
    );
  }

  /**
   * Set dimension
   */
  setDimension(width: number, scale: number) {
    this.canvas.setDimension(width, width, scale);
    this.draw();
  }

  @boundMethod
  onLoad() {
    var images = this.sprite.getImages();

    for (var i = BonusManagerService.spritePosition.length - 1; i >= 0; i--) {
      BonusManagerService.assets[BonusManagerService.spritePosition[i]] =
        images[i];
    }

    this.loaded = true;
    this.emit("load");
  }
}
