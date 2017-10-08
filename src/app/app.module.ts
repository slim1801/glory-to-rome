import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';

import { ActionCardModule } from './modules/ActionCardComponent/action.card.module';
import { BoardModule } from './modules/BoardComponent/board.module';
import { CardDetailModule } from './modules/CardDetailComponent/card.detail.module';
import { CardModule } from './modules/CardComponent/card.module';
import { ControlModule } from './modules/ControlComponent/control.module';
import { FoundationModule } from './modules/FoundationComponent/foundation.module';
import { HandModule } from './modules/HandComponent/hand.module';
import { LobbyModule } from './modules/LobbyComponent/lobby.module';
import { PlayerTemplateModule } from './modules/PlayerTemplateComponent/player.template.module';

export const AppImports = [
    BrowserModule,
    
    ActionCardModule,
    BoardModule,
    CardDetailModule,
    CardModule,
    ControlModule,
    FoundationModule,
    HandModule,
    LobbyModule,
    PlayerTemplateModule
]

@NgModule({
  declarations: [ AppComponent ],
  bootstrap:    [ AppComponent ],
  imports: AppImports
})
export class AppModule {}
