import { BaseMessage } from '@shared/model/BaseMessage';

export default class Message extends BaseMessage {

    /**
     * Default color
     */
    static color = '#75858c';

    /**
     * Default name
     */
    static messageName = 'Anonymous';

    /**
     * Message max length
     */
    static maxLength = 140;

    id: number;
    creation: Date;
    date: string;
    content = '';
    type = 'default';
    icon = null;

    constructor (creation?: number | Date) {

        super();

        this.id = null;
        this.creation = (typeof creation === 'number') ? new Date(creation) : new Date();
        this.date = this.getDate();
    }

    /**
     * Get date to text
     */
    getDate(): string {
        if (!this.creation) {
            return '';
        }

        let hours = this.creation.getHours().toString();
        let minutes = this.creation.getMinutes().toString();

        if (hours.length === 1) {
            hours = '0' + hours;
        }

        if (minutes.length === 1) {
            minutes = '0' + minutes;
        }

        return hours + ':' + minutes;
    }

}

export interface SerializedMessage {
    
    client: string;
    content: string;
    creation: number,
    name: string;
    color: string;
}
