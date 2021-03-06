import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HandComponent }   from './hand.component';

import { CardModule } from '../CardComponent/card.module';
import { CardDetailModule } from '../CardDetailComponent/card.detail.module';

@NgModule({
  declarations: [ HandComponent ],
  bootstrap:    [ HandComponent ],
  imports: [
    BrowserModule,

    CardModule,
    CardDetailModule
  ],
  exports: [
      HandComponent
  ]
})
export class HandModule { }
