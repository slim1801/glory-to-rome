import { Component, Input } from '@angular/core';

import { eCardSize } from '../../common/card/card';
import { PlayerService } from '../../common/player.service';
import { PlayerInfoService } from '../../common/player.info.service';

@Component({
    selector: 'jack-cards-component',
    template: `
        <div class="jack-cards-container" *ngIf="jackCardsVisible()">
            <div *ngFor="let jackCard of player.jackCards; let i = index"
                class="action-cards-as-jack"
                [ngStyle]="jackCardStyle(i)">
                <card-image [card]="jackCard" [size]="size"></card-image>
            </div>
        </div>
    `,
    styles: [`
        .jack-cards-container {
            position: absolute;
            height: 100%;
            width: 100%;
            top: 0px;
        }
        .action-cards-as-jack {
            position: absolute;
        }
    `]
})
export class JackCardsComponent {

    size = eCardSize.medium;

    @Input('player') private player;

    constructor(
        private _playerService: PlayerService,
        private _playerInfoService: PlayerInfoService
    ){
    }

    jackCardsVisible() {
        let jackCards = this.player.jackCards;
        return jackCards && jackCards.length === this.player.cardsForJack;
    }

    jackCardStyle(index) {
        let len = this.player.jackCards.length;
        return {
            top: 123.8 - ((len - index - 1) * 20 + 20) + "px"
        }
    }
}