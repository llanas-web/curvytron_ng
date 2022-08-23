import { Component, Input, OnInit } from "@angular/core";
import { boundMethod } from "autobind-decorator";
import { EventEmitter } from "events";
import { Game } from "src/app/models/game.model";
import { MessageDie } from "src/app/models/messages/message-die.model";
import { SocketClientService } from "src/app/services/core/socket-client.service";

@Component({
  selector: "app-kill-log",
  templateUrl: "./kill-log.component.html",
  styleUrls: ["./kill-log.component.scss"],
})
export class KillLogComponent extends EventEmitter implements OnInit {
  element: HTMLElement;

  @Input() game: Game;

  constructor(private client: SocketClientService) {
    super();

    this.client.on("die", this.onDie);
    this.client.on("round:new", this.clear);
  }

  ngOnInit(): void {
    this.element = document.getElementById("kill-log-feed");
  }

  /**
   * Display the given message
   */
  display(message: MessageDie) {
    var content = `<span class="message-icon icon-dead"></span>
          <span style="color: ${message.deadPlayer.color}"> ${
      message.deadPlayer.name
    }</span> ${this.interpolateMessage(message)}`;
    let item = this.element.children[0];

    item.innerHTML = content;
    this.element.appendChild(item);
  }

  interpolateMessage(message: MessageDie) {
    switch (message.type) {
      case "suicide":
        return `committed suicide`;
      case "kill":
        return `was killed by <span style="color: ${message.killerPlayer.color}">${message.killerPlayer.name}</span>`;
      case "crash":
        return `crashed on <span style="color: ${message.killerPlayer.color}">${message.killerPlayer.name}</span>`;
      case "wall":
        return `crashed on the wall`;
    }
  }

  /**
   * On die
   */
  @boundMethod
  onDie({ avatar }: { avatar: number }) {
    var _avatar = this.game.avatars.getById(avatar);

    if (avatar) {
      this.display(
        new MessageDie(
          _avatar,
          e.detail[1] ? this.game.avatars.getById(e.detail[1]) : null,
          e.detail[2]
        )
      );
    }
  }

  /**
   * Clear
   */
  @boundMethod
  clear() {
    for (var i = this.element.children.length - 1; i >= 0; i--) {
      this.element.children[i].innerHTML = "";
    }
  }
}
