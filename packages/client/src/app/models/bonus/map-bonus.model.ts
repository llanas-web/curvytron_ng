import { BaseBonusManager } from "@shared/manager/BaseBonusManager";
import { BaseBonus } from "@shared/model/BaseBonus";
import { BounceIn } from "src/app/utils/animation/bounce-in.anim";

export class MapBonus extends BaseBonus {
  static assets = BaseBonusManager.assets;
  asset: any;
  assets: any;
  animation: any;
  changed: boolean;
  drawRadius: number;
  drawWidth: number;
  drawX: number;
  drawY: number;

  constructor(id: string, x: number, y: number, type: string | number) {
    super(x, y);

    this.id = id;
    this.asset = this.assets[type];
    this.animation = new BounceIn(300);
    this.changed = true;
    this.drawRadius = 0;
    this.drawWidth = 0;
    this.drawX = 0;
    this.drawY = 0;

    this.update();
  }

  /**
   * Update bonus for drawing
   */
  update() {
    this.drawRadius = this.radius * this.animation.getValue();
    this.drawWidth = this.drawRadius * 2;
    this.drawX = this.x - this.drawRadius;
    this.drawY = this.y - this.drawRadius;
  }
}
