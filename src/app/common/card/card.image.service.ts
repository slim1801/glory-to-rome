import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { ICard } from './card';

@Injectable()
export class CardImageService {

    private cardHoverSubject = new Subject<ICard>();
    cardHover(card: ICard) {
        this.cardHoverSubject.next(card);
    }

    onCardHover() {
        return this.cardHoverSubject.asObservable();
    }
}