import { Injectable } from '@angular/core';
import {
    ICard,
    IRawCard,
    ICardData,
    ICompletedFoundation,
    IFoundation,

    eCardEffect,
    eCardSize,
    eWorkerType,

    Card
} from './card';

import * as _ from 'lodash';
const cardConfig = require('../../config/card.config.json');

@Injectable()
export class CardFactoryService {

    cards: ICardData[];
    cardArray: ICard[] = [];
    cardDictionary: Object = {};
    jackCard: ICard;
    foundationCards: ICard[];

    cardDataArray: Object = {};

    constructor() {
        this._init();
    }

    private _init() {
        this.cards = cardConfig.cards;
        this._initCards();
    }

    private _initCards() {
        _.forEach(this.cards, card => {
            this.cardDataArray[card.id] = card;
        });
        this.cardDataArray[cardConfig.jack.id] = cardConfig.jack;

        _.forOwn(cardConfig.foundations, foundation => {
            this.cardDataArray[foundation.id] = foundation;
        })
    }

    private _uid() {
        return Math.random().toString(36).substring(7);
    }

    private createGameCard(rawCard: IRawCard, card: ICardData) {
        this.cardDictionary[rawCard.uid] = new Card(card, rawCard.uid);
    }

    createCards(rawCards: IRawCard[]) {
        _.forEach(rawCards, rawCard => {
            this.createGameCard(rawCard, this.cardDataArray[rawCard.id]);
        });
    }
    
    getCard = (id: eCardEffect): ICard => this.cardArray[id];
    getCardByName = (id: eCardEffect) => this.cardDictionary[id];
    getJack = (): ICard => new Card(cardConfig.jack);

    getCardByUID = (uid: string): ICard => this.cardDictionary[uid];

    getCardFromType(cardType: IRawCard) {
        return _.clone(this.cardDictionary[cardType.id]);
    }

    createCard(cardID: eCardEffect) {
        return new Card(this.cards[cardID]);
    }

    createFoundation(card: ICard, site: ICard, materials: ICard[]): IFoundation {
        return {
            building: card,
            site,
            materials
        }
    }

    createCompletedFoundation(card: ICard, siteCard: ICard, materials: ICard[], stairway?: boolean): ICompletedFoundation {
        return _.extend({}, this.createFoundation(card, siteCard, materials), { stairway: stairway ? true : false });
    }

    createCompletedFromFoundation(foundation: IFoundation, stairway?: boolean) {
        return _.extend({}, foundation, { stairway: stairway ? true : false });
    }

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

    getRoleFromType(type: eWorkerType) {
        switch(type) {
            case eWorkerType.architect: return 'architect';
            case eWorkerType.craftsman: return 'craftsman';
            case eWorkerType.jack: return 'jack';
            case eWorkerType.laborer: return 'laborer';
            case eWorkerType.legionary: return 'legionary';
            case eWorkerType.merchant: return 'merchant';
            case eWorkerType.patron: return 'patron';
            default: return "";
        }
    }

    getRoleFromId(cardEff: eCardEffect): eWorkerType {
        let card = _.find(this.cards, crd => crd.id === cardEff);
        return this.cards[cardEff].role;
    }

    getTextColor(type: eWorkerType) {
        switch(type) {
            case eWorkerType.architect: return 'architect-text';
            case eWorkerType.craftsman: return 'craftsman-text';
            case eWorkerType.laborer: return 'laborer-text';
            case eWorkerType.legionary: return 'legionary-text';
            case eWorkerType.merchant: return 'merchant-text';
            case eWorkerType.patron: return 'patron-text';
        }
    }

    mapMaterialName(wType: eWorkerType) {
        switch(wType) {
            case eWorkerType.architect: return "Concrete";
            case eWorkerType.craftsman: return "Wood";
            case eWorkerType.laborer: return "Rubble";
            case eWorkerType.legionary: return "Brick";
            case eWorkerType.merchant: return "Stone";
            case eWorkerType.patron: return "Marble";
        }
    }
}