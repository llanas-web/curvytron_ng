import { BaseBonusManager } from "@shared/manager/BaseBonusManager";
import { boundMethod } from "autobind-decorator";
import { EventEmitter } from "events";

export class StackedBonus extends EventEmitter {
  /**
   * Assets
   */
  static assets = BaseBonusManager.assets;

  /**
   * Opacity
   */
  static opacity = 1;

  id: number;
  duration: number;
  asset: any;
  changed: boolean;
  timeout: NodeJS.Timeout | NodeJS.Timer;
  opacity: number;

  constructor(id: number, type: string | number, duration: number) {
    super();

    this.id = id;
    this.duration = duration;
    this.asset = StackedBonus.assets[type];
    this.changed = true;

    this.setEnding = this.setEnding.bind(this);
    this.toggleOpacity = this.toggleOpacity.bind(this);
  }

  /**
   * Clear
   */
  clear() {
    if (this.timeout) {
      clearInterval(this.timeout);
      this.timeout = undefined;
    }
  }

  /**
   * Set ending timeout
   */
  setEndingTimeout(warning: number) {
    this.timeout = setTimeout(this.setEnding, this.duration - warning);
  }

  /**
   * Set ending
   */
  @boundMethod
  setEnding() {
    this.timeout = setInterval(this.toggleOpacity, 100);
  }

  /**
   * Toggle opacity
   */
  @boundMethod
  toggleOpacity() {
    this.opacity = this.opacity === 1 ? 0.5 : 1;
    this.changed = true;
    this.emit("change");
  }
}
