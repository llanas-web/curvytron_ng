import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { boundMethod } from "autobind-decorator";
import { EventEmitter } from "events";
import { Game } from "src/app/models/game.model";
import { Player } from "src/app/models/player.model";
import { Room } from "src/app/models/room.model";
import { GameRepository } from "src/app/repositories/game.repository";
import { ChatService } from "src/app/services/chat.service";
import { SocketClientService } from "src/app/services/core/socket-client.service";
import { RadioService } from "src/app/services/radio.service";
import { SoundManagerService } from "src/app/services/sound-manager.service";

@Component({
  selector: "app-game",
  templateUrl: "./game.component.html",
  styleUrls: ["./game.component.scss"],
})
export class GameComponent extends EventEmitter implements OnInit {
  static confirmation = "Are you sure you want to leave the game?";

  room: Room = null;
  public game: Game = null;
  assetsLoaded = false;
  setup = false;
  spectateMessage = null;

  get avatars() {
    return this.game.avatars.items;
  }

  constructor(
    private client: SocketClientService,
    private repository: GameRepository,
    private chat: ChatService,
    public radio: RadioService,
    public sound: SoundManagerService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    super();
  }

  ngOnInit(): void {
    document.body.classList.add("game-mode");

    var name = decodeURIComponent(this.route.snapshot.params.name);

    this.repository.start();

    if (!this.repository.game || this.repository.game.name !== name) {
      this.router.navigate([`/room/${encodeURIComponent(name)}`]);
    } else {
      this.loadGame(this.repository.game);
    }
  }

  toggleSound() {
    this.sound.toggle();
  }

  toggleRadio() {
    this.radio.toggle();
  }

  /**
   * Attach socket Events
   */
  attachEvents() {
    // Close on end?
    this.repository.on("spectate", this.onSpectate);
  }

  /**
   * Attach socket Events
   */
  detachEvents() {
    this.repository.off("spectate", this.onSpectate);
  }

  /**
   * Load game
   */
  loadGame(game) {
    // this.offUnload = this.$scope.$on("$locationChangeStart", this.onUnload);
    // this.offDestroy = this.$scope.$on("$destroy", this.onExit);
    window.onbeforeunload = this.onUnload;

    this.game = game;
    this.room = game.room;

    this.game.loadDOM();
    this.game.bonusManager.on("load", this.checkReady);

    // gamepadListener.stop();

    for (var avatar, i = this.game.avatars.items.length - 1; i >= 0; i--) {
      avatar = this.game.avatars.items[i];
      if (avatar.local) {
        avatar.input.on("move", this.onMove);
        avatar.input.on("speeding", this.onSpeeding);
        // if (avatar.input.useGamepad()) {
        //   gamepadListener.start();
        // }
      }
    }

    this.radio.setActive(true);

    this.attachEvents();

    this.repository.on("round:new", this.onFirstRound);

    this.setup = true;
    this.checkReady();
  }

  /**
   * Do we need confirmation before leaving?
   *
   * @return {Boolean}
   */
  needConfirmation() {
    return this.game.started;
  }

  /**
   * Get spectate message
   *
   * @return {Element}
   */
  getSpectateMessage() {
    if (!this.spectateMessage) {
      this.spectateMessage = document.createElement("div");
      this.spectateMessage.className = "spectating";
      this.spectateMessage.innerHTML =
        '<h2><i class="icon-viewer"></i> You are in spectator mode</h2>';
      this.spectateMessage.innerHTML +=
        "<p>You must wait for the game to finish before you can play.</p>";
    }

    return this.spectateMessage;
  }
  /**
   * Close game
   */
  close() {
    if (this.game) {
      this.detachEvents();

      var avatars = this.game.avatars.filter(function () {
        return this.input;
      }).items;

      for (var i = avatars.length - 1; i >= 0; i--) {
        avatars[i].input.off("move", this.onMove);
        avatars[i].input.off("speeding", this.onSpeeding);
      }

      delete this.game;
    }
  }

  @boundMethod
  checkReady() {
    if (this.game.bonusManager.loaded && this.setup) {
      this.game.bonusManager.off("load", this.checkReady);
      this.client.addEvent("ready");
    }
  }

  @boundMethod
  onFirstRound(e) {
    setTimeout(
      function () {
        this.repository.off("round:new", this.onFirstRound);
      }.bind(this),
      0
    );
  }

  @boundMethod
  onMove(e) {
    this.client.addEvent("player:move", {
      avatar: e.avatar.id,
      move: e.move ? e.move : 0,
    });
  }

  @boundMethod
  onSpeeding(e) {
    console.log("speedinge:" + e.speeding);
    this.client.addEvent("player:speeding", {
      avatar: e.avatar.id,
      speeding: e.speeding ? e.speeding : 1,
    });
  }

  @boundMethod
  onSpectate(e) {
    document.getElementById("col-right").appendChild(this.getSpectateMessage());
  }

  @boundMethod
  onExit() {
    if (
      (this.room && this.route.snapshot.params.name !== this.room.getUrl()) ||
      (this.game && this.game.started)
    ) {
      this.repository.parent.leave();
      this.chat.clear();
    }

    window.onbeforeunload = null;

    // this.sound.stop("win");
    // this.offUnload();
    // this.offDestroy();
    this.close();
  }

  @boundMethod
  onUnload(e) {
    if (this.needConfirmation()) {
      if (e.type === "beforeunload") {
        return GameComponent.confirmation;
      } else if (!confirm(GameComponent.confirmation)) {
        return e.preventDefault();
      }
    }
  }

  @boundMethod
  backToRoom() {
    this.router.navigate([this.room.getUrl()]);

    if (!this.room.config.open) {
      this.router.navigate([this.room.getUrl()], {
        queryParams: {
          password: this.room.config.password,
        },
      });
    }
  }

  trackById(index: number, player: Player) {
    return player.id;
  }
}
