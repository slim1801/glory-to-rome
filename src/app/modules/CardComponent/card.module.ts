import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '../../common/common.module';

import { CardComponent }   from './card.component';
import { JackMenuComponent }   from './jack.menu.component';

@NgModule({
  declarations: [ CardComponent, JackMenuComponent ],
  bootstrap:    [ CardComponent ],
  exports: [
      CardComponent,
      JackMenuComponent
  ],
  imports: [
      BrowserModule,

      CommonModule
  ]
})
export class CardModule { }
