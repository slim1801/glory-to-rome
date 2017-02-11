import { NgModule }      from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '../../common/common.module';

import { PoolModule } from '../PoolComponent/pool.module';
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
    HttpModule,
    CommonModule,

    ActionCardModule,
    ControlModule,
    PlayerTemplateModule,
    PoolModule
  ],
  exports: [
      BoardComponent
  ]
})
export class BoardModule { }
