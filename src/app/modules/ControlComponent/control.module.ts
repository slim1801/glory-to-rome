import { NgModule }      from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '../../common/common.module';

import { ControlComponent } from './control.component';

import { CardModule } from '../CardComponent/card.module';

@NgModule({
  declarations: [ ControlComponent ],
  bootstrap:    [ ControlComponent ],
  imports: [
    BrowserModule,
    HttpModule,
    
    CardModule,
    CommonModule
  ],
  exports: [
      ControlComponent
  ]
})
export class ControlModule { }
