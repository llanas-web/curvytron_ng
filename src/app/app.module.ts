import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { ProfileComponent } from "./components/profile/profile.component";
import { RoomComponent } from "./components/room/room.component";
import { RoomsComponent } from "./components/rooms/rooms.component";
import { LinkComponent } from "./components/profile/link/link.component";
import { ChatComponent } from "./components/chat/chat.component";
import { GameComponent } from "./components/game/game.component";
import { KillLogComponent } from "./components/game/kill-log/kill-log.component";
import { WaitingComponent } from "./components/game/waiting/waiting.component";
import { PlayerListComponent } from './components/game/player-list/player-list.component';
import { MetricComponent } from './components/game/metric/metric.component';
import { RoundComponent } from './components/game/round/round.component';

@NgModule({
  declarations: [
    AppComponent,
    ProfileComponent,
    RoomsComponent,
    RoomComponent,
    LinkComponent,
    ChatComponent,
    GameComponent,
    KillLogComponent,
    WaitingComponent,
    PlayerListComponent,
    MetricComponent,
    RoundComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
