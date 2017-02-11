import { NgModule }      from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '../../common/common.module';

import { ActionCardComponent } from './action.card.component';

@NgModule({
  declarations: [ ActionCardComponent ],
  bootstrap:    [ ActionCardComponent ],
  imports: [
    BrowserModule,
    HttpModule,
    
    CommonModule
  ],
  exports: [
      ActionCardComponent
  ]
})
export class ActionCardModule { }
