import { Injectable } from '@angular/core';
import {
    ICard,
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
    
    getCard = (id: eCardEffect): ICard => this.cardArray[id];
    getCardByName = (title: string) => this.cardDictionary[title];
    getJack = (): ICard => new Card(cardConfig.jack);

    createCard(cardID: eCardEffect) {
        return new Card(this.cards[cardID]);
    }

    createFoundation(card: ICard, siteType: eWorkerType, materials: ICard[]): IFoundation {
        return {
            building: card,
            site: this.getCardSite(siteType),
            materials
        }
    }

    createCompletedFoundation(card: ICard, siteType: eWorkerType, materials: ICard[], stairway?: boolean): ICompletedFoundation {
        return _.extend({}, this.createFoundation(card, siteType, materials), { stairway: stairway ? true : false });
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

    getCardSite(type: eWorkerType) {
        switch(type) {
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

    getRoleFromType(type: eWorkerType) {
        switch(type) {
            case eWorkerType.architect: return 'architect';
            case eWorkerType.craftsman: return 'craftsman';
            case eWorkerType.jack: return 'jack';
            case eWorkerType.laborer: return 'laborer';
            case eWorkerType.legionary: return 'legionary';
            case eWorkerType.merchant: return 'merchant';
            case eWorkerType.patron: return 'patron';
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