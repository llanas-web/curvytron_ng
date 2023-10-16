import { Collection } from "@shared/collection";

import { Player } from "./player.model";

/**
 * Distant client
 */
export class Client {
  players = new Collection<Player>();
  master = false;

  constructor(public id: string | number, public active = true) {}

  /**
   * Set master
   */
  setMaster(master: boolean) {
    this.master = master;
  }
}
