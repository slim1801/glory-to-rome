import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '../../common/common.module';

import { MessageComponent } from './message.component';

@NgModule({
    declarations: [ MessageComponent ],
    bootstrap: [ MessageComponent ],
    imports: [
        BrowserModule,
        CommonModule
    ],
    exports: [ MessageComponent ]
})
export class MessageModule { }
