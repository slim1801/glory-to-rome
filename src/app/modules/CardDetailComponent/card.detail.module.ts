import { NgModule }      from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '../../common/common.module';

import { UserStatsModule } from '../UserStatsComponent/user.stats.module';

import { CardDetailComponent }   from './card.detail.component';
import { CardDetailService } from './card.detail.service';
import { FoundationModule } from '../FoundationComponent/foundation.module';

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
      FoundationModule,
      UserStatsModule
  ],
  providers: [
      CardDetailService
  ]
})
export class CardDetailModule { }