import { Asset } from "./asset";
import { AssetCanvas } from "./canvas.asset";

/**
 * Sprite Asset
 */
export class SpriteAsset {
  width = 0;
  height = 0;
  images = [];
  assets = [];
  loaded = 0;

  length: number;
  canvas: AssetCanvas;

  constructor(
    public source: string | HTMLImageElement,
    public columns: number,
    public rows: number,
    public callback: (...args: any) => any,
    load: boolean = false
  ) {
    this.length = this.columns * this.rows;

    this.preLoaded = this.preLoaded.bind(this);
    this.partLoaded = this.partLoaded.bind(this);

    this.createImages();

    if (load) {
      this.load();
    }
  }

  /**
   * Load
   */
  load() {
    const sprite = new Asset(this.source as string, this.preLoaded.bind(this));

    this.source = sprite.getImage();

    sprite.load();
  }

  /**
   * Create images
   */
  createImages() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.columns; col++) {
        const asset = new Asset(null, this.partLoaded);

        this.assets.push({ asset, row, col });
        this.images.push(asset.getImage());
      }
    }
  }

  /**
   * On sprite preloaded
   */
  preLoaded() {
    const _source = this.source as HTMLImageElement;
    this.width = _source.width / this.columns;
    this.height = _source.height / this.rows;
    this.canvas = new AssetCanvas(this.width, this.height);

    this.assets.forEach((assetData) => {
      const { asset } = assetData;
      const x = assetData.col * this.width;
      const y = assetData.row * this.height;

      this.canvas.clear();
      this.canvas.drawImageFromSource(_source, x, y);

      asset.setSource(this.canvas.toString());
      asset.load();
    });

    delete this.canvas;
  }

  /**
   * On a sub image is loaded
   */
  partLoaded() {
    this.loaded++;

    if (this.loaded === this.images.length) {
      this.callback();
    }
  }

  /**
   * Get images
   */
  getImages(): Array<any> {
    return this.images;
  }
}
