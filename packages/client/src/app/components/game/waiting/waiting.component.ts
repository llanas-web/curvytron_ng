import { Component, Input, OnInit } from "@angular/core";
import { boundMethod } from "autobind-decorator";
import { EventEmitter } from "events";
import { Game } from "src/app/models/game.model";
import { Player } from "src/app/models/player.model";
import { SocketClientService } from "src/app/services/core/socket-client.service";

@Component({
  selector: "app-waiting",
  templateUrl: "./waiting.component.html",
  styleUrls: ["./waiting.component.scss"],
})
export class WaitingComponent extends EventEmitter implements OnInit {
  @Input() game: Game;

  get list() {
    return this.game.avatars.items.slice(0);
  }

  constructor(private client: SocketClientService) {
    super();

    this.attachEvents();
  }

  /**
   * Attach socket Events
   */
  attachEvents() {
    this.client.on("ready", this.onReady);
  }

  ngOnInit(): void {}

  /**
   * Attach socket Events
   */
  @boundMethod
  detachEvents() {
    this.client.off("ready", this.onReady);
  }

  /**
   * On avatar ready (client loaded)
   */
  @boundMethod
  onReady(e) {
    var avatar = this.game.avatars.getById(e);
    let index = this.list.indexOf(avatar);

    if (avatar && index) {
      this.list.splice(index, 1);
    }
  }

  /**
   * On game start
   *
   * @param {Event} e
   */
  @boundMethod
  onStart(e) {
    this.list.length = 0;
    this.detachEvents();
  }

  trackById(index: number, player: Player) {
    return player.id;
  }
}
