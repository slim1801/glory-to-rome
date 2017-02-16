import * as _ from 'lodash';

import { Component } from '@angular/core';

import { ICard, IFoundationPile, eCardEffect, eCardSize, eWorkerType } from '../../common/card/card';
import { CardFactoryService } from '../../common/card/card.factory.service';
import { ICustomCardSize } from '../../common/card/card.image.component';

import { GameService } from '../../common/game.service';
import { GameMechanicsService } from '../../common/game.mechanics.service';
import { PlayerService } from '../../common/player.service';

@Component({
    selector: 'foundation-component',
    template: `
        <div class="foundation-container">
            <div
                class="foundation-card"
                *ngFor="let pile of _gameService.gameState.foundations; let i = index"
                (click)="onFoundationClick(pile)">
                
                    <div
                        class="out-of-town-image"
                        *ngIf="pile.inTown == 0"
                        [ngStyle]="outOfTownStyle">
                        <out-of-town-component
                            [role]="pile.foundation.role">
                        </out-of-town-component>
                    </div>

                    <card-image *ngIf="pile.inTown > 0"
                                [card]="pile.foundation"
                                [size]="size"
                                [customSize]="customSize"
                                [interactable]="enableFoundation()">
                    </card-image>

                    <div class="in-town-count" *ngIf="pile.inTown > 0">
                        {{pile.inTown}}
                    </div>

                    <div class="out-town-count" *ngIf="pile.inTown == 0">
                        {{pile.outOfTown}}
                    </div>
            </div>
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
        private _gameMechanicsService: GameMechanicsService,
        private _gameService: GameService
    ) {
        this._init();
        this._initListeners();
    }

    private _init() {
         _.forEach(this._cardFactoryService.foundationCards, foundation => {
             let f = {
                foundation,
                inTown: this._gameService.players,
                outOfTown: this._cardFactoryService.getCardByName(foundation.title).count - this._gameService.players
            };
            this._gameService.gameState.foundations.push(f);
            this._gameService.foundationMap[foundation.role] = f;
         });

         this.outOfTownStyle = {
             width: this.customSize.width + 'px',
             height: this.customSize.height + 'px'
         }
    }

    private _initListeners() {
        this._playerService.onNewBuilding().subscribe(card => {
            if (card.id != eCardEffect.statue) {
                this.useFoundation(card);
            }
        })
    }

    private useFoundation(card: ICard) {
        let gState = this._gameService.gameState;
        let foundation = _.find(gState.foundations, f => f.foundation.role == card.role);

        if (foundation.inTown > 0) {
            foundation.inTown = foundation.inTown - 1;
        }
        else if (foundation.outOfTown > 0) {
            foundation.outOfTown = foundation.outOfTown - 1;
        }
    }

    onFoundationClick = (pile: IFoundationPile) => {
        if (this.enableFoundation()) {
            this.useFoundation(pile.foundation);
            this._playerService.foundationChosen(pile);
        }
    }

    enableFoundation = () => {
        return this._playerService.actionPerformTrigger == eCardEffect.statue;
    }
}