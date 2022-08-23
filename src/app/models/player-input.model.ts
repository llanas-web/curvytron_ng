import { boundMethod } from "autobind-decorator";
import { EventEmitter } from "events";
import { Avatar } from "./avatar.model";

/**
 * Player input
 */
export class PlayerInput extends EventEmitter {
  /**
   * Key binding
   * left, right, top, bottom arrow keys
   */
  static defaultBinding = [37, 39, 38, 40];

  key: boolean;
  active: boolean[];
  move: number | boolean;
  speeding: number;
  width: number;

  constructor(
    public avatar: Avatar,
    public binding: string[] | number[] | Touch[] = PlayerInput.defaultBinding
  ) {
    super();

    this.avatar = avatar;
    this.key = false;
    this.active = [false, false, false, false];
    this.move = 0;
    this.speeding = 0;
    this.width = 0;

    this.attachEvents();
  }

  /**
   * Attach events
   */
  attachEvents() {
    const listening = [];
    let binding: any;
    let type: string;

    for (var i = this.binding.length - 1; i >= 0; i--) {
      binding = this.binding[i];
      type = this.getBindingType(binding);

      if (listening.indexOf(type) < 0) {
        listening.push(type);

        if (type === "keyboard") {
          window.addEventListener("keydown", this.onKeyDown);
          window.addEventListener("keyup", this.onKeyUp);
        } else if (type === "touch") {
          window.addEventListener("touchstart", this.onTouch);
          window.addEventListener("touchend", this.onTouch);
          window.addEventListener("touchleave", this.onTouch);
          window.addEventListener("touchcancel", this.onTouch);
        }
        // else if (new RegExp("^gamepad:\\d+:button").test(type)) {
        //   gamepadListener.on(type, this.onButton);
        // } else {
        //   gamepadListener.on(type, this.onAxis);
        // }
      }
    }
  }

  /**
   * Detach events
   */
  detachEvents() {
    var listening = [],
      binding: any,
      type: string;

    for (var i = this.binding.length - 1; i >= 0; i--) {
      binding = this.binding[i];
      type = this.getBindingType(binding);

      if (listening.indexOf(type) < 0) {
        listening.push(type);

        if (type === "keyboard") {
          window.removeEventListener("keydown", this.onKeyDown);
          window.removeEventListener("keyup", this.onKeyUp);
        } else if (type === "touch") {
          window.removeEventListener("touchstart", this.onTouch);
          window.removeEventListener("touchend", this.onTouch);
          window.removeEventListener("touchleave", this.onTouch);
          window.removeEventListener("touchcancel", this.onTouch);
        }
        //  else if (new RegExp("^gamepad:\\d+:button").test(type)) {
        //   gamepadListener.off(type, this.onButton);
        // } else {
        //   gamepadListener.off(type, this.onAxis);
        // }
      }
    }
  }

  /**
   * Get binding type
   */
  getBindingType(binding: string | Touch) {
    if (typeof Touch !== "undefined" && binding instanceof Touch) {
      return "touch";
    }

    var matches = new RegExp("^(gamepad:(\\d+):(button|axis):(\\d+))").exec(
      binding as string
    );

    return matches ? matches[1] : "keyboard";
  }

  /**
   * Resolve
   */
  setActive(index: string | number, pressed: boolean) {
    if (this.active[index] !== pressed) {
      this.active[index] = pressed;
      this.resolve();
    }
  }

  /**
   * Resolve
   */
  resolve() {
    var move =
      this.active[0] !== this.active[1] ? (this.active[0] ? -1 : 1) : false;
    var speeding =
      this.active[2] !== this.active[3] ? (this.active[3] ? 0.5 : 1.5) : 0;

    if (this.move !== move) {
      this.setMove(move);
    }
    if (this.speeding !== speeding) {
      this.setSpeeding(speeding);
    }
  }

  /**
   * Use gamepad?
   */
  useGamepad() {
    for (var i = this.binding.length - 1; i >= 0; i--) {
      if (
        new RegExp("^gamepad:").test(this.getBindingType("" + this.binding[i]))
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Set move
   */
  setMove(move: number | boolean) {
    this.move = move;
    this.emit("move", { avatar: this.avatar, move: move });
  }

  /**
   * Set speed
   */
  setSpeeding(speeding: number) {
    this.speeding = speeding;
    this.emit("speeding", { avatar: this.avatar, speeding: speeding });
  }

  /**
   * Set width
   */
  setWidth(width: number) {
    this.width = width;
  }

  /**
   * On Key Down
   *
   * @param {Event} e
   */
  @boundMethod
  onKeyDown({ keyCode }: { keyCode: number }) {
    var index = this.binding.findIndex(
      (el: string | number | Touch) => el === keyCode
    );

    if (index >= 0) {
      this.setActive(index, true);
    }
  }

  /**
   * On Key Down
   *
   * @param {Event} e
   */
  @boundMethod
  onKeyUp(e: { keyCode: any }) {
    var index = this.binding.findIndex(
      (el: string | number | Touch) => el === e.keyCode
    );

    if (index >= 0) {
      this.setActive(index, false);
    }
  }

  /**
   * On axis
   *
   * @param {Event} e
   */
  @boundMethod
  onAxis({
    detail,
  }: {
    detail: { gamepad: { index: string }; axis: string; value: string };
  }) {
    var index = this.binding.findIndex(
      (el: string | number | Touch) =>
        el ===
        `gamepad:${detail.gamepad.index}:axis:${detail.axis}:${detail.value}`
    );

    if (index >= 0) {
      this.setActive(index, true);
    } else {
      for (var i = this.binding.length - 1; i >= 0; i--) {
        if (
          new RegExp(
            `^gamepad:${detail.gamepad.index}:axis:${detail.axis}`
          ).test(this.binding[i] as string)
        ) {
          this.setActive(i, false);
        }
      }
    }
  }

  /**
   * On button
   *
   * @param {Event} e
   */
  @boundMethod
  onButton({
    detail,
  }: {
    detail: { gamepad: { index: string }; index: string; pressed: any };
  }) {
    var index = this.binding.findIndex(
      (el: string | number | Touch) =>
        el === `gamepad:${detail.gamepad.index}:button:${detail.index}`
    );

    if (index >= 0) {
      this.setActive(index, detail.pressed);
    }
  }

  /**
   * On touch start
   *
   */
  @boundMethod
  onTouch(e: Event | TouchEvent) {
    e.preventDefault();

    var center = this.width / 2,
      tests = [],
      t: number,
      i: number,
      x: number;

    for (i = this.binding.length - 1; i >= 0; i--) {
      if (this.binding[i] instanceof TouchEvent) {
        tests.push({ index: i, result: false });
      }
    }

    if (e instanceof TouchEvent) {
      for (i = e.touches.length - 1; i >= 0; i--) {
        for (t = tests.length - 1; t >= 0; t--) {
          x = e.touches[i].screenX;
          if (tests[t].index === 0 ? x < center : x >= center) {
            tests[t].result = true;
          }
        }
      }
    }

    for (i = tests.length - 1; i >= 0; i--) {
      this.setActive(tests[i].index, tests[i].result);
    }
  }
}
