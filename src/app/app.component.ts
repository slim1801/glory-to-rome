import { Component } from '@angular/core';

@Component({
    selector: 'my-app',
    templateUrl: './app.template.html',
    styleUrls: ['./app.styles.css']
})
export class AppComponent {

    gameStarted = false;
    gameEnded = false;

    constructor(
    ) {
    }
}
