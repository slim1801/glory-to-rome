import { Component } from '@angular/core';

import { ICard, Card, eCardSize, eCardEffect, eWorkerType } from '../../common/card/card';

import { PlayerService } from '../../common/player.service';
import { GameMechanicsService } from '../../common/game.mechanics.service';
import { GameService } from '../../common/game.service'
import { CardFactoryService } from '../../common/card/card.factory.service';
import { PlayerInfoService } from '../../common/player.info.service';

@Component({
    selector: 'action-card-component',
    templateUrl: './action.card.template.html',
    styleUrls: ['./action.card.styles.css']
})
export class ActionCardComponent {

    private size = eCardSize.medium;

    private height;
    private width;
    private jackMenuVisible = false;

    constructor(
        private _cardFactoryService: CardFactoryService,
        private _playerService: PlayerService, 
        private _gameMechanicsService: GameMechanicsService,
        private _gameService: GameService,
        private _playerInfoService: PlayerInfoService
    ) {
        this.width = this._cardFactoryService.getCardWidth(eCardSize.medium) + 'px';
        this._initListeners();
    }

    private _initListeners() {
        let game = this._gameMechanicsService;
        let player = this._playerService;

        game.onCardPerform().subscribe(() => {
            let mode = game.getMode();

            player.activeActionItem = {
                numActions: 0,
                action: mode,
                cardEffect: null
            };

            player.activeActionItem.numActions = 0;
            // Palace condition
            if (this._playerService.hasCompletedBuilding(eCardEffect.palace)) {
                player.activeActionItem.numActions += this._playerInfoService.getPlayerState().additionalActions.length;
            }
            // Storeroom condition
            if (this._storeroomCondition()) {
                player.activeActionItem.numActions += this._playerInfoService.getPlayerState().clientelles.length;
            }
            // Ludus Magna condition
            else if (this._ludusMagnaCondition() && mode != eWorkerType.merchant) {
                player.activeActionItem.numActions += player.getClientelleOfType(mode).length + 
                                    player.getClientelleOfType(eWorkerType.merchant).length;
            }
            else {
                player.activeActionItem.numActions += player.getClientelleOfType(mode).length;
            }
            // Circus Maximus condition
            if (this._playerService.hasCompletedBuilding(eCardEffect.circusMaximus)) {
                player.activeActionItem.numActions = player.activeActionItem.numActions * 2;
            }
            // Bath condition
            if (this._playerService.actionPerformTrigger !== eCardEffect.bath)
                player.activeActionItem.numActions++;
        });

        game.onCardsPlayedAsJack().subscribe(types => {
            this._gameMechanicsService.changeActiveCard(this._cardFactoryService.getJack());
        })
    }

    private _storeroomCondition() {
        return this._gameService.gameState.mode == eWorkerType.laborer &&
                this._playerService.hasCompletedBuilding(eCardEffect.storeroom);
    }

    private _ludusMagnaCondition() {
        return this._playerService.hasCompletedBuilding(eCardEffect.ludusMagna);
    }
}