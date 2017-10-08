import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '../../common/common.module';

import { PoolComponent } from './pool.component';
import { PoolService } from './pool.service';

@NgModule({
  declarations: [ PoolComponent ],
  bootstrap:    [ PoolComponent ],
  imports: [
    BrowserModule,
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
