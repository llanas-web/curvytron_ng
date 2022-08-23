import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { GameComponent } from "./components/game/game.component";

import { RoomComponent } from "./components/room/room.component";
import { RoomsComponent } from "./components/rooms/rooms.component";

const routes: Routes = [
  { path: "", component: RoomsComponent },
  { path: "room/:name", component: RoomComponent },
  { path: "game/:name", component: GameComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
