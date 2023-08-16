import { Component, Input, OnInit } from "@angular/core";
import { boundMethod } from "autobind-decorator";
import { EventEmitter } from "events";
import { Avatar } from "src/app/models/avatar.model";
import { Game } from "src/app/models/game.model";
import { Player } from "src/app/models/player.model";
import { SocketClientService } from "src/app/services/core/socket-client.service";

@Component({
  selector: "app-player-list",
  templateUrl: "./player-list.component.html",
  styleUrls: ["./player-list.component.scss"],
})
export class PlayerListComponent extends EventEmitter implements OnInit {
  @Input() game: Game;
  element: Element;

  get avatars() {
    return this.game.avatars.items;
  }

  constructor(private client: SocketClientService) {
    super();

    this.attachEvents();
  }

  ngOnInit(): void {
    this.element = document.getElementsByClassName("game-players")[0];
  }

  /**
   * Attach socket Events
   */
  attachEvents() {
    this.client.on("score", this.onScore);
    this.client.on("score:round", this.onRoundScore);
    this.client.on("round:new", this.onRoundNew);
    this.client.on("round:end", this.onRoundEnd);
    this.client.on("die", this.onDie);
  }

  /**
   * Get avatar related elements in DOM
   */
  getElements(avatar: Avatar) {
    if (!avatar.elements.root) {
      avatar.elements.root = document.getElementById("avatar-" + avatar.id);
      avatar.elements.score = document.getElementById(
        "avatar-score-" + avatar.id
      );
      avatar.elements.roundScore = document.getElementById(
        "avatar-round-score-" + avatar.id
      );

      if (avatar.local) {
        avatar.elements.root.classList.add("local");
      }
    }

    return avatar.elements;
  }

  /**
   * Update score
   */
  updateScore(avatar: Avatar) {
    this.getElements(avatar).score.innerHTML = avatar.score;
  }

  /**
   * Update round score
   */
  updateRoundScore(avatar: Avatar) {
    this.getElements(avatar).roundScore.innerHTML = avatar.roundScore
      ? "+" + avatar.roundScore
      : "";
  }

  /**
   * Reorder player list
   */
  reorder() {
    var length = this.game.sortAvatars().items.length;

    for (var elements, i = 0; i < length; i++) {
      elements = this.getElements(this.game.avatars.items[i]);
      elements.root.parentNode.appendChild(elements.root);
    }
  }
  /**
   * Attach socket Events
   */
  @boundMethod
  detachEvents() {
    this.client.off("score", this.onScore);
    this.client.off("score:round", this.onRoundScore);
    this.client.off("round:new", this.onRoundNew);
    this.client.off("round:end", this.onRoundEnd);
    this.client.off("die", this.onDie);
  }

  /**
   * On score
   *
   * @param {Event} e
   */
  @boundMethod
  onScore(e: Event) {
    var avatar = this.game.avatars.getById(e[0]);

    if (avatar) {
      avatar.setScore(e[1]);
      this.updateScore(avatar);
    }
  }

  /**
   * On round score
   *
   * @param {Event} e
   */
  @boundMethod
  onRoundScore(e: Event) {
    var avatar = this.game.avatars.getById(e[0]);

    if (avatar) {
      avatar.setRoundScore(e[1]);
      this.updateRoundScore(avatar);
    }
  }

  /**
   * On round new
   *
   * @param {Event} e
   */
  @boundMethod
  onRoundNew(e: Event) {
    this.element.classList.add("in-round");

    for (var i = this.game.avatars.items.length - 1; i >= 0; i--) {
      this.getElements(this.game.avatars.items[i]).root.classList.remove(
        "dead"
      );
    }
  }

  /**
   * On round dnd
   *
   * @param {Event} e
   */
  @boundMethod
  onRoundEnd(e: Event) {
    this.element.classList.remove("in-round");
    this.reorder();
  }

  /**
   * On die
   *
   * @param {Event} e
   */
  @boundMethod
  onDie(e: Event) {
    var avatar = this.game.avatars.getById(e[0]);

    if (avatar) {
      this.getElements(avatar).root.classList.add("dead");
    }
  }

  trackById(index: number, player: Player) {
    return player.id;
  }
}
