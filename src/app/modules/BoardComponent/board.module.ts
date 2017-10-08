import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '../../common/common.module';

import { PoolModule } from '../PoolComponent/pool.module';
import { JackCardsModule } from '../JackCardsComponent/jack.cards.module';
import { ActionCardModule } from '../ActionCardComponent/action.card.module';
import { ControlModule } from '../ControlComponent/control.module';
import { PlayerTemplateModule } from '../PlayerTemplateComponent/player.template.module';

import { BoardComponent } from './board.component';

@NgModule({
  declarations: [
    BoardComponent,
  ],
  bootstrap:    [ BoardComponent ],
  imports: [
    BrowserModule,
    CommonModule,

    ActionCardModule,
    ControlModule,
    JackCardsModule,
    PlayerTemplateModule,
    PoolModule
  ],
  exports: [
      BoardComponent
  ]
})
export class BoardModule { }
