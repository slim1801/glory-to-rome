import * as _ from 'lodash';

import { Injectable, Inject } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { ICard, IFoundation, IFoundationPile, eWorkerType, eCardEffect, ICompletedFoundation } from './card/card';

const userConfig = require('../config/user.config.json');
import { GameService, IGameState, eLegionaryStage, eActionMode, eActions, removeFromList } from './game.service';
import { CardFactoryService } from './card/card.factory.service';
import { SocketService  } from './socket.service';
import { PlayerInfoService, IPlayer, IPlayerState } from './player.info.service';
import { MessageService, eMessageType } from './message.service';

export interface IActionItem {
    numActions: number;
    action: eWorkerType;
    cardEffect: eCardEffect;
}

@Injectable()
export class PlayerService {

    handSize: number = userConfig.handSize;

    allExtorted = false;
    resolvingCard = false;

    constructor(
        @Inject(CardFactoryService) private _cardFactoryService: CardFactoryService,
        @Inject(GameService) private _gameService: GameService,
        @Inject(PlayerInfoService) private _playerInfoService: PlayerInfoService,
        @Inject(SocketService) private _socketService: SocketService,
        @Inject(MessageService) private _messageService: MessageService
    ) {
        this._initListeners();
    }

    setupForCompletion(cardEff: eCardEffect) {
        let card = this._cardFactoryService.getCard(cardEff);

        let materials: ICard[] = [];
        if (card.role === eWorkerType.architect || card.role === eWorkerType.legionary)
            materials = [card];
        else if (card.role === eWorkerType.merchant || card.role === eWorkerType.patron)
            materials = [card, card];
        
        this._playerInfoService.getPlayerState().underConstruction.push(
            this._cardFactoryService.createFoundation(card, card.role, materials)
        );
    }

    setupCompletion(cardEff: eCardEffect) {
        let card = this._cardFactoryService.getCard(cardEff);

        let completedCard = this._cardFactoryService.createCompletedFoundation(
            card,
            this._cardFactoryService.getCardSite(card.role),
            []
        );
        
        this._playerInfoService.getPlayerState().completed.push(completedCard);
    }

    private _initListeners() {
        let skt = this._socketService;

        skt.onGameStarted().subscribe(gameState => {
            let index = _.findLastIndex(gameState.playerOrder, player => player.id == this._playerInfoService.player.id);
            
            this.configurePlayersTurn(gameState);
            this.configurePlayersLead(gameState.playerLead);

            let card = this._cardFactoryService.createCard(eCardEffect.villa);
            // let card1 = this._cardFactoryService.createCard(eCardEffect.palisade);
            // let card2 = this._cardFactoryService.createCard(eCardEffect.amphitheatre);
            // let card3 = this._cardFactoryService.createCard(eCardEffect.academy);
            // let card4 = this._cardFactoryService.createCard(eCardEffect.latrine);
            // let card5 = this._cardFactoryService.getCard(eCardEffect.road);
            // let card6 = this._cardFactoryService.getCard(eCardEffect.scriptorium);
            // this.handCards = [
            //     this._cardFactoryService.createCard(eCardEffect.dock),
            //     this._cardFactoryService.createCard(eCardEffect.statue),
            //     this._cardFactoryService.createCard(eCardEffect.dock),
            //     this._cardFactoryService.createCard(eCardEffect.dock)
            // ];

            // this.addCards([card]);
            // this._gameService.addToPool([card1]);
            // this._playerInfoService.getPlayerState().clientelles.push(card1);
            // this._playerInfoService.getPlayerState().stockpile.push(card2);
            // this._playerInfoService.getPlayerState().clientelles.push(card);
            // this._playerInfoService.getPlayerState().clientelles.push(card1);
            // this._playerInfoService.getPlayerState().clientelles.push(card2);
            // this._playerInfoService.getPlayerState().clientelles.push(card3);
            // this._playerInfoService.getPlayerState().clientelles.push(card5);
            // this._playerInfoService.getPlayerState().clientelles.push(card4);
            // this._playerInfoService.getPlayerState().stockpile.push(card);

            // this.setupForCompletion(eCardEffect.garden);
            // });
            // this._playerInfoService.getPlayerState().completed.push(completedCard1);
            // this._playerInfoService.getPlayerState().maxClientelles = 4;
            // this._playerInfoService.getPlayerState().maxVault = 4;
            // let completedCard1 = new CompletedCard(card1);
            // this._playerInfoService.getPlayerState().completed.push(completedCard1);
            // this._playerInfoService.getPlayerState().clientelles.push(card1);

            // let secondPlayer = _.find(this._gameService.gameState.playerStates, p => p.player.id != this._playerInfoService.player.id);
            // secondPlayer.completed.push(this._cardFactoryService.createCompletedFoundation(
            //     card,
            //     card.role,
            //     [card, card]
            // ));
            // this._playerInfoService.getPlayerState().completed.push(this._cardFactoryService.createCompletedFoundation(
            //     card,
            //     card.role,
            //     [card1, card2]
            // ));
            // this._playerInfoService.getPlayerState().completed.push(this._cardFactoryService.createCompletedFoundation(
            //     card3,
            //     card1.role,
            //     [card4]
            // ));

            // this._playerInfoService.getPlayerState().underConstruction.push(this._cardFactoryService.createFoundation(
            //     card,
            //     card.role,
            //     [card]
            // ));
        });

        skt.onTurnStarted().subscribe(gameState => {
            if (this._playerInfoService.isFollowing) this._playerInfoService.isFollowing = false;
            
            this.configurePlayersTurn(gameState);
            this.configurePlayersLead(gameState.playerLead);
        });

        skt.onTurnEnd().subscribe(gameState => {
            this.configurePlayersTurn(gameState);

            if (!this._playerInfoService.isPlayersTurn) return;

            // Academy condition
            let academy = this.isBuildingCompleted(eCardEffect.academy);
            let sewer = this.isBuildingCompleted(eCardEffect.sewer);
            let senate = this.isBuildingCompleted(eCardEffect.senate);

            // TODO - Handle multiple triggers
            if (academy) {
                this.actionFinishTrigger = eCardEffect.academy;
            }
            else if (
                sewer &&
                this._playerInfoService.getPlayerState().actionCard &&
                this._playerInfoService.getPlayerState().actionCard.role != eWorkerType.jack
            ) {
                this.actionFinishTrigger = eCardEffect.sewer;
            }
            else if (senate && this._canTakeJacks()) {
                this.actionFinishTrigger = eCardEffect.senate;
            }
            else {
                this._messageService.addLine();
                this.turnFinished();
            }
        });

        skt.onExtortMaterial().subscribe(gameState => {
            if (this._playerInfoService.isPlayersTurn) {

                // Check every player has given a material
                let filtered = _.filter(gameState.playerStates, state => {
                                    let index = this._gameService.getPlayerIndex(state);
                                    return this.canLegionaryFrom(index, state) && this._playerInfoService.player.id !== state.player.id;
                                });

                let extortedAll = _.every(filtered, state => state.loot.length > 0 || state.gloryToRome);
                extortedAll && this._takeFromPool();
            }
        });

        skt.onRomeDemands().subscribe(gameState => {
            let pState = this._playerInfoService.getPlayerState();

            let hasCard = _.some(gameState.romeDemands, card => {
                return this.hasCardTypeInHand(card.role);
            });
            if (!this.canLegionaryFrom(this._gameService.getPlayerIndex(pState), pState)) {
                this.extortMaterial();
            }
            else if (!hasCard) {
                pState.gloryToRome = true;
            }
        });

        skt.onAllPlayersChosen().subscribe(gameState => {
            this._configurePlayerTurn(gameState);
            if (this._gameService.gameState.mode === eWorkerType.legionary) {
                this._gameService.gameState.legionaryStage = eLegionaryStage.declare;
            }

            let mode = this._gameService.gameState.mode;
            // Atrium trigger
            if (this.hasBuildingFunction(eCardEffect.atrium) && mode == eWorkerType.merchant)
                this.actionPerformTrigger = eCardEffect.atrium;
            // Bar trigger
            else if (this.hasBuildingFunction(eCardEffect.bar) && mode == eWorkerType.patron)
                this.actionPerformTrigger = eCardEffect.bar;
            // Stairway trigger
            else if (this.hasBuildingFunction(eCardEffect.stairway) && mode == eWorkerType.architect)
                this.actionPerformTrigger = eCardEffect.stairway;
        });
        
        skt.onActionFinished().subscribe(gameState => {
            this._configurePlayerTurn(gameState);
        });
    }

    private playerHand() {
        return this._playerInfoService.getPlayerHand();
    }

    private _configurePlayerTurn(gameState) {
        if (gameState.playerOrder[gameState.playerTurn].id == this._playerInfoService.player.id) {
            this._playerInfoService.isPlayersTurn = true;
        }
        else if (gameState.actionMode == eActionMode.turnEndMode) {
            this._gameService.actionEnd();
        }
    }

    updatePlayerState() {
        this._playerInfoService.saveCardsInHand(this.playerHand().length);
    }

    removeFromHand(card: ICard) {
        const handCards = this.playerHand();
        for (let i = 0; i < handCards.length; i++) {
            if (handCards[i].uid == card.uid) {
                handCards.splice(i, 1);
                i--;
            }
        }
    }

    addCards = (cards: ICard[]) => {
        _.forEach(cards, card => {
            this.playerHand().push(card);
        });
    }

    drawCard = (id: eCardEffect) => {
        this.playerHand().push(this._cardFactoryService.getCard(id))
    }

    discardHand = () => {
        this._messageService.discardMessage(this.playerHand());
        _.forEach(this.playerHand(), card => {
            if (card.role == eWorkerType.jack) {
                this._gameService.addJack();
            }
            else {
                this._gameService.addToPool([card]);
            }
        });
        this._playerInfoService.setPlayerHand([]);
    }

    drawCards(num: number) {
        let cards = this._gameService.drawCards(num);
        if (cards)
            this.addCards(cards);
    }

    drawCardsFromDeck(num: number) {
        let cards = this._gameService.drawCards(num);
        cards === null && this._endGame(); 
        return cards;
    }

    getNumCardsInHand = () => {
        return this.playerHand().length;
    }

    getCardsToMax = () => {
        let val = this._playerInfoService.getPlayerState().maxHandSize - this.getNumCardsInHand();
        return val <= 0 ? 1 : val;
    }

    canPlayCardsAsJack = (): eWorkerType[] => {
        if (this.hasBuildingFunction(eCardEffect.circus)) {
            return this._hasNumCards(2);
        }
        return this._hasNumCards(3);
    }

    typesForJack: eWorkerType[] = null;
    jackTypeSelected: eWorkerType = null;

    takeOpponentsJacks() {
        let currPlayer = this._playerInfoService.getPlayerState();
        _.forEach(this._gameService.gameState.playerStates, pState => {
            if (
                pState.actionCard &&
                pState.actionCard.role == eWorkerType.jack &&
                pState.player.id !== currPlayer.player.id
            ) {
                this.playerHand().push(pState.actionCard);
                pState.actionCard = null;
            }
        })
    }

    private _canTakeJacks() {
        let pStates = this._gameService.gameState.playerStates;
        return _.some(pStates, pState => pState.actionCard && pState.actionCard.role == eWorkerType.jack);
    }

    playCardsAsJack(type: eWorkerType) {
        this._playerInfoService.getPlayerState().jackCards = [];
        this.jackTypeSelected = type;
        this.typesForJack = this.canPlayCardsAsJack();
    }

    selectCardAsJack = (card: ICard) => {
        let jackCards = this._playerInfoService.getPlayerState().jackCards;
        jackCards.push(card);
        if (jackCards.length == this._playerInfoService.getPlayerState().cardsForJack) {

            this._messageService.petitionMessage(jackCards);

            _.forEach(jackCards, card => {
                card.selected = false;
                _.remove(this.playerHand(), card);
            });

            let jack = this._cardFactoryService.getJack()
            jack.mode = this.jackTypeSelected;
            this.playCard(jack);
            this.typesForJack = null;
        }
    }

    deselectCardAsJack = (card: ICard) => {
        _.remove(this._playerInfoService.getPlayerState().jackCards, card);
    }

    private configurePlayersTurn(gameState: IGameState) {
        this._playerInfoService.isPlayersTurn = gameState.playerOrder[gameState.playerTurn].id == this._playerInfoService.player.id;
    }

    private configurePlayersLead(player: IPlayer) {
        this._playerInfoService.isPlayersLead = player.id == this._playerInfoService.player.id;
    }

    playCard(card: ICard) {
        this._gameService.gameState.mode = card.mode != null ? card.mode : card.role;
        
        _.remove(this.playerHand(), card);

        // Save state
        this._playerInfoService.saveActionCardToPlayerState(card);
        this._playerInfoService.getPlayerState().action = eActions.playCard;

        this.updatePlayerState();
        this._gameService.updateGameState();

        if (
            this.hasBuildingFunction(eCardEffect.palace) &&
            this._palaceCondition(card)
        ) {
            this.resolvingCard = true;
            this.actionPerformTrigger = eCardEffect.palace;
        }
        else {
            this._playerInfoService.isPlayersTurn = false;
            if (this._playerInfoService.isPlayersLead) {
                this._messageService.addLeadMessage(card);
            }
            this._socketService.actionFinished(card);
        }
    }

    private _hasNumCards(num: number): eWorkerType[] {
        let cardDict = {};
        let typeArr = [];
        const handCards = this.playerHand();
        for (let i = 0; i < handCards.length; i++) {
            let key = handCards[i].role;
            cardDict[key] = cardDict[key] == undefined ? 1 : cardDict[key] + 1;
            if (cardDict[key] == num && key != eWorkerType.jack) {
                typeArr.push(key);
            }
        }
        return typeArr;
    }

    private _gateOnCompleted() {
        let pState = this._playerInfoService.getPlayerState();
        _.forEach(pState.underConstruction, foundation => {
            let card = foundation.building;
            if (card.role == eWorkerType.patron) {
                pState.functionAvailable.push(card);
                // Assume no building have upon completion function
                this._resolveCompletedFunction(card)
            }
        })
    }

    resolveNextActionState() {
        if (this.actionStack.length == 0) {
            this.actionFinished();
        }
        else {
            this.activeActionItem = this.actionStack.pop();
            this.resolveActionState();
        }
    }

    resolveActionState() {
        if (this.activeActionItem.numActions === 0 && this.actionStack.length == 0)
            this.actionFinished();
        else {
            let jack = this._cardFactoryService.getJack();
            jack.setMode(this.activeActionItem.action);

            this._gameService.gameState.mode = this.activeActionItem.action;
            this._playerInfoService.saveActionCardToPlayerState(jack);
        }
    }

    private _createCompletedStackItem(numActions: number, action: eWorkerType, cardEffect: eCardEffect): IActionItem {
        return { numActions, action, cardEffect }
    }

    canAddToBuilding = (card: ICard) => {
        let mode = this._gameService.gameState.mode;

        if (this.hasBuildingFunction(eCardEffect.road) && 
            this.selectedBuilding &&
            this.selectedBuilding.building.role == eWorkerType.merchant)
            return true;

        if (this.selectedBuilding &&
            (mode == eWorkerType.craftsman || mode == eWorkerType.architect) && 
            this.selectedBuilding.building.role == card.role
        )
            return true;
        else
            return false;
    }

    dumpHand = () => {
        // Non jack cards add to pool
        let removedCards = _.remove(this.playerHand(), card => {
            return card.role != eWorkerType.jack;
        });
        this._gameService.addToPool(removedCards);

        // Jack cards add back to deck
        let jackCards = _.remove(this.playerHand(), card => {
            this._gameService.addJack();
            return card.role == eWorkerType.jack;
        });
    }

    thinkCheck() {
        this._playerInfoService.getPlayerState().action = eActions.think;

        if (this.hasClientelleType(this._gameService.gameState.mode)) {
            let card = this._cardFactoryService.getJack();
            card.setMode(this._gameService.gameState.mode);
            this._playerInfoService.saveActionCardToPlayerState(card);
        }
    }

    think() {
        let cardsToDraw = this.getCardsToMax();
        let cards = this.drawCardsFromDeck(cardsToDraw);
        if (cards)
            this.addCards(cards);
    }

    thinkAction() {
        this.activeActionTrigger = null;
        this.actionPerformTrigger = null;
        this.actionFinishTrigger = null;

        this.thinkCheck();
        this.think();

        this._playerInfoService.isPlayersTurn = false;

        this._messageService.addTextMessage("THINKS");

        this._gameService.updateGameState();
        this._socketService.think();
    }

    hasCardTypeInHand(type: eWorkerType) {
        return !!_.find(this.playerHand(), card => card.role == type);
    }

    /* ACTION SECTION */

    actionFinishTrigger: eCardEffect = null;
    actionPerformTrigger: eCardEffect = null;
    additionalActionTrigger: eCardEffect = null;
    activeActionTrigger: eCardEffect = null;

    actionStack: IActionItem[] = [];
    activeActionItem: IActionItem = null;

    additionalActionTriggered = false;
    additionalActionPerformed = false;

    actionFinished() {
        this.resetTurnState();
        this.updatePlayerState();
        this._gameService.updateGameState();

        this._playerInfoService.isPlayersTurn = false;
        this._socketService.actionFinished(null);
    }

    turnFinished() {
        this.resetTurnState();

        this.jackTypeSelected = null;
        this._gameService.gameState.legionaryStage = null;

        this.updatePlayerState();
        this._gameService.updateGameState();

        this._gameService.actionEnd();
        this._socketService.turnEnd();
    }

    resetTurnState() {
        this.activeActionTrigger = null;
        this.actionPerformTrigger = null;
        this.actionFinishTrigger = null;

        this.activeActionItem = null;
        this.additionalActionPerformed = false;
        this.actionStack = [];

        _.forEach(this._gameService.gameState.playerStates, pState => pState.gloryToRome = false);

        if (this.selectedBuilding) {
            this.selectedBuilding.building.selected = false;
            this.selectedBuilding = null;
        }
    }

    inAddition() {
        this.activeActionTrigger = null;
        this.additionalActionPerformed = true;

        if (this._actionLimit())
            this.actionFinished();
        else
            this.resolveActionState();
    }

    private _hasAdditionalAction() {
        if (this.additionalActionPerformed) return false;

        let mode = this._gameService.gameState.mode;
        // Aqueduct condition
        if (
            mode === eWorkerType.patron &&
            this.hasBuildingFunction(eCardEffect.aqueduct) &&
            this.canAddToClientelles()
        ) {
            this.resolvingCard = true;
            this.additionalActionTrigger = eCardEffect.aqueduct;
            return true;
        }
        // Basilica condition
        else if (
            this.hasBuildingFunction(eCardEffect.basilica) &&
            mode === eWorkerType.merchant
        ) {
            this.resolvingCard = true;
            this.additionalActionTrigger = eCardEffect.basilica;
            return true;
        }
        // Dock condition
        else if (
            this.hasBuildingFunction(eCardEffect.dock) &&
            mode === eWorkerType.laborer
        ) {
            this.resolvingCard = true;
            this.additionalActionTrigger = eCardEffect.dock;
            return true;
        }
        return false;
    }

    decrementActions(compState?: IActionItem) {
        this.activeActionItem.numActions--;

        if (this.activeActionItem.numActions > 0)
            this.stateChanged();

        if (this.activeActionItem === null && compState) {
            this.actionStack.push(compState);
            this.resolveActionStack();
            this.completionActionSubject.next(this.activeActionItem);
        }
        else if (compState) {
            let numActions = this.activeActionItem.numActions;
            let action = this._gameService.gameState.mode;

            // Save current action actions;
            if (numActions > 0 && compState.action !== action) {
                this.actionStack.push({
                    numActions,
                    action,
                    cardEffect: null
                });
            }
            else if (numActions > 0) {
                compState.numActions += numActions;
            }

            this.actionStack.push(compState);
            this.resolveActionStack();
            this.completionActionSubject.next(this.activeActionItem);
        }
        else if (!this._hasAdditionalAction()) {
            if (this._actionLimit()) {
                this.resolveNextActionState();
            }
            else {
                this.resolveActionStack();
            }
        }
    }

    stateChanged() {
        this.updatePlayerState();
        this._gameService.updateGameState()
        this._socketService.stateChanged();
    }

    resolveActionStack() {
        if (this.actionStack.length > 0) {
            let currActionState = this.actionStack[this.actionStack.length - 1];

            if (currActionState.cardEffect !== null) {
                // Amphitheatre condition
                this.actionPerformTrigger = currActionState.cardEffect;
                this.resolvingCard = true;
            }
            else {
                this.resolveNextActionState();
            }
        }
        else if (this.activeActionItem.numActions == 0) {
            this.actionFinished();
        }
    }

    private _actionLimit() {
        let mode = this._gameService.gameState.mode;
        let pState = this._playerInfoService.getPlayerState();

        if (mode === eWorkerType.patron && pState.clientelles.length == pState.maxClientelles) {
            return true;
        }
        else if (mode === eWorkerType.merchant) {
            if (pState.vault.length == pState.maxVault)
                return true;
            else if (this.actionPerformTrigger === eCardEffect.atrium)
                return false;
            else if (pState.stockpile.length == 0)
                return true;
            return true;
        }
        return false;
    }

    private palaceSubject = new Subject<void>();
    palaceResolved() {
        this.palaceSubject.next();
    }

    onPalaceResolved() {
        return this.palaceSubject.asObservable();
    }

    private _palaceCondition(card: ICard) {
        return  this.hasCardTypeInHand(card.role) || 
                this.hasCardTypeInHand(eWorkerType.jack) ||
                card.role == eWorkerType.jack && this.hasCardTypeInHand(card.mode)
    }

    addAdditionalAction(card: ICard) {
        _.remove(this.playerHand(), card);

        let pState = this._playerInfoService.getPlayerState();
        pState.additionalActions.push(card);

        if (!this._palaceCondition(pState.actionCard)) {
            this.actionFinished();
        }
    }

    /* LEGIONARY ACTION */

    canLegionaryFrom(index: number, pState: IPlayerState) {
        let gState = this._gameService.gameState;
        let playerTurn = gState.playerTurn;
        let len = gState.playerOrder.length;
        let demandingPlayer = gState.playerStates[playerTurn];

        // Bridge condition
        if (this.hasBuildingFunction(eCardEffect.bridge, demandingPlayer)) {
            return this.hasBuildingFunction(eCardEffect.wall, pState) ? false : true;
        }
        else if (
            (playerTurn - 1 < 0 ? gState.playerOrder.length - 1 : playerTurn - 1) % len == index ||
            (playerTurn + 1) % len == index
        ) {
            return  this.hasBuildingFunction(eCardEffect.palisade, pState) ||
                    this.hasBuildingFunction(eCardEffect.wall, pState) ? false : true;
        }
    }

    romeDemands() {
        _.forEach(this._gameService.gameState.romeDemands, rd => rd.selected = false);
        this._gameService.updateGameState();

        if (this.hasBuildingFunction(eCardEffect.bridge)) {
            this.actionPerformTrigger = eCardEffect.bridge;
            this.resolvingCard = true;
        }
        else if (this.hasBuildingFunction(eCardEffect.coliseum)) {
            this.actionPerformTrigger = eCardEffect.coliseum;
            this.resolvingCard = true;
        }
        else {
            this._messageService.romeDemandsMessage(this._gameService.gameState.romeDemands);
            this._socketService.romeDemands();
        }
    }

    private _legionaryTriggerCount = 0;

    extortMaterial() {
        let pState = this._playerInfoService.getPlayerState();

        this.updatePlayerState();
        this._gameService.updateGameState();

        let aTrigs = this._gameService.gameState.actionTriggers;
        
        if (aTrigs.length > 0 && this._legionaryTriggerCount < aTrigs.length) {
            // Bridge condition
            if (aTrigs[this._legionaryTriggerCount] === eCardEffect.bridge) {
                // Check if stockpile has cards to loot
                if (this.hasCardsToLoot(pState.stockpile)) {
                    this._legionaryTriggerCount++;
                    this._gameService.gameState.legionaryStage = eLegionaryStage.bridge;
                }
                else {
                    this._socketService.extortMaterial();
                }
            }
            else if (aTrigs[this._legionaryTriggerCount] === eCardEffect.coliseum) {
                // Check if clientelles has cards to loot
                if (this.hasCardsToLoot(pState.clientelles) && this.canPutIntoVault()) {
                    this._legionaryTriggerCount++;
                    this._gameService.gameState.legionaryStage = eLegionaryStage.coliseum;
                }
                else {
                    this._socketService.extortMaterial();
                }
            }
        }
        else {
            this._legionaryTriggerCount = 0;
            this._socketService.extortMaterial();
        }
    }

    private _takeFromPool() {
        let gameState = this._gameService.gameState;

        // Check pool for same type card
        let sameTypeInPool = _.some(gameState.pool, card => {
            return !!_.find(gameState.romeDemands, romeCard => romeCard.role === card.role);
        });

        // Allow to legionairy action from pool
        if (sameTypeInPool) {
            this.allExtorted = true;
        }
        else {
            this.legionaryFromPool(null);
        }
    }

    legionaryFromPool(card: ICard) {
        let lootFlatMap = _(this._gameService.gameState.playerStates)
                            .map(pState => pState.loot.length > 0 ? pState.loot : null)
                            .remove(null)
                            .flatten<ICard>()
                            .value();
        
        card && lootFlatMap.push(card);

        let sPile = this._playerInfoService.getPlayerState().stockpile;
        sPile.push(...lootFlatMap);

        this._gameService.gameState.romeDemands = [];
        this._gameService.gameState.legionaryStage = eLegionaryStage.declare;

        this.allExtorted = false;

        card && this._messageService.addPoolLegionaryMessage(card);
        this.actionFinished();
    }

    addRemoveFromLoot(card: ICard) {
        let pState = this._playerInfoService.getPlayerState();

        // Check if in loot array already
        if (_.find(pState.loot, lCard => lCard.uid == card.uid)) {
            card.selected = false;
            removeFromList(card, pState.loot);
        }
        else {
            card.selected = true;
            pState.loot.push(card);
        }
    }

    hasCardsToLoot(cards: ICard[]) {
        let pState = this._playerInfoService.getPlayerState();
        let loot = pState.loot;

        let roleArr: number[] = []
        _.forEach(this._gameService.gameState.romeDemands, card => {
            roleArr[card.role] = roleArr[card.role] ? roleArr[card.role] + 1 : 1;
        });

        let selectedArr = [];
        _.forEach(cards, card => {
            if (card.selected) {
                selectedArr[card.role] = selectedArr[card.role] ? selectedArr[card.role] + 1 : 1;
            }
        });

        let numOfCards = [];
        _.forEach(cards, card => {
            numOfCards[card.role] = numOfCards[card.role] ? numOfCards[card.role] + 1 : 1;
        });

        let hasCard = [];
        for(let i = 0; i < 6; i++) {
            if (roleArr[i]) {
                let s = selectedArr[i] === undefined ? 0 : selectedArr[i];
                hasCard[i] = s < roleArr[i] && s < numOfCards[i];
            }
            else {
                hasCard[i] = false;
            }
        }

        return _.some(hasCard);
    }

    hasTypeToLoot(type: eWorkerType, cards: ICard[]) {
        let lootSum = _.sumBy(cards, card => {
            return type === card.role && card.selected ? 1 : 0;
        });
        let demandSum = _.sumBy(this._gameService.gameState.romeDemands, card => {
            return type === card.role ? 1 : 0;
        });

        return lootSum < demandSum;
    }

    /* CLIENTELLE SECTION */

    hasClientelleType(wType: eWorkerType) {
        return !!_.find(this._playerInfoService.getPlayerState().clientelles, client => client.role === wType);
    }

    coliseumResolved(pState: IPlayerState, card: ICard) {
        _.remove(pState.clientelles, card);
        this._playerInfoService.getPlayerState().vault.push(card);
        if (!this.hasClientsToTakeForColiseum()) {
            this._takeFromPool();
        }
    }

    hasClientsToTakeForColiseum() {
        let gState = this._gameService.gameState;
        let romeDemanded = gState.romeDemands;

        return _.some(gState.playerStates, pState => {
            return _.find(pState.clientelles, client => 
                    !pState.hasLooted &&
                    _.find(romeDemanded, card => card.role === client.role) &&
                    pState.player.id !== this._playerInfoService.getPlayerState().player.id
            );
        })
    }

    private _calcMaxClientelles() {
        let pState = this._playerInfoService.getPlayerState();
        let completed = pState.completed;
        let addClients = _.find(completed, card => card.building.id == eCardEffect.insula) ? 2 : 0;
        let multClient = _.find(completed, card => card.building.id == eCardEffect.aqueduct) ? 2 : 1;
        pState.maxClientelles = (pState.influence + addClients) * multClient;
    }

    addToClientelles(card: ICard) {
        let clients = this._playerInfoService.getPlayerState().clientelles;
        clients.push(card);
        this._messageService.addClientelleMessage(card);
        
        // Forum Condition
        if (this.forumCondition(this._playerInfoService.getPlayerState())) {
            this._endGame();
            return false;
        }
        else if (this.hasBuildingFunction(eCardEffect.bath)) {
            if (
                this._gameService.gameState.mode === eWorkerType.patron &&
                !this.canAddToClientelles()
            ) {
                return false;
            }
            this.selectedBuilding = null;
            this.resolvingCard = true;
            this.actionPerformTrigger = eCardEffect.bath;
            return false;
        }
        return true;
    }

    getClientelleOfType(type: eWorkerType) {
        return _.filter(this._playerInfoService.getPlayerState().clientelles, client => type == client.role);
    }

    removeFromClientelles(card: ICard) {
        removeFromList(card, this._playerInfoService.getPlayerState().clientelles);
    }

    canAddToClientelles() {
        let pState = this._playerInfoService.getPlayerState();
        return pState.clientelles.length < pState.maxClientelles;
    }

    /* COMPLETED BUILDINGS SECTION */

    completedSelectedBuilding: ICompletedFoundation = null;

    fountainCard: ICard = null;

    fountainCondition() {
        return this._playerInfoService.isPlayersTurn &&
            this._gameService.gameState.mode === eWorkerType.craftsman && 
            this._gameService.gameState.actionMode === eActionMode.resolveCardMode &&
            this.hasBuildingFunction(eCardEffect.fountain) && 
            this.activeActionTrigger !== eCardEffect.fountain;
    }

    isBuildingCompleted(id: eCardEffect) {
        return !!_.find(this._playerInfoService.getPlayerState().completed, card => card.building.id == id);
    }

    addToCompleted(foundation: IFoundation) {
        foundation.building.selected = false;

        let pState = this._playerInfoService.getPlayerState();
        pState.completed.push(
            this._cardFactoryService.createCompletedFromFoundation(foundation)
        );

        this._messageService.addCompletedMessage(foundation.building);

        let inf = this.getInfluence(foundation);
        pState.influence += inf;
        pState.maxVault += inf;
        this._calcMaxClientelles();
        
        this.buildingIsCompleted(foundation.building);
    }

    getInfluence(foundation: IFoundation) {
        switch(foundation.site.id) {
            case eCardEffect.rubble:
            case eCardEffect.wood:
                return 1;
            case eCardEffect.brick:
            case eCardEffect.concrete:
                return 2;
            case eCardEffect.marble:
            case eCardEffect.stone:
                return 3;
        }
    }

    getInfluenceByType(type: eWorkerType) {
        switch(type) {
            case eWorkerType.laborer:
            case eWorkerType.craftsman:
                return 1;
            case eWorkerType.architect:
            case eWorkerType.legionary:
                return 2;
            case eWorkerType.merchant:
            case eWorkerType.patron:
                return 3;
        }
    }

    removeFromCompleted(card: ICard) {
        _.remove(this._playerInfoService.getPlayerState().completed, card);
    }

    prisonResolved(pState: IPlayerState, foundation: ICompletedFoundation) {
        _.remove(pState.completed, comp => comp.building.id == foundation.building.id);
        let playerState = this._playerInfoService.getPlayerState();

        playerState.completed.push(this._cardFactoryService.createCompletedFromFoundation(foundation));
        this._resolveCompletedFunction(foundation.building);
        playerState.influence = playerState.influence - 3;
    }

    anyPlayerForumCondition() {
        let pStates = this._gameService.gameState.playerStates;
        return _.some(pStates, pState => this.forumCondition(pState));
    }

    forumCondition(pState: IPlayerState) {

        let accumTypes: number[] = [];
        _.forEach(pState.clientelles, client => {
            accumTypes[client.role] = accumTypes[client.role] ? accumTypes[client.role] + 1 : 1;
        });
        
        if (this.hasBuildingFunction(eCardEffect.forum)) return this.satisfiesForum(accumTypes);
        // Gate combo into Forum
    }

    satisfiesForum(accumTypes: number[]) {
        return  _.every(accumTypes, type => type !== undefined && type > 0) ||
                // Ludus Magna
                this.hasBuildingFunction(eCardEffect.ludusMagna) && this.satisfiesForumLudusMagna(accumTypes) ||
                // Storeroom 
                this.hasBuildingFunction(eCardEffect.storeroom) && this.satisfiesForumStoreroom(accumTypes)
    }

    private satisfiesForumLudusMagna(accumTypes: number[]) {
        let satisfied = _.filter(accumTypes, type => type > 0).length;
        return satisfied + accumTypes[eWorkerType.merchant] - 1 >= 6;
    }

    private satisfiesForumStoreroom(accumTypes: number[]) {
        return _.filter(accumTypes, (type, i) => (i != eWorkerType.laborer) && type > 0).length === 5;
    }

    hasCompletedBuilding(effect: eCardEffect, customState?: IPlayerState) {
        let pState = customState ? customState : this._playerInfoService.getPlayerState();
        return  !!_.find(pState.completed, comp => comp.building.id === effect);
    }

    hasBuildingFunction(effect: eCardEffect, customState?: IPlayerState) {
        let pState = customState ? customState : this._playerInfoService.getPlayerState();
        return  this.hasCompletedBuilding(effect, customState) ||
                !!_.find(pState.functionAvailable, building => building.id === effect) ||
                !!_.find(this._gameService.gameState.publicBuildings, building => building.id === effect);
    }

    roadInteractionCondition(card: ICard) {
        return  this.hasBuildingFunction(eCardEffect.road) &&
                card.role != eWorkerType.jack &&
                this.selectedBuilding &&
                this.selectedBuilding.building.role == eWorkerType.merchant
    }

    roadCondition() {
        return  this.selectedBuilding && 
                this.selectedBuilding.building.role == eWorkerType.merchant &&
                this.hasBuildingFunction(eCardEffect.road);
    }

    scriptoriumCondition() {
        return this.hasBuildingFunction(eCardEffect.scriptorium) && 
                !!_.find(this.playerHand(), card => card.role == eWorkerType.patron && !card.phantom);
    }

    statueCraftsmanCondition(foundation: IFoundation) {
        return foundation.building.id === eCardEffect.statue &&
               !!_.find(this.playerHand(), card => card.role == eWorkerType.patron || card.role == foundation.site.role)
    }

    statueArchitectCondition(foundation: IFoundation) {
        let stockpile = this._playerInfoService.getPlayerState().stockpile;
        return foundation.building.id === eCardEffect.statue &&
               !!_.find(stockpile, card => card.role == eWorkerType.patron || card.role == foundation.site.role)
    }

    isInActionStack(id: eCardEffect) {
        return !!_.find(this.actionStack, actionItem => actionItem.cardEffect && actionItem.cardEffect == id);
    }

    buildingIsCompleted(card: ICard){
        let completionState: IActionItem = this._resolveCompletedFunction(card);
        this.selectedBuilding = null;
        
        this.buildingCompletedSubject.next(card);
        this.decrementActions(completionState);
    }

    private _resolveCompletedFunction(card: ICard) {
        let completionState: IActionItem = null;

        let pState = this._playerInfoService.getPlayerState();
        let influence = pState.influence;

        switch(card.id) {
            case eCardEffect.amphitheatre:
                completionState = this._createCompletedStackItem(influence, eWorkerType.craftsman, card.id);
                break;
            case eCardEffect.catacomb:
                this._endGame();
                return;
            case eCardEffect.circus:
                pState.cardsForJack = 2;
                break;
            case eCardEffect.foundry:
                completionState = this._createCompletedStackItem(influence, eWorkerType.laborer, card.id);
                break;
            case eCardEffect.forum:
                if (this.forumCondition(pState)) {
                    this._endGame();
                    return;
                }
                else {
                    break;
                }
            case eCardEffect.garden:
                completionState = this._createCompletedStackItem(influence, eWorkerType.patron, card.id);
                break;
            case eCardEffect.gate:
                this._gateOnCompleted();
                break;
            case eCardEffect.insula:
                this._calcMaxClientelles();
                break;
            case eCardEffect.market:
                pState.maxVault += 2;
                break;
            case eCardEffect.prison:
                completionState = this._createCompletedStackItem(0, null, card.id);
                break;
            case eCardEffect.school:
                completionState = this._createCompletedStackItem(1, null, card.id);
                break;
            case eCardEffect.shrine:
                pState.maxHandSize += 2;
                break;
            case eCardEffect.temple:
                pState.maxHandSize += 4;
                break;
        }

        return completionState;
    }

    private buildingCompletedSubject = new Subject<ICard>();
    onBuildingCompleted() {
        return this.buildingCompletedSubject.asObservable();
    }

    private completionActionSubject = new Subject<IActionItem>();
    onCompletionAction() {
        return this.completionActionSubject.asObservable();
    }

    private _endGame() {
        this._socketService.endGame();
    }

    /* STOCKPILE SECTION */

    addToStockpile(card: ICard) {
        this._playerInfoService.getPlayerState().stockpile.push(card);
        this._messageService.addStockpileMessage(card);
    }

    removeFromStockpile(card: ICard) {
        removeFromList(card, this._playerInfoService.getPlayerState().stockpile);
    }

    hasCardTypeInStockpile(type: eWorkerType) {
        return !!_.find(this._playerInfoService.getPlayerState().stockpile, card => card.role == type);
    }

    hasStockpileToTakeForBridge() {
        let gState = this._gameService.gameState;
        let romeDemanded = gState.romeDemands;

        return _.some(gState.playerStates, pState => {
            return _.find(pState.stockpile, stock => 
                !pState.hasLooted &&
                _.find(romeDemanded, card => card.role === stock.role) &&
                pState.player.id !== this._playerInfoService.getPlayerState().player.id 
            );
        })
    }

    stairwayAction(card: ICard) {
        removeFromList(card, this._playerInfoService.getPlayerState().stockpile);
        this.completedSelectedBuilding.stairway = true;
        this.completedSelectedBuilding.building.selected = false;
        this._gameService.gameState.publicBuildings.push(card);

        if (this.anyPlayerForumCondition()) {
            this._endGame();
        }
        else {
            this.decrementActions();
        }
    }

    /* VAULT SECTION */

    addToVault(cards: ICard[]) {
        _.forEach(cards, card => {
            this._playerInfoService.getPlayerState().vault.push(card);
        });
        this._messageService.addCustomMessage([
            { player: this._playerInfoService.player },
            { text: "adds a card into their VAULT" }
        ]);
    }

    canPutIntoVault() {
        let pState = this._playerInfoService.getPlayerState();
        return pState.vault.length < pState.maxVault;
    }

    /* UNDER CONSTRUCTION SECTION */
    
    canAddNewBuilding(cardEff: eCardEffect) {
        if (cardEff === null || cardEff === undefined) return false;
        let wType = this._cardFactoryService.getRoleFromId(cardEff);
        return  this.activeActionItem &&
                this.activeActionItem.numActions >= this.foundationCost(wType) &&
                this._gameService.hasFoundationToLay(wType) &&
                !this.hasCompletedBuilding(cardEff) && !this.hasBuildingUnderConstruction(cardEff);
    }

    hasBuildingUnderConstruction(cardEff: eCardEffect) {
        if (this.actionPerformTrigger === eCardEffect.statue) return false;

        let underCos = this._playerInfoService.getPlayerState().underConstruction;
        return !!_.find(underCos, underCo => underCo.building.id === cardEff && !underCo.building.phantom);
    }

    removePhantomCard(card: ICard) {
        let foundations = this._playerInfoService.getPlayerState().underConstruction;
        for (let i = 0; i < foundations.length; i++) {
            if (card.uid == foundations[i].building.uid) {
                foundations.splice(i, 1);
                i--;
            }
        }
    }

    private addBuildingSubject = new Subject<ICard>();
    addToUnderConstruction(card: ICard) {
        let pState = this._playerInfoService.getPlayerState();
        let underCo = pState.underConstruction;

        // Remove Phantom Cards
        this.removePhantomCard(card);

        if (card.id == eCardEffect.statue) {
            this.addBuildingSubject.next(card);

            let newBuilding = this._cardFactoryService.createFoundation(card, null, []);

            underCo.push(newBuilding);
            this.actionPerformTrigger = eCardEffect.statue;

            // Forum Condition
            if (this._gameService.noMoreInTownFoundations()) {
                this._endGame();
            }
        }
        else {
            underCo.push(this._cardFactoryService.createFoundation(card, card.role, []));

            // Gate Condition
            if (card.role == eWorkerType.patron && this.hasBuildingFunction(eCardEffect.gate)) {
                pState.functionAvailable.push(card);
                this._resolveCompletedFunction(card);
            }

            // Extra cost and Tower condition
            if (this.foundationCost(card.role) == 2 && !this.hasBuildingFunction(eCardEffect.tower)) {
                this.activeActionItem.numActions--;
            }

            this.addBuildingSubject.next(card);

            // Forum Condition
            if (this._gameService.noMoreInTownFoundations()) {
                this._endGame();
            }
            else {
                this._messageService.addUnderConstructionMessage(card);
                this.decrementActions();
            }
        }
    }

    onNewBuilding() {
        return this.addBuildingSubject.asObservable();
    }

    foundationChosen(fPile: IFoundationPile) {
        let newBuilding = _.last(this._playerInfoService.getPlayerState().underConstruction);
        newBuilding.site = this._cardFactoryService.getCardSite(fPile.foundation.role);
        this.decrementActions();
    }

    removeFromUnderConstruction(card: IFoundation) {
        _.remove(this._playerInfoService.getPlayerState().underConstruction, card);
    }

    selectedBuilding: IFoundation = null;

    private buildingSubject = new Subject<ICard>();
    buildingSelected(foundation: IFoundation) {
        if (foundation === this.selectedBuilding) {
            this.selectedBuilding.building.selected = false;
            this.selectedBuilding = null;
        }
        else {
            if (this.selectedBuilding !== null)
                this.selectedBuilding.building.selected = false;
            foundation.building.selected = true;
            this.selectedBuilding = foundation;
        }
    }

    addMaterialToConstruction(card: ICard) {
        let foundation = this.selectedBuilding;
        foundation.building.selected = false;

        this._gameService.gameState.mode == eWorkerType.craftsman && _.remove(this.playerHand(), card);
        _.remove(foundation.materials, c => c.phantom);

        foundation.materials.push(card);

        this._messageService.addMaterialMessage(card, foundation.building);

        // Villa condition
        if (
            foundation.building.id == eCardEffect.villa &&
            this._gameService.gameState.mode == eWorkerType.architect
        ) {
            this.resolvingCard = true;
            this.actionPerformTrigger = eCardEffect.villa;
        }
        else if(
            this._isCompleted() || 
            this._scriptoriumCompleted(card)
        ) {
            this.removeFromUnderConstruction(foundation);
            this.addToCompleted(foundation);
        }
        else {
            this.decrementActions();
        }
        
        this.selectedBuilding = null;
    }

    private _isCompleted() {
        let type = this.selectedBuilding.site.id;
        let len = this.selectedBuilding.materials.length;
        switch(type) {
            case eCardEffect.rubble:
            case eCardEffect.wood:
                return len == 1 ? true: false;
            case eCardEffect.brick:
            case eCardEffect.concrete:
                return len == 2 ? true: false;
            case eCardEffect.marble:
            case eCardEffect.stone:
                return len == 3 ? true: false;
        }
    }

    private _scriptoriumCompleted(material: ICard) {
        return  material.role == eWorkerType.patron &&
                this.hasBuildingFunction(eCardEffect.scriptorium);
    }

    villaCanBeCompleted() {
        let villa = this.getVillaFromUnderConstruction();
        return  villa &&
                this.getNonPhantomCards(villa.materials).length > 0 &&
                !!(this._gameService.gameState.mode == eWorkerType.architect);
    }

    getNonPhantomCards(cards: ICard[]): ICard[] {
        return _.filter(cards, card => !card.phantom);
    }

    getVillaFromUnderConstruction() {
        return _.find(
            this._playerInfoService.getPlayerState().underConstruction, 
            foundation => foundation.building.id == eCardEffect.villa
        );
    }

    private hoverNewBuildingSubject = new Subject<ICard>();
    onNewBuildingHover() {
        return this.hoverNewBuildingSubject.asObservable();
    }

    cardIsHoveredNewBuilding(card: ICard) {
        this.hoverNewBuildingSubject.next(card);
    }

    private hoverAddMaterialSubject = new Subject<ICard>();
    onAddMaterialHover() {
        return this.hoverAddMaterialSubject.asObservable();
    }

    cardIsHoveredAddMaterial = (card: ICard) => {
        this.hoverAddMaterialSubject.next(card);
    }

    private notHoverSubject = new Subject<ICard>();
    onNotHover() {
        return this.notHoverSubject.asObservable();
    }

    cardIsNotHovered = (card: ICard) => {
        this.notHoverSubject.next(card);
    }

    /* UTILITY FUNCTIONS */
    
    private latrineSubject = new Subject<any>();
    latrineTriggered = () => {
        this.latrineSubject.next();
    }

    onLatrineTriggered = () => {
        return this.latrineSubject.asObservable();
    }

    private _gateCondition() {
        return _.find(this._playerInfoService.getPlayerState().underConstruction, f => f.building.role == eWorkerType.patron)
    }

    cardCanInteractAsMaterial(card: ICard) {
        let mode = this._gameService.gameState.mode;

        if (mode ===  eWorkerType.craftsman || mode === eWorkerType.architect) {
            if (this.selectedBuilding) {
                // Road condition
                if (this.selectedBuilding.building.role === eWorkerType.merchant &&
                    this.hasBuildingFunction(eCardEffect.road)) return true;
                // Tower condition
                if (this.hasBuildingFunction(eCardEffect.tower) && card.role === eWorkerType.laborer) return true;
                // Scriptorim condition
                if (this.hasBuildingFunction(eCardEffect.scriptorium) && card.role === eWorkerType.patron) return true;
                // Statue condition
                if (this.selectedBuilding.building.id === eCardEffect.statue && 
                    (card.role === eWorkerType.patron || card.role === this.selectedBuilding.site.role)) return true;
                // Normal condition
                return this.selectedBuilding.site.role === card.role;
            }
            // Tower Site Condition
            else if (this.activeActionItem && this.foundationCost(card.role) > this.activeActionItem.numActions) {
                return false;
            }
            else return true;
        }
        else return false;
    }

    foundationCost = (workType: eWorkerType) => {
        let foundation = _.find(this._gameService.gameState.foundations, fPile => fPile.foundation.role === workType);
        return foundation.inTown == 0 ? this.hasBuildingFunction(eCardEffect.tower) ? 1 : 2 : 1;
    }

    
}