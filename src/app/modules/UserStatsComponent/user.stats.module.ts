import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '../../common/common.module';

import { UserStatsComponent } from './user.stats.component';

@NgModule({
    declarations: [ UserStatsComponent ],
    bootstrap:    [ UserStatsComponent ],
    imports: [
        BrowserModule,
        CommonModule
    ],
    exports: [
        UserStatsComponent
    ]
})
export class UserStatsModule { }
