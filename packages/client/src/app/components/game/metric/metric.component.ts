import { Component, Input, OnInit } from "@angular/core";
import { boundMethod } from "autobind-decorator";
import { EventEmitter } from "events";
import { Game } from "src/app/models/game.model";
import { SocketClientService } from "src/app/services/core/socket-client.service";

@Component({
  selector: "app-metric",
  templateUrl: "./metric.component.html",
  styleUrls: ["./metric.component.scss"],
})
export class MetricComponent extends EventEmitter implements OnInit {
  @Input() game: Game;

  fps = 0;
  fpsColor = "gray";
  latency = 0;
  latencyColor = "gray";
  spectators = 0;

  constructor(private client: SocketClientService) {
    super();
  }

  ngOnInit(): void {
    this.attachEvents();
  }

  /**
   * Attach events
   */
  attachEvents() {
    this.client.on("latency", this.onLatency);
    this.client.on("game:spectators", this.onSpectators);
    this.game.fps.on("fps", this.onFPS);
  }

  /**
   * Get FPS color
   */
  getFPSColor(fps) {
    if (fps >= 55) {
      return "green";
    }
    if (fps >= 40) {
      return "orange";
    }
    if (fps >= 1) {
      return "red";
    }

    return "gray";
  }

  /**
   * Get latency color
   */
  getLatencyColor(latency: number) {
    if (latency <= 100) {
      return "green";
    }
    if (latency <= 250) {
      return "orange";
    }

    return "red";
  }

  /**
   * Detach events
   */
  @boundMethod
  detachEvents() {
    this.client.off("latency", this.onLatency);
    this.client.off("game:spectators", this.onSpectators);
    this.game.fps.off("fps", this.onFPS);
  }

  /**
   * On FPS
   */
  @boundMethod
  onFPS(event) {
    var value = this.game.fps.frequency;

    if (this.fps !== value) {
      this.fps = value;
      this.fpsColor = this.getFPSColor(value);
    }
  }

  /**
   * On latency
   */
  @boundMethod
  onLatency(value: number) {
    if (this.latency !== value) {
      this.latency = value;
      this.latencyColor = this.getLatencyColor(value);
    }
  }

  /**
   * On spectators
   */
  @boundMethod
  onSpectators(event) {
    this.spectators = event;
  }
}
