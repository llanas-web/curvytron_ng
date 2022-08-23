import { Injectable } from "@angular/core";

import { ProfileService } from "./profile.service";

@Injectable({
  providedIn: "root",
})
export class RadioService {
  /**
   * Source URL
   */
  static source = "http://streaming.radionomy.com/Curvyradio";

  /**
   * Volume
   */
  static volume = 0.8;

  active = false;
  enabled: boolean;
  element: HTMLVideoElement;
  source: any;

  constructor(private profile: ProfileService) {
    this.enabled = this.profile.radio;
    this.element = this.getVideo();
    this.resolve();
  }

  toggle() {
    this.setEnabled(!this.enabled);
  }

  /**
   * Get video
   */
  getVideo(): HTMLVideoElement {
    const video = document.createElement("video");
    const source = document.createElement("source");
    video.appendChild(source);
    video.autoplay = true;
    video.volume = RadioService.volume;
    source.type = "audio/mpeg";
    return video;
  }

  /**
   * Set enabled/disabled (controlled by the user)
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled ? true : false;
    this.profile.setRadio(this.enabled);
    this.resolve();
  }

  /**
   * Set active/inactive (controlled by the game)
   */
  setActive(active: boolean) {
    this.active = active ? true : false;
    this.resolve();
  }

  /**
   * Set volume
   */
  setVolume(volume: number) {
    this.element.volume =
      typeof volume !== "undefined" ? volume : RadioService.volume;
  }

  /**
   * Resolve radio status
   */
  resolve() {
    if (this.active && this.enabled) {
      this.play();
    } else {
      this.stop();
    }
  }

  /**
   * Play
   */
  play() {
    this.element.src = this.source;
  }

  /**
   * Stop
   */
  stop() {
    this.element.src = "";
  }
}
