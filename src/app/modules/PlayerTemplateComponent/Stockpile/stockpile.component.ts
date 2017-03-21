import * as _ from 'lodash';

import { Component, ViewChild } from '@angular/core';

import { ICard, eCardEffect, eCardSize, eWorkerType } from '../../../common/card/card';
import { PlayerInfoService } from '../../../common/player.info.service';
import { PlayerService } from '../../../common/player.service';
import { GameService, eActionMode, eLegionaryStage } from '../../../common/game.service';
import { SocketService } from '../../../common/socket.service';

const cardConfig = require('../../../config/card.config.json');

@Component({
    selector: 'stockpile-component',
    template: `
        <div class="stockpile-container" #stockpileContainer>
            <div *ngFor="let card of _playerInfoService.getPlayerState().stockpile; let i = index">
                <div class="stockpile-card-container"
                    (click)="cardClicked(card)"
                    (mouseover)="onMouseOver(card)"
                    (mouseleave)="onMouseLeave(card)"
                    [style.cursor]="cardCanInteract(card) ? 'pointer' : 'auto'">

                        <card-image [card]="card"
                                    [size]="size"
                                    [interactable]="cardCanInteract(card)"
                                    
                                    [cardGroup]="stockpileContainer"
                                    [cardGroupIndex]="i"
                                    [cardGroupLength]="_playerInfoService.getPlayerState().stockpile.length">
                        </card-image>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .stockpile-container {
            flex: 1;
            position: relative;
        }
        .stockpile-card-container {
            position: absolute;
        }
    `]
})
export class StockpileComponent {

    private size = eCardSize.medium;
    private cardWidth: number = cardConfig.sprites.medium.cardWidth;

    constructor(
        private _playerService: PlayerService,
        private _playerInfoService: PlayerInfoService,
        private _gameService: GameService
    ) {
    }

    private _mechantAction(card: ICard) {
        this._playerService.removeFromStockpile(card);
        this._playerService.addToVault([card]);
        this._playerService.decrementActions();
    }

    private _architectAction(card: ICard) {
        this._playerService.removeFromStockpile(card);
        // Stairway condition
        if (this._playerService.activeActionTrigger === eCardEffect.stairway)
            this._playerService.stairwayAction(card);
        else
            this._playerService.addMaterialToConstruction(card);
    }

    private _bridgeAction(card: ICard) {
        let ps = this._playerService;
        ps.addRemoveFromLoot(card);

        if (!ps.hasCardsToLoot(this._playerInfoService.getPlayerState().stockpile)) {
            _.forEach(this._playerInfoService.getPlayerState().loot, card => {
                this._playerService.removeFromStockpile(card);
            })
            ps.extortMaterial();
        }
    }

    cardClicked = (card: ICard) => {
        if(this.cardCanInteract(card)) {
            let mode = this._gameService.gameState.mode;
            // Bridge trigger
            if (
                mode == eWorkerType.legionary &&
                this._gameService.gameState.legionaryStage === eLegionaryStage.bridge
            ) {
                this._bridgeAction(card);
            }
            // Merchant action
            if (mode == eWorkerType.merchant)
                this._mechantAction(card);
            // Architect action
            if (mode == eWorkerType.architect)
                this._architectAction(card);
        }
    }

    cardCanInteract = (card: ICard) => {
        let ps = this._playerService;
        if (!this._playerInfoService.isPlayersTurn) return false;
        if (this._gameService.gameState.actionMode != eActionMode.resolveCardMode) return false;
        if (ps.resolvingCard) return false;
        if (ps.activeActionTrigger === eCardEffect.basilica) return false;

        // Bridge Condition
        if (
            this._gameService.gameState.legionaryStage === eLegionaryStage.bridge &&
            ps.hasTypeToLoot(card.role, this._playerInfoService.getPlayerState().stockpile) &&
            !card.selected
        ) {
            return true;
        }

        // Merchant action
        if (
            this._gameService.gameState.mode == eWorkerType.merchant &&
            this._playerService.canPutIntoVault()
        ) {
            return true;
        }
        else if (this._gameService.gameState.mode == eWorkerType.architect) {
            if (ps.completedSelectedBuilding) {
                return ps.completedSelectedBuilding.building.role === card.role;
            }
            if (ps.selectedBuilding) {
                return this._playerService.cardCanInteractAsMaterial(card);
            }
            return false;
        }
        return false;
    }

    onMouseOver = (card: ICard) => {
        if (this._gameService.gameState.mode == eWorkerType.architect) {
            let player = this._playerService;
            if (player.roadCondition()) {
                player.cardIsHoveredAddMaterial(card);
            }
            else if (player.selectedBuilding && player.selectedBuilding.building.role == card.role) {
                this._playerService.cardIsHoveredAddMaterial(card);
            }
        }
    }
    onMouseLeave = (card: ICard) => {
        this._playerService.cardIsNotHovered(card);
    }
}