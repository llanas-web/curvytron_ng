import { boundMethod } from "autobind-decorator";

export class BounceIn {
  /**
   * Target value
   */
  static target = 1;

  /**
   * Easing constant
   */
  static factor = 1.77635683940025e-15;

  duration: number;
  created: any;
  done: boolean;
  timeout: NodeJS.Timeout;

  constructor(duration: number) {
    this.duration = duration;
    this.created = null;
    this.done = false;

    this.end = this.end.bind(this);

    this.start();
  }

  /**
   * Start animation
   */
  start() {
    this.created = new Date().getTime();
    this.timeout = setTimeout(this.end, this.duration);
  }

  /**
   * Get size
   */
  getValue() {
    return this.easeOutBack(
      this.getAge(),
      0,
      BounceIn.target,
      this.duration,
      BounceIn.factor
    );
  }

  /**
   * Get age in millisecond
   */
  getAge() {
    return new Date().getTime() - this.created;
  }

  /**
   * Ease out back
   *
   * @param {Number} time
   * @param {Number} begin
   * @param {Number} target
   * @param {Number} duration
   * @param {Float} factor
   */
  easeOutBack(
    time: number,
    begin: number,
    target: number,
    duration: number,
    factor: number
  ) {
    var ts = (time /= duration) * time,
      tc = ts * time;
    return begin + target * (factor * tc * ts + 4 * tc + -9 * ts + 6 * time);
  }

  @boundMethod
  end() {
    clearTimeout(this.timeout);
    this.done = true;
    this.timeout = undefined;
  }
}
