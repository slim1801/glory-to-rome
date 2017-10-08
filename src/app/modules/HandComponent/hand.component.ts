import * as _ from 'lodash';

import { Component, AfterContentInit, ViewChild } from '@angular/core';

import { GameService } from '../../common/game.service';
import { PlayerService } from '../../common/player.service';

const largeWidth = require('../../config/card.config.json').sprites.large.cardWidth;

@Component({
    selector: 'hand-component',
    templateUrl: './hand.template.html',
    styleUrls: ['./hand.styles.css']
})
export class HandComponent implements AfterContentInit {
    
    maxHandSize = 5;
    handSize = 5;

    @ViewChild('handContainer') private handContainerRef;
    private containerWidth: number;

    constructor(
        private _playerService: PlayerService
    ) {
    }

    cardPosition = (index: number) => {
        let numCards = this._playerService.handCards.length;

        if (numCards <= 1) return;

        if (largeWidth * numCards > this.containerWidth) {
            let offset = (this.containerWidth - largeWidth) / (numCards - 1);
            return {
                left: (offset * index) + 'px'
            }
        }

        return {
            left: (largeWidth * index) + 'px'
        }
    }

    ngAfterContentInit() {
        this.containerWidth = this.handContainerRef.nativeElement.offsetWidth;
    }
}