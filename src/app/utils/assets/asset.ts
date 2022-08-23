export class Asset {
  source: string;
  element: HTMLImageElement;

  constructor(
    source: string,
    callback: (...arg: any[]) => any,
    load: boolean = false
  ) {
    this.source = source;
    this.element = new Image();

    this.element.addEventListener("load", callback);

    if (load) {
      this.load();
    }
  }

  /**
   * Set source
   */
  setSource(source: string) {
    this.source = source;
  }

  /**
   * Load
   */
  load() {
    this.element.src = this.source;
  }

  /**
   * Get image
   */
  getImage(): HTMLImageElement {
    return this.element;
  }

  /**
   * Get image width
   */
  getWidth(): number {
    return this.element.width;
  }

  /**
   * Get image height
   */
  getHeight(): number {
    return this.element.height;
  }
}
