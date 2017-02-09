import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';

import { LobbyModule } from './modules/LobbyComponent/lobby.module';

@NgModule({
  declarations: [ AppComponent ],
  bootstrap:    [ AppComponent ],
  imports: [
    BrowserModule,
    HttpModule,

    LobbyModule,
  ]
})
export class AppModule {}
