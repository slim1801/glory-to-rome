import { NgModule }      from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '../../common/common.module';

import { UserStatsModule } from '../UserStatsComponent/user.stats.module';

import { CardDetailComponent }   from './card.detail.component';
import { CardDetailService } from './card.detail.service';

@NgModule({
  declarations: [ CardDetailComponent ],
  bootstrap:    [ CardDetailComponent ],
  exports: [
      CardDetailComponent
  ],
  imports: [
      BrowserModule,
      HttpModule,

      CommonModule,
      UserStatsModule
  ],
  providers: [
      CardDetailService
  ]
})
export class CardDetailModule { }