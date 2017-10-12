import * as _ from 'lodash';

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { ICard, IRawCard, IFoundationPile, eCardEffect, eWorkerType, Card, IRawFoundationPile } from './card/card';
import { CardFactoryService } from './card/card.factory.service';
import { PlayerInfoService, IPlayer, IPlayerState, IRawPlayerState } from './player.info.service';
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
    playerStates: IPlayerState[];

    deck: ICard[];
    pool: ICard[];
    jacks: ICard[];
    foundations: IFoundationPile[];
    publicBuildings: ICard[];

    mode: eWorkerType;

    actionMode: eActionMode;
    actionTriggers: eCardEffect[];

    romeDemands: ICard[];
    legionaryStage: eLegionaryStage;
}

export interface IRawGameState {
    playerLead: IPlayer;
    playerTurn: number;
    playerOrder: IPlayer[];
    playerStates: IRawPlayerState[];

    deck: IRawCard[];
    pool: IRawCard[];
    jacks: number;
    foundations: IRawFoundationPile[];
    publicBuildings: ICard[];

    mode: eWorkerType;

    actionMode: eActionMode;
    actionTriggers: eCardEffect[];

    romeDemands: IRawCard[];
    legionaryStage: eLegionaryStage;
}

@Injectable()
export class GameService {

    players = 2;

    gameState: IGameState = {
        playerLead: null,
        playerTurn: 0,
        playerOrder: [],
        playerStates: [],
        deck: [],
        pool: [],
        jacks: [],
        foundations: [],
        publicBuildings: [],
        mode: null,
        actionMode: null,
        actionTriggers: [],
        romeDemands: [],
        legionaryStage: null
    };

    rawGameState: IRawGameState;

    constructor(
        private _cardFactoryService: CardFactoryService,
        private _playerInfoService: PlayerInfoService
    ) {

    }

    processGameState(data: IRawGameState) {
        _.extend(this.gameState, data);
        // Process Deck
        this.processCardArray(data.deck, this.gameState, "deck");
        // Process Pool
        this.processCardArray(data.pool, this.gameState, "pool");
        // Process Rome Demands
        this.processCardArray(data.romeDemands, this.gameState, "romeDemands");
        // Process Public Buildings
        this.processCardArray(data.publicBuildings, this.gameState, "publicBuildings");
        // Process Foundations
        _.forEach(data.foundations, (foundationPile, index) => {
            const foundationPiles = this.gameState.foundations[index];
            this.processCardArray(foundationPile.inTown, foundationPiles, "inTown");
            this.processCardArray(foundationPile.outOfTown, foundationPiles, "outOfTown");
        });
        // Process Player States
        _.forEach(data.playerStates, (pState, index) => {
            const playerState = this.gameState.playerStates[index];

            // Process hand
            this.processCardArray(pState.hand, playerState, "hand");
            // Process clientelles
            this.processCardArray(pState.clientelles, playerState, "clientelles");
            // Process stockpile
            this.processCardArray(pState.stockpile, playerState, "stockpile");
            // Process vault
            this.processCardArray(pState.vault, playerState, "vault");
            // Process function available
            this.processCardArray(pState.functionAvailable, playerState, "functionAvailable");
            // Process additional actions
            this.processCardArray(pState.additionalActions, playerState, "additionalActions");
            // Process jack cards
            this.processCardArray(pState.jackCards, playerState, "jackCards");
            // Process loot
            this.processCardArray(pState.loot, playerState, "loot");
            // Process completed foundation
            _.forEach(pState.completed, (completedFoundation, index2) => {
                const completed = pState.completed[index2];

                completed.building = this.extendCard(completedFoundation.building);
                this.processCardArray(completedFoundation.materials, completed, "materials");
                completed.site = this.extendCard(completedFoundation.site);
            });
            // Process completed foundation
            _.forEach(pState.underConstruction, (rawUnderCo, index2) => {
                const underCon = pState.underConstruction[index2];

                underCon.building = this.extendCard(rawUnderCo.building);
                this.processCardArray(rawUnderCo.materials, underCon, "materials");
                underCon.site = this.extendCard(rawUnderCo.site);
            });
            // Process action card
            if (pState.actionCard) {
                playerState.actionCard = this.extendCard(pState.actionCard);
            }
        });
    }

    private processCardArray(rawCardArray: IRawCard[], context: Object, key: string) {
        const newArray = [];
        _.forEach(rawCardArray, rawCard => {
            newArray.push(this.extendCard(rawCard));
        });
        context[key] = newArray;
    }

    private extendCard(rawCard: IRawCard) {
        return _.extend(this._cardFactoryService.getCardByUID(rawCard.uid), rawCard);
    }

    isPlayersTurn(playerID: string) {
        return this.gameState.playerOrder[this.gameState.playerTurn].id === playerID
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

    getPlayerFromId(id: string) {
        return _.find(this.gameState.playerStates, pState => pState.player.id === id);
    }

    /* POOL SECTION */

    addToPool(cards: ICard[]) {
        _.forEach(cards, card => {
            this.gameState.pool.push(card);
        })
    }

    removeFromPool(card: ICard) {
        _.remove(this.gameState.pool, card);
    }

    hasSameTypeInPool(type: eWorkerType) {
        return _.find(this.gameState.pool, card => card.role == type) ? true: false;
    }

    /* DECK SECTION */

    createDeck() {
        let cards = this._cardFactoryService.cards;
        let deck = [];
        _.forEach(cards, card => {
            let count = card.count;
            for (let i = 0; i < count; i++) {
                deck.push(this._cardFactoryService.createCard(card.id));
            }
        });
        return _.shuffle(deck);
    }

    drawCards(numCards: number): ICard[] {
        let drawn = this.gameState.deck.slice(0, numCards);
        // End game condition
        if (this.gameState.deck.length === 0) {
            return null;
        }

        for(let i = 0; i < numCards; i++) {
            this.gameState.deck.shift();
        }
        return drawn;
    }

    drawJack() {
        return this.gameState.jacks.slice(0,1);
    }

    addJack(card: ICard) {
        this.gameState.jacks.length < 6 &&
            this.gameState.jacks.push(card);
    }

    /* FOUNDATION SECTION */

    foundationMap: Object = {};

    noMoreInTownFoundations = () => {
        return _.every(this.gameState.foundations, foundation => {
            return foundation.inTown.length == 0
        });
    }

    getAvailableFoundation(role: eWorkerType) {
        const foundation = _.find(this.gameState.foundations, foundation => foundation.role === role);
        if (foundation.inTown.length > 0) {
            return foundation.inTown[0];
        }
        else {
            return foundation.outOfTown[0];
        }
    }

    hasFoundationToLay(wType: eWorkerType) {
        let foundation = _.find(this.gameState.foundations, foundationPile => foundationPile.role == wType);
        return foundation.outOfTown.length > 0
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

    private actionEndSubject = new Subject<void>();
    actionEnd() {
        this.gameState.mode = null;
        this.actionEndSubject.next();
    }

    onActionEnd() {
        return this.actionEndSubject.asObservable();
    }
}

export function removeFromList(card: ICard, cardArr: ICard[]) {
    for (let i = 0; i < cardArr.length; i++) {
        if (card.uid == cardArr[i].uid) {
            cardArr.splice(i, 1);
            i--;
        }
    }
}