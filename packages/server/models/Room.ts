import { Collection } from "@shared/collection";
import { BaseRoom } from "@shared/model/BaseRoom";

import { RoomController } from "../controller/RoomController";
import { Game } from "../models/Game";
import { Player } from "../models/Player";
import { RoomConfig } from "../models/RoomConfig";

/**
 * Room
 */
export class Room extends BaseRoom {
  controller: RoomController;

  // OVERRIDE
  declare game: Game;
  declare players: Collection<Player>;
  config: RoomConfig;

  constructor(name: string) {
    super(name);

    this.config = new RoomConfig(this);
    this.controller = new RoomController(this);
  }

  /**
   * Start warmpup
   */
  newGame(): Game | null {
    if (!this.game) {
      this.game = new Game(this);
      this.game.on("end", this.closeGame);
      this.emit("game:new", { room: this, game: this.game });
      return this.game;
    }
    return null;
  }

  /**
   * Close
   */
  close() {
    this.emit("close", { room: this });
  }

  /**
   * Add player
   */
  addPlayer(player: Player) {
    const result = BaseRoom.prototype.addPlayer.call(this, player);
    if (result) {
      this.emit("player:join", { room: this, player });
    }
    return result;
  }

  /**
   * Remove player
   */
  removePlayer(player: Player) {
    const result = BaseRoom.prototype.removePlayer.call(this, player);
    if (result) {
      this.emit("player:leave", { room: this, player });
    }
    return result;
  }
}