export class SoundAsset {
  /**
   * Formats / Mime-Types
   */
  static formats = {
    mp3: "audio/mpeg",
    ogg: "audio/ogg",
  };

  source: string;
  element: HTMLAudioElement;
  formats: Object;

  constructor(
    source: string,
    callback: (...args: any[]) => any,
    load = false,
    formats = SoundAsset.formats
  ) {
    this.source = source;
    this.formats = formats;
    this.element = new Audio();

    this.element.addEventListener("canplaythrough", callback);

    this.attachSources();

    if (load) {
      this.load();
    }
  }

  /**
   * Attach sources
   */
  attachSources() {
    for (var format in this.formats) {
      var source = document.createElement("source");
      source.type = this.formats[format];
      this.element.appendChild(source);
    }
  }

  /**
   * Load
   */
  load() {
    document.body.appendChild(this.element);

    Object.values(this.formats).forEach((format, index) => {
      (this.element.childNodes[index] as HTMLAudioElement).src =
        this.source + "." + format;
    });
  }

  /**
   * Get the audio element
   */
  getAudio() {
    return this.element;
  }
}
