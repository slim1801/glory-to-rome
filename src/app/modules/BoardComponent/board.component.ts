import * as _ from 'lodash';

import { Component } from '@angular/core';

import { ICard, ICompletedFoundation, eCardSize, eCardEffect, eWorkerType, mapMaterialName } from '../../common/card/card';

import { GameService, IGameState, eActionMode } from '../../common/game.service';
import { CardFactoryService } from '../../common/card/card.factory.service';
import { PlayerInfoService, IPlayerState } from '../../common/player.info.service';
import { PlayerService } from '../../common/player.service';
import { SocketService } from '../../common/socket.service';

@Component({
    selector: 'board-component',
    templateUrl: './board.template.html',
    styleUrls: ['./board.styles.css']
})
export class BoardComponent {

    deck: ICard[];
    width: string;
    height: string;
    size = eCardSize.medium;

    //playerStates = [];

    constructor(
        private _cardFactoryService: CardFactoryService,
        private _playerInfoService: PlayerInfoService,
        private _playerService: PlayerService,
        private _gameService: GameService,
        private _socketService: SocketService
    ) {
    }

    private setDialogue() {
        let gState = this._gameService.gameState;
        let romeDemands = gState.romeDemands;
        if (gState.actionMode == eActionMode.resolveCardMode && romeDemands.length > 0) {
            if (!this._playerInfoService.isPlayersTurn) {
                let strRes = _(romeDemands)
                            .map(card => mapMaterialName(card.role))
                            .join(", ");

                return `Rome Demands "${strRes}"`;
            }
        }
    }

    private hasPublicBuilding(pState: IPlayerState) {
        return !!_.find(pState.completed, card => card.stairway);
    }

    private completedLength(completed: ICompletedFoundation[]) {
        return _.filter(completed, comp => !comp.stairway).length;
    }

    private stairwayLength(completed: ICompletedFoundation[]) {
        return _.filter(completed, comp => comp.stairway).length;
    }

    // COMPLETED BUILDING

    private completedCanInteract(card: ICard) {
        let prison = this._playerService.isInActionStack(eCardEffect.prison);
        return  !!(prison && this._playerService.actionFinishTrigger == eCardEffect.prison) ||
                this._stairwayCondition(card);
    }

    private _stairwayCondition(card: ICard) {
        return  this._playerService.activeActionTrigger === eCardEffect.stairway &&
                this._playerService.hasCardTypeInStockpile(card.role)
    }

    completedBuildingClicked(pState: IPlayerState, foundation: ICompletedFoundation) {
        let ps = this._playerService;
        // Prison condition
        let prison = ps.isInActionStack(eCardEffect.prison);
        if (prison) {
            ps.prisonResolved(pState, foundation);
            if (ps.forumCondition(this._playerInfoService.getPlayerState())) {
                this._socketService.endGame();
            }
            else {
                ps.actionStack.pop();
                ps.actionFinished();
            }
            return;
        }
        // Stairway condition
        if (ps.activeActionTrigger === eCardEffect.stairway) {
            this._playerService.completedSelectedBuilding = foundation === this._playerService.completedSelectedBuilding ? null : foundation;
            foundation.building.selected = this._playerService.completedSelectedBuilding === null ? false : true;
        }
    }

}