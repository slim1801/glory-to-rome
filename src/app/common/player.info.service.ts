import * as _ from 'lodash';

import { Injectable } from '@angular/core';

const userConfig = require('../config/user.config.json');

import { ICard, IRawCard, IFoundation, IRawFoundation, ICompletedFoundation, IRawCompletedFoundation } from './card/card';
import { IGameState, eActions } from './game.service';

export interface IPlayer {
    id: string;
    name: string;
}

interface IBasePlayerState {
    player: IPlayer;
    
    influence: number;
    cardsInHand: number;
    maxHandSize: number;
    maxVault: number;
    maxClientelles: number;

    action: eActions;
    cardsForJack: number;

    hasLooted: boolean;
    gloryToRome: boolean;
}

export interface IPlayerState extends IBasePlayerState {
    completed: ICompletedFoundation[];
    stockpile: ICard[];
    underConstruction: IFoundation[];
    vault: ICard[];
    clientelles: ICard[];
    functionAvailable: ICard[];
    hand: ICard[],

    actionCard: ICard;
    additionalActions: ICard[];
    jackCards: ICard[];

    loot: ICard[];
}

export interface IRawPlayerState extends IBasePlayerState {
    completed: IRawCompletedFoundation[];
    stockpile: IRawCard[];
    underConstruction: IRawFoundation[];
    vault: IRawCard[];
    clientelles: IRawCard[];
    functionAvailable: IRawCard[];
    hand: IRawCard[],

    actionCard: IRawCard;
    additionalActions: IRawCard[];
    jackCards: IRawCard[];

    loot: IRawCard[];
}

@Injectable()
export class PlayerInfoService {

    player: IPlayer = {
        id: null,
        name: "Player1"
    };

    playerState: IPlayerState = {
        player: this.player,
        completed: [],
        stockpile: [],
        underConstruction: [],
        vault: [],
        clientelles: [],
        functionAvailable: [],
        hand: [],
        
        influence: 2,
        maxHandSize: 5,
        maxVault: 2,
        maxClientelles: 2,
        cardsInHand: 5,

        actionCard: null,
        action: null,
        additionalActions: [],
        jackCards: null,
        cardsForJack: userConfig.cardsToPlayJack,
        
        loot: [],
        hasLooted: false,
        gloryToRome: false
    };

    getPlayerState() {
        return this.playerState;
    }

    getPlayerHand() {
        return this.playerState.hand;
    }

    setPlayerState(gameState: IGameState) {
        let pState = this.getThisPlayer(gameState);
        _.extend(this.playerState, pState);
    }

    updatePlayerState(gameState: IGameState) {
        let pState = this.getThisPlayer(gameState);
        _.extend(pState, this.playerState);
    }

    saveActionCardToPlayerState(card: ICard) {
        this.playerState.actionCard = card;
    }

    saveCardsInHand(numCards: number) {
        this.playerState.cardsInHand = numCards;
    }

    private getThisPlayer(gameState: IGameState) {
        return _.find(gameState.playerStates, pState => pState.player.id == this.player.id);
    }

    isPlayersTurn: boolean = false;
    isPlayersLead: boolean = false;
    isFollowing: boolean = false;
}