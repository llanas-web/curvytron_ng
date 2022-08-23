import { Injectable } from "@angular/core";
import { Compressor } from "@shared/service/Compressor";
import { EventEmitter } from "events";
import { SocketClientService } from "../services/core/socket-client.service";
import { NotifierService } from "../services/notifier.service";
import { SoundManagerService } from "../services/sound-manager.service";
import { RoomRepository } from "./room.repository";
import { boundMethod } from "autobind-decorator";
import { MapBonus } from "../models/bonus/map-bonus.model";
import { StackedBonus } from "../models/bonus/stacked-bonus.model";
import { SerializedBaseGame } from "@shared/model/BaseGame";
import { Game } from "../models/game.model";

/**
 * Room Repository
 */
@Injectable({
  providedIn: "root",
})
export class GameRepository extends EventEmitter {
  compressor: Compressor;
  game: Game;

  constructor(
    private client: SocketClientService,
    public parent: RoomRepository,
    private sound: SoundManagerService,
    private notifier: NotifierService
  ) {
    super();

    this.compressor = new Compressor();
    this.game = null;

    // this.start = this.start.bind(this);
    // this.stop = this.stop.bind(this);
    // this.draw = this.draw.bind(this);
    // this.onGameStart = this.onGameStart.bind(this);
    // this.onGameStop = this.onGameStop.bind(this);
    // this.onBonusPop = this.onBonusPop.bind(this);
    // this.onBonusClear = this.onBonusClear.bind(this);
    // this.onBonusStack = this.onBonusStack.bind(this);
    // this.onPosition = this.onPosition.bind(this);
    // this.onAngle = this.onAngle.bind(this);
    // this.onPoint = this.onPoint.bind(this);
    // this.onDie = this.onDie.bind(this);
    // this.onProperty = this.onProperty.bind(this);
    // this.onRoundNew = this.onRoundNew.bind(this);
    // this.onRoundEnd = this.onRoundEnd.bind(this);
    // this.onClear = this.onClear.bind(this);
    // this.onBorderless = this.onBorderless.bind(this);
    // this.onEnd = this.onEnd.bind(this);
    // this.onLeave = this.onLeave.bind(this);
    // this.onSpectate = this.onSpectate.bind(this);
  }

  /**
   * Attach events
   */
  attachEvents() {
    this.client.on("game:start", this.onGameStart);
    this.client.on("game:stop", this.onGameStop);
    this.client.on("property", this.onProperty);
    this.client.on("position", this.onPosition);
    this.client.on("angle", this.onAngle);
    this.client.on("point", this.onPoint);
    this.client.on("die", this.onDie);
    this.client.on("bonus:pop", this.onBonusPop);
    this.client.on("bonus:clear", this.onBonusClear);
    this.client.on("bonus:stack", this.onBonusStack);
    this.client.on("round:new", this.onRoundNew);
    this.client.on("round:end", this.onRoundEnd);
    this.client.on("clear", this.onClear);
    this.client.on("borderless", this.onBorderless);
    this.client.on("end", this.onEnd);
    this.client.on("game:leave", this.onLeave);
    this.client.on("spectate", this.onSpectate);
  }

  /**
   * Attach events
   */
  detachEvents() {
    this.client.off("game:start", this.onGameStart);
    this.client.off("game:stop", this.onGameStop);
    this.client.off("property", this.onProperty);
    this.client.off("position", this.onPosition);
    this.client.off("angle", this.onAngle);
    this.client.off("point", this.onPoint);
    this.client.off("die", this.onDie);
    this.client.off("bonus:pop", this.onBonusPop);
    this.client.off("bonus:clear", this.onBonusClear);
    this.client.off("bonus:stack", this.onBonusStack);
    this.client.off("round:new", this.onRoundNew);
    this.client.off("round:end", this.onRoundEnd);
    this.client.off("clear", this.onClear);
    this.client.off("borderless", this.onBorderless);
    this.client.off("end", this.onEnd);
    this.client.off("game:leave", this.onLeave);
    this.client.off("spectate", this.onSpectate);
  }

  /**
   * Attach idle events
   */
  attachIdleEvents() {
    this.client.on("property", this.draw);
    this.client.on("position", this.draw);
    this.client.on("angle", this.draw);
  }

  /**
   * Detach idle events
   */
  detachIdleEvents() {
    this.client.off("property", this.draw);
    this.client.off("position", this.draw);
    this.client.off("angle", this.draw);
  }

  /**
   * Start
   */
  @boundMethod
  start() {
    if (this.parent.room) {
      this.game = this.parent.room.game;
      this.attachEvents();
      this.attachIdleEvents();
    }
  }

  /**
   * Pause
   */
  @boundMethod
  stop() {
    this.detachEvents();
    this.detachIdleEvents();
    this.game = null;
  }

  /**
   * Draw
   */
  @boundMethod
  draw() {
    if (!this.game.frame) {
      this.game.repaint();
    }
  }

  /**
   * On game start
   *
   * @param {Event} e
   */
  @boundMethod
  onGameStart(e: any) {
    this.game.start();
    this.detachIdleEvents();
    this.emit("game:start");
  }

  /**
   * On game stop
   *
   * @param {Event} e
   */
  @boundMethod
  onGameStop(e: any) {
    this.game.stop();
    this.attachIdleEvents();
    this.emit("game:stop");
  }

  /**
   * On property
   *
   * @param {Event} e
   */
  @boundMethod
  onProperty(e: { avatar: number; property: string; value: number }) {
    let avatar = this.game.avatars.getById(e.avatar);

    if (avatar) {
      avatar.set(e.property, e.value);
    }
  }

  /**
   * On position
   *
   * @param {Event} e
   */
  @boundMethod
  onPosition(positions: number[]) {
    var avatar = this.game.avatars.getById(positions[0]);

    if (avatar) {
      avatar.setPositionFromServer(
        this.compressor.decompress(positions[1]),
        this.compressor.decompress(positions[2])
      );
    }
  }

  /**
   * On point
   *
   * @param {Event} e
   */
  @boundMethod
  onPoint(e: { detail: any }) {
    var avatar = this.game.avatars.getById(e.detail);

    if (avatar) {
      avatar.addPoint(avatar.x, avatar.y);
    }
  }

  /**
   * On angle
   *
   * @param {Event} e
   */
  @boundMethod
  onAngle(e: { detail: any[] }) {
    var avatar = this.game.avatars.getById(e.detail[0]);

    if (avatar) {
      avatar.setAngle(this.compressor.decompress(e.detail[1]));
    }
  }

  /**
   * On die
   *
   * @param {Event} e
   */
  @boundMethod
  onDie(e: { detail: any[] }) {
    var avatar = this.game.avatars.getById(e.detail[0]);

    if (avatar) {
      avatar.die();
      this.sound.play("death");
    }
  }

  /**
   * On bonus pop
   *
   * @param {Event} e
   */
  @boundMethod
  onBonusPop(e: { detail: any[] }) {
    var bonus = new MapBonus(
      e.detail[0],
      this.compressor.decompress(e.detail[1]),
      this.compressor.decompress(e.detail[2]),
      e.detail[3]
    );

    this.game.bonusManager.add(bonus);
    this.sound.play("bonus-pop");
  }

  /**
   * On bonus clear
   *
   * @param {Event} e
   */
  @boundMethod
  onBonusClear(e: { detail: any }) {
    var bonus = this.game.bonusManager.bonuses.getById(e.detail);

    if (bonus) {
      this.game.bonusManager.remove(bonus);
      this.sound.play("bonus-clear");
    }
  }

  /**
   * On bonus stack
   *
   * @param {Event} e
   */
  @boundMethod
  onBonusStack(e: { detail: any[] }) {
    var avatar = this.game.avatars.getById(e.detail[0]);

    if (avatar && avatar.local) {
      avatar.bonusStack[e.detail[1]](
        new StackedBonus(e.detail[2], e.detail[3], e.detail[4])
      );
    }
  }

  /**
   * On round new
   *
   * @param {Event} e
   */
  @boundMethod
  onRoundNew(e: any) {
    this.game.newRound();
    this.emit("round:new");
  }

  /**
   * On round new
   *
   * @param {Event} e
   */
  @boundMethod
  onRoundEnd(e: { detail: any }) {
    this.game.endRound();
    this.game.roundWinner = e.detail
      ? this.game.avatars.getById(e.detail)
      : null;
    this.emit("round:end");
  }

  /**
   * On clear
   *
   * @param {Event} e
   */
  @boundMethod
  onClear(e: any) {
    this.game.clearTrails();
  }

  /**
   * On borderless
   *
   * @param {Event} e
   */
  @boundMethod
  onBorderless(e: { detail: any }) {
    this.game.setBorderless(e.detail);
    this.emit("borderless");
  }

  /**
   * On game end
   *
   * @param {Event} e
   */
  @boundMethod
  onEnd(e: any) {
    this.game.end();
    this.sound.play("win");
    this.emit("end");
  }

  /**
   * On leave
   *
   * @param {Event} e
   */
  @boundMethod
  onLeave(e: { detail: any }) {
    var avatar = this.game.avatars.getById(e.detail);

    if (avatar) {
      this.game.removeAvatar(avatar);
    }
  }

  /**
   * On spectate
   */
  @boundMethod
  onSpectate(game: Game) {
    this.game.maxScore = game.maxScore;

    for (var i = this.game.avatars.items.length - 1; i >= 0; i--) {
      this.game.avatars.items[i].local = true;
      this.game.avatars.items[i].ready = true;
    }

    if (game.inRound) {
      if (game.rendered) {
        this.game.newRound(0);
      } else {
        this.game.newRound();
      }
    } else {
      this.game.start();
    }

    this.emit("spectate");
  }
}
