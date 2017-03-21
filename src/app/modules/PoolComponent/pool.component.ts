import * as _ from 'lodash';

import { AfterContentInit, Component, ViewChild } from '@angular/core';

import { ICard, eCardSize, eCardEffect, eWorkerType } from '../../common/card/card';

import { GameService, eActionMode } from '../../common/game.service';
import { CardDetailService } from '../CardDetailComponent/card.detail.service';
import { CardFactoryService } from '../../common/card/card.factory.service';
import { PlayerInfoService } from '../../common/player.info.service';
import { PlayerService } from '../../common/player.service';
import { SocketService } from '../../common/socket.service';

@Component({
    selector: 'pool-component',
    templateUrl: './pool.template.html',
    styleUrls: ['./pool.styles.css']
})
export class PoolComponent implements AfterContentInit {

    private size = eCardSize.medium;
    private cardWidth;

    @ViewChild('poolContainer') private spContRef;
    private spContWidth: number;

    constructor(
        private _gameService: GameService,
        private _cardDetailService: CardDetailService,
        private _cardFactoryService: CardFactoryService,
        private _playerInfoService: PlayerInfoService,
        private _playerService: PlayerService,
        private _socketService: SocketService
    ) {
        this.cardWidth = this._cardFactoryService.getCardWidth(eCardSize.medium);
    }

    ngAfterContentInit() {
        this.spContWidth = this.spContRef.nativeElement.offsetWidth;
    }

    private _archwayCondition() {
        return this._gameService.gameState.mode == eWorkerType.architect &&
                this._playerService.hasBuildingFunction(eCardEffect.archway);
    }

    private _archwaySelectable(card: ICard) {
        return this._archwayCondition() && this._playerService.selectedBuilding && card.role == this._playerService.selectedBuilding.building.role
    }

    private checkCardsInPool() {
        // If no more in pool, end action immediately
        if (
            this._playerService.activeActionItem && 
            this._gameService.gameState.pool.length == 0
        ) {
            this._playerService.activeActionItem.numActions = 1;
        }
    }

    /* ACTION FUNCTIONS */

    private _patronAction(card: ICard) {
        this.checkCardsInPool();
        if (this._playerService.addToClientelles(card))
            this._playerService.decrementActions();
    }

    private _laborerAction(card: ICard) {
        this.checkCardsInPool();
        this._playerService.addToStockpile(card);
        this._playerService.decrementActions();
    }

    private _legionaryFromPoolAction(card: ICard) {
        this._playerService.legionaryFromPool(card);
    }

    private _architectAction(card: ICard) {
        this._playerService.addMaterialToConstruction(card);
    }

    cardClicked(card: ICard) {
        if (
            this.cardCanInteract(card)
        ) {
            this._gameService.removeFromPool(card);
            this._resolveCardActionContext(card);
        }
    }

    private _resolveCardActionContext(card: ICard) {
        switch(this._gameService.gameState.mode) {
            case eWorkerType.laborer:
                this._laborerAction(card);
                break;
            case eWorkerType.patron:
                this._patronAction(card);
                break;
            case eWorkerType.legionary:
                this._legionaryFromPoolAction(card);
                break;
        }
        if (this._archwayCondition()) {
            this._architectAction(card);
        }
    }
    

    cardStyle(index: number) {
        let offset = 30;
        let poolLength = this._gameService.gameState.pool.length;

        let totalOffset = (poolLength - 1) * offset + this.cardWidth;
        if (totalOffset > this.spContWidth) {
            offset = (this.spContWidth - this.cardWidth) / (poolLength - 1);
        }
        return {
            left: (offset * index) + 'px'
        }
    }

    private _legionaryFromPool(mode: eWorkerType, card: ICard) {
        let rd = this._gameService.gameState.romeDemands;

        return  mode == eWorkerType.legionary && rd && this._playerService.allExtorted
                ? 
                _.find(rd, rCard => rCard.role === card.role) : false;
    }

    private _towerArchwayCondition(card: ICard) {
        return  card.role == eWorkerType.laborer &&
                this._playerService.hasBuildingFunction(eCardEffect.tower) &&
                this._playerService.hasBuildingFunction(eCardEffect.archway) &&
                this._playerService.selectedBuilding
    }

    cardCanInteract = (card: ICard) => {
        if (!this._playerInfoService.isPlayersTurn) return false;
        let mode = this._gameService.gameState.mode;

        if (this._playerService.resolvingCard) return false;

        if (this._playerService.activeActionTrigger == eCardEffect.aqueduct) return false;
        if (this._playerService.activeActionTrigger == eCardEffect.dock) return false;
        
        if (this._gameService.gameState.actionMode == eActionMode.resolveCardMode) {
            // Laboerer condition
            if (mode == eWorkerType.laborer) return true;
            // Patron condition
            if (mode == eWorkerType.patron && this._playerService.canAddToClientelles()) return true;
            // Legionary from pool condition
            if (this._legionaryFromPool(mode, card)) return true;
            // Archway condition
            if (mode == eWorkerType.architect && this._playerService.hasBuildingFunction(eCardEffect.archway)) {
                return this._playerService.cardCanInteractAsMaterial(card);
            }
            return false;
        }
        return false;
    }

    onMouseOver = this._playerService.cardIsHoveredAddMaterial
    onMouseLeave = this._playerService.cardIsNotHovered
}