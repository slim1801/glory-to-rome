import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '../../common/common.module';

import { JackCardsModule } from '../JackCardsComponent/jack.cards.module';
import { ActionCardComponent } from './action.card.component';

@NgModule({
  declarations: [ ActionCardComponent ],
  bootstrap:    [ ActionCardComponent ],
  imports: [
    BrowserModule,
    
    CommonModule,
    JackCardsModule
  ],
  exports: [
      ActionCardComponent
  ]
})
export class ActionCardModule { }
