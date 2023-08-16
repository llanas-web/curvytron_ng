import { Player } from "../player.model";
import Message from "./message.model";

export default class MessageVoteKick extends Message {
  type = "vote-kick";
  icon = "icon-megaphone";
  target: Player;

  constructor(target: Player) {
    super();

    this.target = target;
  }
}
