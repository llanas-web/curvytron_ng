import { BaseTrail } from "@shared/model/BaseTrail";
import { Avatar } from "./avatar.model";

export class Trail extends BaseTrail {
  /**
   * Distance tolerance
   */
  static tolerance = 1;

  clearAsked = false;
  queueX = null;
  queueY = null;

  constructor(avatar: Avatar) {
    super(avatar);
  }

  /**
   * Get last segment
   */
  getLastSegment() {
    var length = this.points.length,
      points = null;

    if (length) {
      points = this.points.slice(0);

      if (this.clearAsked) {
        super.clear();
        if (this.queueX !== null) {
          super.addPoint(this.queueX, this.queueY);
          this.queueX = null;
          this.queueY = null;
        }
        this.clearAsked = false;
      } else if (length > 1) {
        this.points.splice(0, length - 1);
      }
    }

    return points;
  }

  /**
   * Add point
   */
  addPoint(x: number, y: number) {
    if (
      this.lastX !== null &&
      (Math.abs(this.lastX - x) > Trail.tolerance ||
        Math.abs(this.lastY - y) > Trail.tolerance)
    ) {
      this.clear();
      this.queueX = x;
      this.queueY = y;
    } else {
      super.addPoint(x, y);
    }
  }

  /**
   * Clear
   */
  clear() {
    this.clearAsked = true;
  }
}
