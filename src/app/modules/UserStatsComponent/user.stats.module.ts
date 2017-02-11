import { NgModule }      from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '../../common/common.module';

import { UserStatsComponent } from './user.stats.component';

@NgModule({
    declarations: [ UserStatsComponent ],
    bootstrap:    [ UserStatsComponent ],
    imports: [
        BrowserModule,
        HttpModule,
        CommonModule
    ],
    exports: [
        UserStatsComponent
    ]
})
export class UserStatsModule { }
