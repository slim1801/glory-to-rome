import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '../../common/common.module';

import { ControlComponent } from './control.component';

import { CardModule } from '../CardComponent/card.module';

@NgModule({
  declarations: [ ControlComponent ],
  bootstrap:    [ ControlComponent ],
  imports: [
    BrowserModule,
    
    CardModule,
    CommonModule
  ],
  exports: [
      ControlComponent
  ]
})
export class ControlModule { }
