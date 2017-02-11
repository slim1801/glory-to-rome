import { NgModule }      from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '../../common/common.module';

import { PoolComponent } from './pool.component';
import { PoolService } from './pool.service';

@NgModule({
  declarations: [ PoolComponent ],
  bootstrap:    [ PoolComponent ],
  imports: [
    BrowserModule,
    HttpModule,
    CommonModule
  ],
  exports: [
    PoolComponent
  ],
  providers: [
    PoolService
  ]
})
export class PoolModule { }
