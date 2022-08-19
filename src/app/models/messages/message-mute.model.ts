import { Player } from "../player.model";
import Message from "./message.model";

export default class MessageMute extends Message {

    
    type = 'mute';
    icon = 'icon-megaphone';
    client: number;
    player: Player;

    constructor(client: number, player: Player) {
        super();

        this.client = client;
        this.player = player;
    }
}
