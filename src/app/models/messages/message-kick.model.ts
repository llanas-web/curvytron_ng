import { Player } from '../player.model';
import Message from './message.model';

export default class MessageKick extends Message {

    type = 'kick';
    icon = 'icon-megaphone';
    target: Player;

    constructor (target: Player) {
        super();

        this.target = target;
    }
}
