import * as _ from 'lodash';

import { Component } from '@angular/core';

import { ICard, IFoundationPile, eCardEffect, eCardSize, eWorkerType } from '../../common/card/card';
import { CardFactoryService } from '../../common/card/card.factory.service';
import { ICustomCardSize } from '../../common/card/card.image.component';

import { GameService } from '../../common/game.service';
import { PlayerService } from '../../common/player.service';

@Component({
    selector: 'foundation-component',
    template: `
        <div
            class="foundation-card"
            *ngFor="let pile of _gameService.gameState.foundations; let i = index"
            (click)="onFoundationClick(pile)">

                <div
                    class="out-of-town-image"
                    *ngIf="pile.inTown.length === 0"
                    [ngStyle]="outOfTownStyle">
                    <out-of-town-component
                        [role]="pile.outOfTown[0].role">
                    </out-of-town-component>
                </div>
            
                <div class="in-town-count" *ngIf="pile.inTown.length > 0">
                    {{pile.inTown.length}}
                </div>

                <div class="out-town-count" *ngIf="pile.inTown.length == 0">
                    {{pile.outOfTown.length}}
                </div>

                <card-image *ngIf="pile.inTown.length > 0"
                            [card]="pile.inTown[0]"
                            [size]="size"
                            [customSize]="customSize"
                            [interactable]="enableFoundation(pile.inTown[0])">
                </card-image>
        </div>
    `,
    styleUrls: ['./foundation.styles.css']
})
export class FoundationComponent {

    private size = eCardSize.medium;
    private customSize: ICustomCardSize = {
        width: 70,
        height: 52,
        offsetX: 12,
        offsetY: 25
    }
    private outOfTownStyle;

    constructor(
        private _cardFactoryService: CardFactoryService,
        private _playerService: PlayerService,
        private _gameService: GameService
    ) {
        this._init();
        this._initListeners();
    }

    private _init() {
         this.outOfTownStyle = {
             width: this.customSize.width + 'px',
             height: this.customSize.height + 'px'
         }
    }

    private _initListeners() {
        this._playerService.onNewBuilding().subscribe(card => {
            if (card.id != eCardEffect.statue) {
                this.useFoundation(card.role);
            }
        })
    }

    private useFoundation(role: eWorkerType) {
        let gState = this._gameService.gameState;
        let foundation = _.find(gState.foundations, f => f.role == role);

        if (foundation.inTown.length > 0) {
            foundation.inTown.splice(0, 1);
        }
        else if (foundation.outOfTown.length > 0) {
            foundation.outOfTown.splice(0, 1);
        }
    }

    onFoundationClick = (pile: IFoundationPile) => {
        if (this.enableFoundation()) {
            this.useFoundation(pile.role);
            this._playerService.foundationChosen(pile);
        }
    }

    enableFoundation = () => {
        return  this._playerService.actionPerformTrigger == eCardEffect.statue &&
                this._playerService.canAddNewBuilding(eCardEffect.statue);
    }
}