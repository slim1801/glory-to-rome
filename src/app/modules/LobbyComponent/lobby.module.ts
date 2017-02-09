import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '../../common/common.module';

import { LobbyComponent } from './lobby.component';
import { LobbyService } from './lobby.service';

@NgModule({
  declarations: [ LobbyComponent ],
  bootstrap:    [ LobbyComponent ],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    CommonModule
  ],
  exports: [
    LobbyComponent
  ],
  providers: [
    LobbyService
  ]
})
export class LobbyModule { }
