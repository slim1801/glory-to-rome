import { Component } from '@angular/core';

import { eCardSize } from '../../../common/card/card';
import { PlayerInfoService } from '../../../common/player.info.service';

@Component({
    selector: 'completed-component',
    template: `
        <div class="completed-container" #completedContainer>
            <div class="completed-cards-container"
                 *ngFor="let compF of _playerInfoService.getPlayerState().completed; let i = index"
                 [size]="size"

                 [cardGroup]="completedContainer"
                 [cardGroupIndex]="i"
                 [cardGroupLength]="_playerInfoService.getPlayerState().completed.length">

                 <completed-card-component [completedFoundation]="compF"></completed-card-component>
            </div>
        </div>
    `,
    styles: [`
        .completed-container {
            flex: 1;
            position: relative;
        }
        .completed-cards-container {
            position: absolute;
        }
    `]
})
export class CompletedComponent {

    private size = eCardSize.medium;

    constructor(
        private _playerInfoService: PlayerInfoService
    ) {
    }
}