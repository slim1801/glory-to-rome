import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [ AppComponent ],
  bootstrap:    [ AppComponent ],
  imports: [
    BrowserModule,
    HttpModule
  ]
})
export class AppModule {}
