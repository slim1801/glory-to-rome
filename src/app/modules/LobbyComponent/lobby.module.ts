import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '../../common/common.module';

import { LobbyComponent } from './lobby.component';

export const LobbyImports = [
    BrowserModule,
    FormsModule,
    CommonModule
]

@NgModule({
  declarations: [ LobbyComponent ],
  bootstrap:    [ LobbyComponent ],
  imports: LobbyImports,
  exports: [
    LobbyComponent
  ]
})
export class LobbyModule { }
