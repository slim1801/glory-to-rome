import * as _ from 'lodash';

import { Injectable } from '@angular/core';

const userConfig = require('../config/user.config.json');

import { ICard, IFoundation, ICompletedFoundation } from './card/card';
import { IGameState, eActions } from './game.service';

export interface IPlayer {
    id: string;
    name: string;
}

export interface IPlayerState {
    player: IPlayer;
    completed: ICompletedFoundation[];
    stockpile: ICard[];
    underConstruction: IFoundation[];
    vault: ICard[];
    clientelles: ICard[];
    functionAvailable: ICard[];

    influence: number;
    cardsInHand: number;
    maxHandSize: number;
    maxVault: number;
    maxClientelles: number;

    actionCard: ICard;
    action: eActions;
    additionalActions: ICard[];
    jackCards: ICard[];
    cardsForJack: number,

    loot: Array<ICard>;
    hasLooted: boolean;
    gloryToRome: boolean;
}

@Injectable()
export class PlayerInfoService {

    player: IPlayer = {
        id: null,
        name: "Player1"
    };

    private playerState: IPlayerState = {
        player: this.player,
        completed: [],
        stockpile: [],
        underConstruction: [],
        vault: [],
        clientelles: [],
        functionAvailable: [],
        
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