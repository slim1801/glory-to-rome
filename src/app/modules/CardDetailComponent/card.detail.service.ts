import { Injectable } from '@angular/core';

import { ICard, Card } from '../../common/card/card';

@Injectable()
export class CardDetailService {

    focusedCard = new Card();

    constructor() {
    }

    focusCard = (card: ICard) => {
        this.focusedCard.changeValues(card);
    }
}