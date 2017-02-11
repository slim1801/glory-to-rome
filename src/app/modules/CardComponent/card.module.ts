import { NgModule }      from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '../../common/common.module';

import { CardComponent }   from './card.component';
import { JackMenuComponent }   from './jack.menu.component';
import { CardService } from './card.service';

@NgModule({
  declarations: [ CardComponent, JackMenuComponent ],
  bootstrap:    [ CardComponent ],
  exports: [
      CardComponent,
      JackMenuComponent
  ],
  imports: [
      BrowserModule,
      HttpModule,

      CommonModule
  ],
  providers: [
      CardService
  ]
})
export class CardModule { }
