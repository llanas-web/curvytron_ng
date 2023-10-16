import { Component, Input, OnInit } from "@angular/core";
import { boundMethod } from "autobind-decorator";
import { EventEmitter } from "events";
import { Avatar } from "src/app/models/avatar.model";
import { Game } from "src/app/models/game.model";
import { GameRepository } from "src/app/repositories/game.repository";
import { NotifierService } from "src/app/services/notifier.service";

@Component({
  selector: "app-round",
  templateUrl: "./round.component.html",
  styleUrls: ["./round.component.scss"],
})
export class RoundComponent extends EventEmitter implements OnInit {
  @Input() game: Game;

  warmupInterval = null;
  roundWinner = null;
  gameWinner = null;
  warmupElement: HTMLElement;
  tieBreakElement: HTMLElement;
  countElement: HTMLElement;
  endElement: HTMLElement;
  renderElement: HTMLElement;
  winner: Avatar;

  get list() {
    return this.game.avatars.items;
  }

  constructor(
    private repository: GameRepository,
    private notifier: NotifierService
  ) {
    super();
  }

  ngOnInit(): void {
    this.warmupElement = document.getElementById("warmup");
    this.tieBreakElement = document.getElementById("tie-break");
    this.countElement = document.getElementById("count");
    this.endElement = document.getElementById("end");
    this.renderElement = document.getElementById("render");

    this.attachEvents();
  }

  /**
   * Attach socket Events
   */
  attachEvents() {
    this.repository.on("borderless", this.updateBorders);
    this.repository.on("blinkgame", this.onBlinkGame);
    this.repository.on("round:end", this.onRoundEnd);
    this.repository.on("round:new", this.onRoundNew);
    this.repository.on("end", this.onEnd);
  }

  /**
   * Start warmup
   */
  displayWarmup(time) {
    this.warmupElement.style.display = "block";
    this.countElement.innerHTML = "" + time / 1000;
    this.warmupInterval = setInterval(this.onWarmup, 1000);
    setTimeout(this.endWarmup, time);
    this.notifier.notify(
      "Round start in " + this.countElement.innerHTML + "..."
    );
  }

  /**
   * Clear warmup interval
   */
  clearWarmup() {
    if (this.warmupInterval) {
      clearInterval(this.warmupInterval);
      this.warmupInterval = null;
    }
  }
  /**
   * Attach socket Events
   */
  @boundMethod
  detachEvents() {
    this.repository.off("blinkgame", this.onBlinkGame);
    this.repository.off("borderless", this.updateBorders);
    this.repository.off("round:end", this.onRoundEnd);
    this.repository.off("round:new", this.onRoundNew);
    this.repository.off("end", this.onEnd);
    this.clearWarmup();
  }

  /**
   * On round new
   *
   * @param {Event} e
   */
  @boundMethod
  onRoundNew(e) {
    this.updateBorders();
    this.endElement.style.display = "none";

    if (this.game.isTieBreak()) {
      this.tieBreakElement.style.display = "block";
    }

    this.displayWarmup(Game.warmupTime);
  }

  /**
   * On round end
   *
   * @param {Event} e
   */
  @boundMethod
  onRoundEnd(e) {
    this.notifier.notifyInactive(
      this.game.roundWinner
        ? this.game.roundWinner.name + " won round!"
        : "Round end!"
    );

    this.winner = this.game.roundWinner ? this.game.roundWinner : false;

    this.endElement.style.display = "block";
  }

  /**
   * On end
   *
   * @param {Event} e
   */
  @boundMethod
  onEnd(e) {
    this.notifier.notify("Game over!", null, "win");
    this.winner = this.game.avatars.getFirst();
    this.endElement.style.display = "block";
  }

  /**
   * Update map borders
   */
  @boundMethod
  updateBorders() {
    this.renderElement.classList.toggle("borderless", this.game.borderless);
  }

  /**
   * Update map borders
   */
  @boundMethod
  onBlinkGame() {
    //this.renderElement
    //TODO hide game
  }

  /**
   * On warmup
   */
  @boundMethod
  onWarmup() {
    this.countElement.innerHTML =
      "" + (Number(this.countElement.innerHTML) - 1);
    this.notifier.notify(
      "Round start in " + this.countElement.innerHTML + "..."
    );
  }

  /**
   * End warmup
   */
  @boundMethod
  endWarmup() {
    this.clearWarmup();
    this.warmupElement.style.display = "none";
    this.notifier.notify("Go!", 1000);
  }

  trackById(index: number, avatar: Avatar) {
    return avatar.id;
  }
}
