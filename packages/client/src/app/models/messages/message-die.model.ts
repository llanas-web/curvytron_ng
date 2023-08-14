import { Avatar } from "../avatar.model";
import Message from "./message.model";

export class MessageDie extends Message {
  constructor(
    public deadPlayer: Avatar,
    public killerPlayer: Avatar,
    public old: boolean
  ) {
    super();
    this.type = this.resolveType();
  }

  /**
   * Resolve type
   */
  resolveType() {
    if (!this.killerPlayer) {
      return "wall";
    }

    if (this.deadPlayer.equal(this.killerPlayer)) {
      return "suicide";
    }

    return this.old ? "crash" : "kill";
  }
}
