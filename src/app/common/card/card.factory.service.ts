import { Injectable } from '@angular/core';
import { ICard, ICardData, Card, eCardSize, eCardEffect, eWorkerType } from './card';

import * as _ from 'lodash';
const cardConfig = require('../../config/card.config.json');

@Injectable()
export class CardFactoryService {

    cards: ICardData[];
    cardArray: ICard[];
    cardDictionary: Object = {};
    jackCard: ICard;
    foundationCards: ICard[];

    constructor() {
        this._init();
    }

    private _init() {
        this.cards = cardConfig.cards;
        this._initCards();
    }

    private _initCards() {
        this.cardArray = _.map(this.cards, card => {
            let curr_card = new Card(card);
            //Add to Dictionary
            this.cardDictionary[card.title] = curr_card;
            return curr_card;
        });

        this.jackCard = new Card(cardConfig.jack);

        let fCards = cardConfig.foundations;
        this.foundationCards = [
            new Card(fCards.wood),
            new Card(fCards.rubble),
            new Card(fCards.brick),
            new Card(fCards.concrete),
            new Card(fCards.marble),
            new Card(fCards.stone)
        ]
        _.forEach(this.foundationCards, fCard => {
            this.cardDictionary[fCard.title] = _.assign(fCard);
        });
    }

    getCardArray = (): ICard[] => _.assign(this.cardArray);
    getCard = (id: eCardEffect): ICard => this.cardArray[id];
    getCardByName = (title: string) => this.cardDictionary[title];
    getJack = (): ICard => _.clone(this.jackCard);

    getCardHeight(height: eCardSize) {
        switch(height) {
            case eCardSize.medium:
                return cardConfig.sprites.medium.cardHeight;
            case eCardSize.large:
                return cardConfig.sprites.large.cardHeight;
        }
    }

    getCardWidth(width: eCardSize) {
        switch(width) {
            case eCardSize.medium:
                return cardConfig.sprites.medium.cardWidth;
            case eCardSize.large:
                return cardConfig.sprites.large.cardWidth;
        }
    }

    getCardSite(card: ICard) {
        switch(card.role) {
            case eWorkerType.architect:
                return this.cardDictionary['Concrete'];
            case eWorkerType.craftsman:
                return this.cardDictionary['Wood'];
            case eWorkerType.laborer:
                return this.cardDictionary['Rubble'];
            case eWorkerType.legionary:
                return this.cardDictionary['Brick'];
            case eWorkerType.merchant:
                return this.cardDictionary['Stone'];
            case eWorkerType.patron:
                return this.cardDictionary['Marble'];
        }
    }

    getRole(card: ICard) {
        switch(card.role) {
            case eWorkerType.architect: return 'architect';
            case eWorkerType.craftsman: return 'craftsman';
            case eWorkerType.jack: return 'jack';
            case eWorkerType.laborer: return 'laborer';
            case eWorkerType.legionary: return 'legionary';
            case eWorkerType.merchant: return 'merchant';
            case eWorkerType.patron: return 'patron';
        }
    }
}