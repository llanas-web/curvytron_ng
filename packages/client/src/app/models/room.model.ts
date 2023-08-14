import { Collection } from "@shared/collection";
import { BaseRoom } from "@shared/model/BaseRoom";
import { boundMethod } from "autobind-decorator";
import { Game } from "./game.model";

import { Player } from "./player.model";
import RoomConfig from "./room-config.model";

/**
 * Room
 */
export class Room extends BaseRoom {
  // OVERRIDE
  declare players: Collection<Player>;
  declare game: Game;
  declare config: RoomConfig;

  constructor(name: string) {
    super(name);

    this.players = new Collection<Player>([], "id", true);
    this.config = new RoomConfig(this);

    this.players.index = false;
  }

  /**
   * Get local players
   */
  getLocalPlayers(): Collection<Player> {
    return this.players.filter((player) => player.local);
  }

  /**
   * Get player by client Id
   */
  getPlayerByClient(client: string): Player {
    return this.players.match((player) => player.client.id === client);
  }

  /**
   * Get url
   */
  getUrl(): string {
    return "/room/" + encodeURIComponent(this.name);
  }

  /**
   * Get game url
   */
  getGameUrl(): string {
    return "/game/" + encodeURIComponent(this.name);
  }

  /**
   * Close game
   */
  @boundMethod
  closeGame() {
    for (let i = this.players.items.length - 1; i >= 0; i--) {
      if (!this.players.items[i].avatar.present) {
        this.removePlayer(this.players.items[i]);
      }
    }
    return super.closeGame();
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
}
