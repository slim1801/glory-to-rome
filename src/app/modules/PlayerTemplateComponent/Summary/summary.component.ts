import { Component, Input } from '@angular/core';
import { ICard } from '../../../common/card/card';

import { PlayerService } from '../../../common/player.service';
import { CardImageService } from '../../../common/card/card.image.service';

@Component({
    selector: 'summary-component',
    templateUrl: 'summary.component.html',
    styles: [`
        .summary-container {
            height: 200px;
            display: flex;
            padding: 5px;
            border: 2px solid grey;
        }
        .under-construction-section,
        .completed-section,
        .stockpile-section {
            flex: 1;
        }
        .summary-title {
            font-weight: bold;
        }
        .summary-list {
            overflow-x: scroll;
        }
    `]
})
export class SummaryComponent {

    constructor(
        private _cardImageService: CardImageService,
        private _playerService: PlayerService
    ) {

    }

    onTitleHover(card: ICard) {
        this._cardImageService.cardHover(card);
    }
}

@Component({
    selector: 'role-block-component',
    template: `
        <div class="block"
            [class.architect]="role == 0"
            [class.craftsman]="role == 1"
            [class.laborer]="role == 2"
            [class.legionary]="role == 3"
            [class.merchant]="role == 4"
            [class.patron]="role == 5">
        </div>
    `,
    styles: [`
        .block {
            width: 10px;
            height: 10px;
            border-radius: 2px;
            display: inline-block;
        }
    `]
})
export class RoleBlockComponent {
    @Input('role') private role;
}