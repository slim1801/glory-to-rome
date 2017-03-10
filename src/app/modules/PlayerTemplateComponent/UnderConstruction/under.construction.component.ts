import * as _ from 'lodash';

import { Component, ViewChild, AfterContentInit } from '@angular/core';

import { ICard, IFoundation, Card, eCardSize, eCardEffect, eWorkerType } from '../../../common/card/card';

import { CardFactoryService } from '../../../common/card/card.factory.service';
import { GameMechanicsService } from '../../../common/game.mechanics.service';
import { GameService, removeFromList, eActionMode } from '../../../common/game.service';
import { PlayerService } from '../../../common/player.service';
import { PlayerInfoService } from '../../../common/player.info.service';

@Component({
    selector: 'under-construction-component',
    templateUrl: 'under.construction.component.html',
    styles: [`
        .under-construction-container {
            position: relative;
        }
        .under-construction-card-container {
            position: absolute;
        }
        .material-container {
            position: absolute;
        }
        .behind-container {
            position: relative;
        }
        .front-container {
            position: relative;
            z-index: 1;
        }
        .site-card {
            top: 10px;
            position: absolute;
            z-index: -1;
        }
    `]
})
export class UnderConstructionComponent implements AfterContentInit {

    private phantomCard: IFoundation;
    private size = eCardSize.medium;
    private cardWidth;

    @ViewChild('underConstructionContainer') private spContRef;
    private spContWidth: number;

    constructor(
        private _cardFactoryService: CardFactoryService,
        private _playerService: PlayerService,
        private _playerInfoService: PlayerInfoService,
        private _gameService: GameService,
        private _gameMechanicsService: GameMechanicsService
    ) {
        this.cardWidth = this._cardFactoryService.getCardWidth(eCardSize.medium);
        this._initListeners();
    }

    ngAfterContentInit() {
        this.spContWidth = this.spContRef.nativeElement.offsetWidth;
    }

    private _initListeners() {
        let game = this._gameMechanicsService;

        game.onActionEnd().subscribe(card => {
            this._playerService.selectedBuilding = null;
            this._playerService.removePhantomCard(card);
        });

        let player = this._playerService;

        player.onNewBuildingHover().subscribe(card => {
            this.phantomCard = {
                building: this._createPhantomCard(card),
                site: null,
                materials: []
            }
            this._playerInfoService.getPlayerState().underConstruction.push(this.phantomCard);
        });

        player.onAddMaterialHover().subscribe(card => {
            // #Condition
            let player = this._playerService;

            if (
                player.hasCompletedBuilding(eCardEffect.road) || 
                player.hasCompletedBuilding(eCardEffect.scriptorium) 
            ) {
                this._addPhantomCard(card);
            }
            else if (
                this._playerService.selectedBuilding == null
            )
                return;
            else
                this._addPhantomCard(card);
            
        })

        player.onNotHover().subscribe(card => {

            if (this._playerService.selectedBuilding) {
                removeFromList(card, this._playerService.selectedBuilding.materials);
            }
            this._playerService.removePhantomCard(card);
        });
    }

    private _addPhantomCard(card: ICard) {
        let newCard = this._createPhantomCard(card);
        if (this._playerService.selectedBuilding)
            this._playerService.selectedBuilding.materials.push(newCard);
    }

    private _createPhantomCard(card: ICard) {
        let newCard = new Card();
        newCard.changeValues(card);
        newCard.uid = card.uid;
        newCard.setPhantom(true);
        return newCard;
    }

    cardStyle(index: number) {
        let offset = this.cardWidth + 5;
        let underCo = this._playerInfoService.getPlayerState().underConstruction;
        let numCards = underCo.length;

        let totalOffset = (underCo.length - 1) * offset + this.cardWidth;
        if (totalOffset > this.spContWidth) {
            offset = (this.spContWidth - this.cardWidth) / (numCards - 1);
        }
        return {
            left: (offset * index) + 'px'
        }
    }

    materialStyle(i: number, j: number) {
        let offset = 15;
        let style = this.cardStyle(i);
        return {
            top: (offset * (j + 1)) + 10 + 'px',
            'z-index': (j * -1)
        }
    }

    buildingClicked = (foundation: IFoundation) => {
        if (this._gameService.gameState.mode == null || !this.checkInteraction(foundation)) return;

        if (this._playerService.activeActionTrigger === eCardEffect.fountain) {
            this._playerService.selectedBuilding = foundation;
            this._playerService.addMaterialToConstruction(this._playerService.fountainCard);
            this._playerService.activeActionTrigger = null;
        }
        else {
            this._playerService.buildingSelected(foundation);
        }
    }

    checkInteraction(foundation: IFoundation) {
        if (!this._playerInfoService.isPlayersTurn) return false;
        if (this._gameService.gameState.actionMode !== eActionMode.resolveCardMode) return false;

        // Check if craftsman or architect mode
        let mode = this._gameService.gameState.mode;
        if (mode != eWorkerType.architect && mode != eWorkerType.craftsman) return false;

        if (foundation.building.phantom || mode == null) return false;

        // Archway Condition
        if (
            this._playerService.hasCompletedBuilding(eCardEffect.archway) &&
            this._gameService.hasSameTypeInPool(foundation.site.role)
        ) {
            return true;
        }

        // Fountain Condition
        if (this._playerService.activeActionTrigger === eCardEffect.fountain) {
            return foundation.site.role === this._playerService.fountainCard.role;
        }

        // Road Condition
        if (
            foundation.building.role == eWorkerType.merchant && 
            this._playerService.hasCompletedBuilding(eCardEffect.road)
        ) {
            if (mode == eWorkerType.architect && this._playerInfoService.getPlayerState().stockpile.length == 0) return false;
            return true;
        }

        // Scriptorium Condition
        if (this._playerService.scriptoriumCondition()) {
            return true;
        }

        // Statue Condition
        if (foundation.site !== undefined && this._playerService.statueCondition(foundation)) {
            return true;
        }

        // Tower Condition
        if (this._playerService.hasCompletedBuilding(eCardEffect.tower) &&
            (this._playerService.hasCardTypeInHand(eWorkerType.laborer) ||
             this._playerService.hasCardTypeInStockpile(eWorkerType.laborer))
        ) {
            return true;
        }
        
        return this._canFilter(foundation);
    }

    private _canFilter(foundation: IFoundation) {
        let mode = this._gameService.gameState.mode;
        if (mode == eWorkerType.craftsman) {
            return !!_.find(this._playerService.handCards, card => {
                return card.role == foundation.building.role && !card.phantom;
            });
        }

        if (mode == eWorkerType.architect) {
            return !!_.find(this._playerInfoService.getPlayerState().stockpile, card => {
                return card.role == foundation.building.role &&
                        !card.phantom ||
                        (this._playerService.hasCompletedBuilding(eCardEffect.tower) &&
                        this._playerService.hasCardTypeInStockpile(eWorkerType.laborer));
            });
        }
    }
}