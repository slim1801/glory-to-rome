import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '../../common/common.module';

import { JackCardsComponent } from './jack.cards.component';

@NgModule({
  declarations: [ JackCardsComponent ],
  bootstrap:    [ JackCardsComponent ],
  imports: [
    BrowserModule,
    
    CommonModule
  ],
  exports: [
      JackCardsComponent
  ]
})
export class JackCardsModule { }
