import { NgModule }      from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';

import { CardImageComponent } from './card/card.image.component';
import { CardFactoryService } from './card/card.factory.service';
import { CardImageService } from './card/card.image.service';
import { CardGroupDirective } from './card/card.group.directive';

import { GameMechanicsService } from './game.mechanics.service';
import { PlayerInfoService } from './player.info.service';
import { PlayerService } from './player.service';
import { GameService } from './game.service';
import { SocketService } from './socket.service';

@NgModule({
  declarations: [
    CardImageComponent,
    CardGroupDirective
  ],
  bootstrap: [CardImageComponent],
  imports: [
      BrowserModule,
      HttpModule
  ],
  exports: [
    CardImageComponent,
    CardGroupDirective
  ],
  providers: [
    CardFactoryService,
    CardImageService,
    GameMechanicsService,
    PlayerInfoService,
    PlayerService,
    SocketService,
    GameService
  ]
})
export class CommonModule { }
