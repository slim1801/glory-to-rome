import { NgModule }      from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '../../common/common.module';

import { OutOfTownComponent } from './out.of.town.component';
import { FoundationComponent } from './foundation.component';


@NgModule({
  declarations: [
    FoundationComponent,
    OutOfTownComponent
  ],
  bootstrap:    [ FoundationComponent, OutOfTownComponent ],
  imports: [
    BrowserModule,
    HttpModule,
    CommonModule,

  ],
  exports: [
      FoundationComponent,
      OutOfTownComponent
  ]
})
export class FoundationModule { }