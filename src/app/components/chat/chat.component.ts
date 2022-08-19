import { Component, OnInit } from '@angular/core';
import MessageMute from 'src/app/models/messages/message-mute.model';
import MessagePlayer from 'src/app/models/messages/message-player.model';
import { ChatService } from 'src/app/services/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  public get messageMaxLength() {
    return MessagePlayer.maxLength;
  }

  public get messages() {
    return this.chatService.messages;
  }

  public get currentMessage() {
    return this.chatService.message;
  }

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.chatService.setElement(document.getElementById('chat-feed'));
  }

  submitTalk() {
    this.chatService.talk()
  }

  mute(message: MessageMute) {
    if (this.chatService.toggleMute(message.client)) {
        this.chatService.addMessage(new MessageMute(message.client, message.player));

    } else {
        this.chatService.removeMessage(message);
    }
  }
}
