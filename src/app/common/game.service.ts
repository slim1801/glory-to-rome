import * as _ from 'lodash';

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { ICard, IFoundationPile, ICardPlayed, eCardEffect, eWorkerType, Card } from './card/card';
import { CardFactoryService } from './card/card.factory.service';
import { PlayerInfoService, IPlayer, IPlayerState } from './player.info.service';
import { SocketService } from './socket.service';

const userConfig = require('../config/user.config.json');

export enum eActionMode {
    actionCardMode,
    resolveCardMode,
    turnEndMode
}

export enum eActions {
    playCard,
    think
}

export enum eLegionaryStage {
    declare,
    romeDemanding,
    bridge,
    coliseum,
    takeFromPool
}

export interface IGameState {
    playerLead: IPlayer;
    playerTurn: number;
    playerOrder: IPlayer[];
    startingHand: ICard[][];
    playerStates: IPlayerState[];

    deck: ICard[];
    pool: ICard[];
    jacks: number;
    foundations: IFoundationPile[];
    publicBuildings: ICard[];

    card: ICard;
    mode: eWorkerType;

    actionMode: eActionMode;
    actions: Array<eActions>;
    actionTriggers: eCardEffect[];

    romeDemands: ICard[];
    legionaryStage: eLegionaryStage;
}

@Injectable()
export class GameService {

    players = 2;

    playedCards: ICard[] = [];

    gameState: IGameState;

    constructor(
        private _cardFactoryService: CardFactoryService,
        private _playerInfoService: PlayerInfoService
    ) {
        this._init();
    }

    private _init() {
        this.deckList = this._cardFactoryService.getCardArray();
    }
    
    playerHasActioned(card: ICard) {
        this.playedCards.push(card);

        // TODO: Integrate with multiplayer
        if (this.playedCards.length == 1) {
            this.playedCards.splice(0, this.playedCards.length);
        }
    }

    updateGameState() {
        this._playerInfoService.updatePlayerState(this.gameState);
    }

    romeDemands(card: ICard) {
        this.gameState.romeDemands.push(card);
    }

    getPlayerIndex(pState: IPlayerState) {
        return _.findLastIndex(this.gameState.playerOrder, player => player.id == pState.player.id);
    }

    /* POOL SECTION */

    addToPool(cards: ICard[]) {
        _.forEach(cards, card => {
            this.gameState.pool.push(card);
        })
    }

    replacePool(cards: ICard[]) {
        this.gameState.pool = [];
        this.addToPool(cards);
    }

    removeFromPool(card: ICard) {
        _.remove(this.gameState.pool, card);
    }

    hasSameTypeInPool(type: eWorkerType) {
        return _.find(this.gameState.pool, card => card.role == type) ? true: false;
    }

    /* DECK SECTION */

    deckList: ICard[];

    createDeck() {
        let cards = this._cardFactoryService.cards;
        let deck = [];
        _.forEach(cards, card => {
            let count = card.count;
            for (let i = 0; i < count; i++) {
                deck.push(new Card(card));
            }
        });
        return _.shuffle(deck);
    }

    getDeck() {
        return this.gameState.deck;
    }

    shuffleDeck() {
        this.gameState.deck = _.shuffle(this.gameState.deck);
    }

    getDeckSize() {
        return this.gameState.deck.length;
    }

    drawCards(numCards: number): ICard[] {
        if (this.gameState.deck.length === 0) {
            return null;
        }
        else {
            let drawn = this.gameState.deck.slice(0, numCards);
            for(let i = 0; i < numCards; i++) {
                this.gameState.deck.shift();
            }
            return drawn;
        }
    }

    drawJack() {
        this.gameState.jacks = this.gameState.jacks > 0 ? this.gameState.jacks - 1 : 0;
        return [this._cardFactoryService.getJack()];
    }

    addJack() {
        this.gameState.jacks = this.gameState.jacks < 6 ? this.gameState.jacks + 1 : 6;
    }

    drawStartGameCards(): ICard[] {
        return this.drawCards(4).concat(this._cardFactoryService.getJack());
    }

    /* FOUNDATION SECTION */

    foundationMap: Object = {};

    noMoreInTownFoundations = () => {
        return _.every(this.gameState.foundations, foundation => {
            return foundation.inTown == 0
        });
    }

    getNameOfAction(type: eWorkerType) {
        switch(type) {
            case eWorkerType.architect: return "architect";
            case eWorkerType.craftsman: return "craftsman";
            case eWorkerType.jack: return "jack";
            case eWorkerType.laborer: return "laborer";
            case eWorkerType.legionary: return "legionary";
            case eWorkerType.merchant: return "merchant";
            case eWorkerType.patron: return "patron";
        }
    }

    materialsToComplete(type: eWorkerType): number {
        switch(type) {
            case eWorkerType.craftsman:
            case eWorkerType.laborer:
                return 1;
            case eWorkerType.legionary:
            case eWorkerType.architect:
                return 2;
            case eWorkerType.patron:
            case eWorkerType.merchant:
                return 3;
        }
    }
}

export function removeFromList(card: ICard, cardArr: ICard[]) {
    for (let i = 0; i < cardArr.length; i++) {
        if (card.uid == cardArr[i].uid) {
            cardArr.splice(i, 1);
        }
    }
}