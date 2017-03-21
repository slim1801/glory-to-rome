import { NgModule }      from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';

import { CardImageComponent } from './card/card.image.component';
import { CardFactoryService } from './card/card.factory.service';
import { CardImageService } from './card/card.image.service';
import { CardGroupDirective, ActionColorDirective } from './card/card.group.directive';

import { PlayerInfoService } from './player.info.service';
import { PlayerService } from './player.service';
import { GameService } from './game.service';
import { MessageService } from './message.service';
import { SocketService } from './socket.service';

@NgModule({
  declarations: [
    CardImageComponent,
    CardGroupDirective,
    ActionColorDirective
  ],
  bootstrap: [CardImageComponent],
  imports: [
      BrowserModule,
      HttpModule
  ],
  exports: [
    CardImageComponent,
    CardGroupDirective,
    ActionColorDirective
  ],
  providers: [
    CardFactoryService,
    CardImageService,
    PlayerInfoService,
    PlayerService,
    SocketService,
    GameService,
    MessageService
  ]
})
export class CommonModule { }
