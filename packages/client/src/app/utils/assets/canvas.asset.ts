export class AssetCanvas {
  element: HTMLCanvasElement;
  context: CanvasRenderingContext2D;

  constructor(width: number, height: number) {
    this.element = document.createElement("canvas");
    this.context = this.element.getContext("2d");

    this.element.width = width;
    this.element.height = height;
  }

  /**
   * Clear
   */
  clear() {
    this.context.clearRect(0, 0, this.element.width, this.element.height);
  }

  /**
   * To string
   */
  toString() {
    return this.element.toDataURL();
  }

  /**
   * Draw image from source
   *
   * @param {Image} image
   * @param {Number} x
   * @param {Number} y
   */
  drawImageFromSource(image: HTMLImageElement, x: number, y: number) {
    const { width, height } = this.element;

    this.context.drawImage(image, x, y, width, height, 0, 0, width, height);
  }
}
