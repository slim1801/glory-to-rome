import { Component } from '@angular/core';

import { ICard, Card, eCardSize } from '../../common/card/card';
import { CardImageService } from '../../common/card/card.image.service'

@Component({
    selector: 'card-detail',
    templateUrl: './card.detail.template.html',
    styleUrls: ['./card.detail.styles.css']
})
export class CardDetailComponent {

    private card: ICard;
    private size = eCardSize.large;

    constructor(
        private _cardImageService: CardImageService
    ) {
        this.card = new Card();
        this._initListeners();
    }

    private _initListeners() {
        this._cardImageService.onCardHover().subscribe(card => {
            this.card.changeValues(card);
        })
    }
    
}