import { findLastIndex } from 'lodash';
import { Component } from '@angular/core';

import { Card, eCardSize, eCardEffect, eWorkerType } from '../../common/card/card';

import { PlayerService } from '../../common/player.service';
import { GameService, eActions } from '../../common/game.service'
import { CardFactoryService } from '../../common/card/card.factory.service';
import { PlayerInfoService } from '../../common/player.info.service';
import { SocketService } from '../../common/socket.service';

@Component({
    selector: 'action-card-component',
    templateUrl: './action.card.template.html',
    styleUrls: ['./action.card.styles.css']
})
export class ActionCardComponent {

    private size = eCardSize.medium;

    constructor(
        private _playerService: PlayerService, 
        private _gameService: GameService,
        private _playerInfoService: PlayerInfoService,
        private _socketService: SocketService
    ) {
        this._initListeners();
    }

    private _initListeners() {
        let player = this._playerService;

        this._socketService.onAllPlayersChosen().subscribe(() => {
            let gState = this._gameService.gameState;
            let pState = this._playerInfoService.getPlayerState();

            let index = findLastIndex(gState.playerOrder, player => player.id == this._playerInfoService.player.id);
            if (
                pState.action === eActions.think &&
                !this._playerService.hasClientelleType(gState.mode)
            ) return;

            let mode = gState.mode;

            player.activeActionItem = {
                numActions: 0,
                action: mode,
                cardEffect: null
            };

            player.activeActionItem.numActions = 0;
            // Palace condition
            if (this._playerService.hasBuildingFunction(eCardEffect.palace)) {
                player.activeActionItem.numActions += pState.additionalActions.length;
            }
            // Storeroom condition
            if (this._storeroomCondition()) {
                player.activeActionItem.numActions += pState.clientelles.length;
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
            if (this._playerService.hasBuildingFunction(eCardEffect.circusMaximus)) {
                player.activeActionItem.numActions = player.activeActionItem.numActions * 2;
            }
            // Bath condition
            if (this._playerService.actionPerformTrigger !== eCardEffect.bath) {
                if (pState.action !== eActions.think)
                    player.activeActionItem.numActions++;
            }
        });
    }

    private _storeroomCondition() {
        return this._gameService.gameState.mode == eWorkerType.laborer &&
                this._playerService.hasBuildingFunction(eCardEffect.storeroom);
    }

    private _ludusMagnaCondition() {
        return this._playerService.hasBuildingFunction(eCardEffect.ludusMagna);
    }
}