import { Component } from '@angular/core';

import { ICard, eCardSize } from '../../../common/card/card';
import { PlayerService } from '../../../common/player.service';
import { PlayerInfoService } from '../../../common/player.info.service';
const cardConfig = require('../../../config/card.config.json');

@Component({
    selector: 'completed-component',
    template: `
        <div class="completed-container" #completedContainer>
            <div *ngFor="let compF of _playerInfoService.getPlayerState().completed; let i = index">
                <card-image class="completed-card-container"
                            [card]="compF.building"
                            [size]="size"

                            [cardGroup]="completedContainer"
                            [cardGroupIndex]="i"
                            [cardGroupLength]="_playerInfoService.getPlayerState().completed.length">
                </card-image>
            </div>
        </div>
    `,
    styles: [`
        .completed-container {
            flex: 1;
            position: relative;
        }
        .completed-card-container {
            position: absolute;
        }
    `]
})
export class CompletedComponent {

    private size = eCardSize.medium;

    constructor(
        private _playerService: PlayerService,
        private _playerInfoService: PlayerInfoService
    ) {
    }
}