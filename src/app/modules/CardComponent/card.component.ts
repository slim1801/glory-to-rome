import * as _ from 'lodash';

import { Component, HostListener, Input, Output } from '@angular/core';
import {
  trigger,
  state,
  style,
  transition,
  animate,
  AnimationTransitionEvent
} from '@angular/core';

import { ICard, eCardSize, eCardEffect, eWorkerType } from '../../common/card/card';

import { CardFactoryService } from '../../common/card/card.factory.service';
import { GameMechanicsService } from '../../common/game.mechanics.service';
import { GameService, eActionMode, eLegionaryStage, removeFromList, eActions } from '../../common/game.service';
import { PlayerService } from '../../common/player.service';
import { PlayerInfoService } from '../../common/player.info.service';
import { SocketService } from '../../common/socket.service';
import { MessageService } from '../../common/message.service';

@Component({
    selector: 'card-component',
    templateUrl: './card.template.html',
    styleUrls: ['./card.styles.css'],
    animations: [
        trigger('hover', [
            state('dormant', style({transform: 'translate(0, 0%)'})),
            state('active', style({transform: 'translate(0, -50%)'}))
        ])
    ]
})
export class CardComponent {

    size = eCardSize.large;

    @Input('card') private card: ICard;

    private height: string;
    private width: string;

    private _hoverState = "dormant";

    constructor(
        private _cardFactoryService: CardFactoryService,
        private _gameMechanicsService: GameMechanicsService,
        private _gameService: GameService,
        private _playerService: PlayerService,
        private _playerInfoService: PlayerInfoService,
        private _socketService: SocketService,
        private _messageService: MessageService
    ) {
        this.height = (this._cardFactoryService.getCardHeight(eCardSize.large) / 2) + 'px';
        this.width = this._cardFactoryService.getCardWidth(eCardSize.large) + 'px';
        this._initListeners();
    }

    private _initListeners() {

        let game = this._gameMechanicsService;
        let player = this._playerService;

        // this._socketService.onAllPlayersChosen().subscribe(this._enableActions);
        // player.onActionFinished().subscribe(this._enableActions);

        game.onPlayCardsAsJack().subscribe(types => {
            // this._cardAction = this._playCardsAsJack
        })

        game.onActionEnd().subscribe(card => {
            // this._cardAction = this._playCard;

            this.card.selected = false;
            this._hoverState = "dormant";
        });

        // player.onBuildingCompleted().subscribe(card => {
        //     switch(card.id) {
        //         case eCardEffect.amphitheatre:
        //             this._cardAction = this._newBuildingClicked;
        //             break;
        //     }
        // });

        // player.onBuildingSelected().subscribe(() => {
        //     let mode = this._gameService.gameState.mode;

        //     if (mode == eWorkerType.craftsman) {
        //         if (this._playerService.selectedBuilding == null) {
        //             this._cardAction = this._newBuildingClicked;
        //         }
        //         // Road condition
        //         else if (
        //             player.roadCondition() ||
        //             this.card.role == eWorkerType.laborer && player.hasCompletedBuilding(eCardEffect.tower)
        //         ) {
        //             if (this._playerService.selectedBuilding) {
        //                 this._cardAction = this._addMaterial;
        //             }
        //             else {
        //                 this._cardAction = this._newBuildingClicked;
        //             }
        //         }
        //         // Scriptorium condition
        //         else if (
        //             this.card.role == eWorkerType.patron &&
        //             player.hasCompletedBuilding(eCardEffect.scriptorium)
        //         ) {
        //             this._cardAction = this._addMaterial
        //         }
        //         // Normal condition
        //         else {
        //             this._cardAction = this._addMaterial
        //         }
        //     }
        // });

        // player.onLatrineTriggered().subscribe(() => {
        //     this._cardAction = this._discardToPool
        // });

        // player.onPalaceResolved().subscribe(() => {
        //     this._cardAction = this._palaceAction
        // });

        // this._socketService.onRomeDemands().subscribe(gameState => {
        //     this._cardAction = this._extortMaterial;
        // });

        // this._cardAction = this._playCard;
    }

    // private _enableActions = () => {

    //         let player = this._playerService;

    //         let mode = this._gameService.gameState.mode;
    //         // Craftsman, Architect and Legionary actions
    //         if (
    //             mode == eWorkerType.craftsman ||
    //             mode == eWorkerType.architect || 
    //             mode == eWorkerType.legionary
    //         ) {
    //             if (
    //                 player.activeActionItem &&
    //                 this.card.role != eWorkerType.jack &&
    //                 this._playerService.canAddNewBuilding(this.card.id)
    //             ) {
    //                 this._cardAction = mode === eWorkerType.legionary ? this._romeDemands : this._newBuildingClicked;
    //             }
    //         }

    //         // Aqueduct Condition
    //         if (mode == eWorkerType.patron && player.hasCompletedBuilding(eCardEffect.aqueduct)) {
    //             this._cardAction = this._addClientelle;
    //         }
    //         // Basilica Condition
    //         if (mode == eWorkerType.merchant && player.hasCompletedBuilding(eCardEffect.basilica)) {
    //             this._cardAction = this._addToVault;
    //         }
    //         // Dock Condition
    //         if (mode == eWorkerType.laborer && player.hasCompletedBuilding(eCardEffect.dock)) {
    //             this._cardAction = this._addToStockpile;
    //         }
    // }

    @HostListener('mouseover')
    onMouseOver(event: MouseEvent) {
        if (!this.modeEnable()) return;
        this._hoverState = "active";

        let role = this._gameService.gameState.mode;
        let player = this._playerService;

        if (this._gameService.gameState.actionMode === eActionMode.resolveCardMode) {
            if (role == eWorkerType.craftsman && this.card.role != eWorkerType.jack) {
                if (player.selectedBuilding) {
                    player.cardIsHoveredAddMaterial(this.card);
                }
                else {
                    player.cardIsHoveredNewBuilding(this.card);
                }
            }
            else if (role == eWorkerType.architect) {
                player.cardIsHoveredNewBuilding(this.card);
            }
        }
    }

    @HostListener('mouseleave')
    onMouseLeave(event: MouseEvent) {
        this._hoverState = "dormant";

        let mode = this._gameService.gameState.mode;
        if (this._gameService.gameState.actionMode === eActionMode.resolveCardMode) {
            if (mode == eWorkerType.craftsman || mode == eWorkerType.architect) {

                if (this.card.role != eWorkerType.jack)
                    this._playerService.cardIsNotHovered(this.card);
            }
        }
    }

    optionClicked = (wType: eWorkerType) => {
        this.card.setMode(wType);
        this._gameService.gameState.mode = wType;
        this._playerService.playCard(this.card);
    }

    private cardJustPlayed: ICard[] = null;

    cardClicked = () => {
        if (this.modeEnable()) {
            if (this.card.role != eWorkerType.jack) {
                
                let player = this._playerService;
                
                if (player.typesForJack && !this.card.selected) {
                    player.selectCardAsJack(this.card);
                    this.card.selected = true;
                }
                else if (player.typesForJack && this.card.selected) {
                    player.deselectCardAsJack(this.card);
                    this.card.selected = false;
                }
                else {
                    this._executeCardAction();
                }
            }
            else if (this._playerService.activeActionTrigger == eCardEffect.latrine) {
                this._playerService.removeFromHand(this.card);
                this._gameService.addJack();
                this._playerService.thinkAction();
            }
            else if (this.card.role === eWorkerType.jack && this._playerInfoService.isFollowing) {
                this.card.setMode(this._gameService.gameState.mode);
                this._playerInfoService.getPlayerState().action = eActions.playCard;

                this._playerService.playCard(this.card);
            }
        }
    }

    private _executeCardAction() {
        let gState = this._gameService.gameState;
        let player = this._playerService;

        // Latrine condition
        if (this._playerService.activeActionTrigger === eCardEffect.latrine) {
            this._discardToPool();
        }
        // Palace condition
        else if(this._playerService.activeActionTrigger === eCardEffect.palace) {
            this._palaceAction();
        }
        // Rome demands condition
        else if (gState.legionaryStage === eLegionaryStage.romeDemanding) {
            this._extortMaterial();
        }
        else if (gState.actionMode === eActionMode.actionCardMode) {
            if (player.jackTypeSelected !== null) {
                this._playCardsAsJack();
            }
            else {
                this._playCard();
            }
        }
        else if (gState.actionMode === eActionMode.resolveCardMode) {
            if (player.selectedBuilding === null) {
                let mode = gState.mode;
                // Craftsman, Architect and Legionary actions
                if (
                    mode == eWorkerType.craftsman ||
                    mode == eWorkerType.architect || 
                    mode == eWorkerType.legionary
                ) {
                    if (
                        player.activeActionItem &&
                        this.card.role != eWorkerType.jack &&
                        this._playerService.canAddNewBuilding(this.card.id)
                    ) {
                        if (mode === eWorkerType.legionary)
                            this._romeDemands()
                        else
                            this._newBuildingClicked();
                    }
                }

                // Aqueduct Condition
                if (mode == eWorkerType.patron && player.hasCompletedBuilding(eCardEffect.aqueduct))
                    this._addClientelle();
                // Basilica Condition
                if (mode == eWorkerType.merchant && player.hasCompletedBuilding(eCardEffect.basilica))
                    this._addToVault();
                // Dock Condition
                if (mode == eWorkerType.laborer && player.hasCompletedBuilding(eCardEffect.dock))
                    this._addToStockpile();
            }
            // BUILDING SELECTED
            else {
                let mode = this._gameService.gameState.mode;

                if (mode == eWorkerType.craftsman) {
                    if (
                        player.roadCondition() ||
                        this.card.role == eWorkerType.laborer && player.hasCompletedBuilding(eCardEffect.tower)
                    ) {
                        this._addMaterial();
                    }
                    // Scriptorium condition
                    else if (
                        this.card.role == eWorkerType.patron &&
                        player.hasCompletedBuilding(eCardEffect.scriptorium)
                    ) {
                        this._addMaterial();
                    }
                    // Normal condition
                    else {
                        this._addMaterial();
                    }
                }
            }
        }
    }

    private _playCard() {
        if (this.card.role === eWorkerType.jack) return;
        this._playerService.playCard(this.card);
    }

    private _romeDemands() {
        let demanded = this._gameService.gameState.romeDemands;
        let activeAction = this._playerService.activeActionItem;
        
        if (!!_.find(demanded, card => card.uid == this.card.uid)) {
            this.card.selected = false;
            activeAction.numActions++;
            _.remove(demanded, card => card.uid == this.card.uid);
        }
        else {
            this.card.selected = true;
            activeAction.numActions--;
            demanded.push(this.card);
        }

        if (
            activeAction.numActions == 0 ||
            demanded.length === _.filter(this._playerService.handCards, card => card.role !== eWorkerType.jack).length
        ) {
            this._playerService.romeDemands();
        }
    }

    private _extortMaterial() {
        this._playerService.addRemoveFromLoot(this.card);

        if (!this._playerService.hasCardsToLoot(this._playerService.handCards)) {
            _.forEach(this._playerInfoService.getPlayerState().loot, card => {
                this._playerService.removeFromHand(card);
            })
            this._playerService.extortMaterial();
        }
    }

    private _addMaterial() {
        this._playerService.addMaterialToConstruction(this.card);
    }

    private _addClientelle() {
        this._playerService.removeFromHand(this.card);
        if (this._playerService.addToClientelles(this.card))
            this._playerService.inAddition();
    }

    private _addToVault() {
        this._playerService.removeFromHand(this.card);
        this._playerService.addToVault([this.card]);
        this._playerService.inAddition();
    }

    private _addToStockpile() {
        this._playerService.removeFromHand(this.card);
        this._playerService.addToStockpile(this.card);
        this._playerService.inAddition();
    }

    private _discardToPool() {
        this._playerService.removeFromHand(this.card);
        this._messageService.discardMessage([this.card]);
        
        if (this.card.role == eWorkerType.jack) {
            this._gameService.addJack();
        }
        else {
            this._gameService.addToPool([this.card]);
        }
        this._playerService.thinkAction();
    }

    private _playCardsAsJack() {
        let jack = this._cardFactoryService.getJack();
        this._playerService.playCard(jack);
    }

    _newBuildingClicked = () => {
        this._playerService.addToUnderConstruction(this.card);

        // Remove card from hand
        this._playerService.removeFromHand(this.card);
    }

    jackMenuVisible() {
        if (this._hoverState == "active") {
            if (
                this._gameService.gameState.actionMode == eActionMode.actionCardMode &&
                this._playerInfoService.isFollowing
            )
            return false;

            if (
                this.card.role == eWorkerType.jack && 
                this._playerService.activeActionTrigger !== eCardEffect.latrine
            ) {
                return true;
            }
        }
        return false;
    }

    private _palaceAction() {
        this._playerService.addAdditionalAction(this.card);
    }

    modeEnable = () => {
        let gState = this._gameService.gameState;
        let mode = gState.actionMode;

        if (this._playerInfoService.isPlayersTurn) {

            if (this._playerService.resolvingCard) return false;

            if (
                this._playerService.activeActionTrigger == eCardEffect.latrine &&
                this.card.role != eWorkerType.jack
            ) return true;

            if (mode == eActionMode.actionCardMode) {

                if (this._playerService.typesForJack != null) {
                    return !!_.includes(this._playerService.typesForJack, this.card.role);
                }

                if (
                    this._playerService.hasCompletedBuilding(eCardEffect.palace) &&
                    this._playerService.actionPerformTrigger == eCardEffect.palace &&
                    !this._playerService.resolvingCard
                ) {
                    let actCard = this._playerInfoService.getPlayerState().actionCard;
                    return  this.card.role == actCard.role ||
                            actCard.role == eWorkerType.jack && actCard.mode == this.card.role ||
                            !!(this.card.role == eWorkerType.jack);
                }
                
                // On following activate cards
                if (this._playerInfoService.isFollowing) {
                    if (this.card.role == eWorkerType.jack ||
                        this.card.role == gState.mode) {
                        return true;
                    }
                    return false;
                }
                return !!this._playerInfoService.isPlayersLead;
            }
            else if (mode == eActionMode.resolveCardMode) {
                let role = gState.mode;

                if (this.card.role == eWorkerType.jack) return false;
                if (this._playerService.actionFinishTrigger == eCardEffect.prison) return false;
                if (this._playerService.activeActionTrigger == eCardEffect.fountain) return false;

                // Laborer conditions
                if (role == eWorkerType.laborer) {
                    if (this._playerService.activeActionTrigger == eCardEffect.dock)
                        return true;
                }

                // Legionary conditions
                if (role == eWorkerType.legionary) {
                    return  this._playerService.actionPerformTrigger !== eCardEffect.bridge &&
                            this._playerService.actionPerformTrigger !== eCardEffect.coliseum &&
                            this._gameService.gameState.legionaryStage == eLegionaryStage.declare;
                }

                // Merchant conditions
                if (role == eWorkerType.merchant) {
                    if (this._playerService.activeActionTrigger == eCardEffect.basilica)
                        return true;
                }

                // Patron conditions
                if (role == eWorkerType.patron) {
                    if (this._playerService.activeActionTrigger == eCardEffect.aqueduct)
                        return true;
                }

                // Craftsman conditions
                if (role == eWorkerType.craftsman) {
                    if (!this._playerService.selectedBuilding) 
                        return this._playerService.canAddNewBuilding(this.card.id);
                    return this._playerService.cardCanInteractAsMaterial(this.card);
                }

                // Architext conditions
                if (role == eWorkerType.architect) {
                    // Clean up maybe
                    if (this._playerService.activeActionTrigger === eCardEffect.stairway) return false;
                    if (!this._playerService.selectedBuilding && this._playerService.canAddNewBuilding(this.card.id))
                        return true;
                    return false;
                }

                return false;
            }
        }
        else if (
            mode == eActionMode.resolveCardMode &&
            gState.legionaryStage === eLegionaryStage.romeDemanding
        ) {
            return  !!_.find(gState.romeDemands, card => card.role === this.card.role) &&
                    this._playerService.hasTypeToLoot(this.card.role, this._playerService.handCards) ||
                    this.card.selected;
        }
        else return false;
    }

    private _cardIsSelectable(role: eWorkerType) {
        return this._playerService.selectedBuilding.building.role == this.card.role;
    }
}