import * as _ from 'lodash';
import {
    AfterContentInit,
    Component,
    DoCheck,
    HostListener,
    Input,
    KeyValueDiffers,
    OnChanges,
    SimpleChanges
} from '@angular/core';

export interface ICustomCardSize {
    width: number;
    height: number;
    offsetX: number;
    offsetY: number;
}

import { ICard, eCardSize, eWorkerType } from './card';
import { CardFactoryService } from './card.factory.service';
import { CardImageService } from './card.image.service';

const cardSpriteLarge = require('../../assets/large/card-sprite.jpg');
const cardSpriteLarge2 = require('../../assets/large/card-sprite2.jpg');

const cardSpriteMed = require('../../assets/medium/card-sprite.jpg');
const cardSpriteMed2 = require('../../assets/medium/card-sprite2.jpg');

const cardConfig = require('../../config/card.config.json');

@Component({
    selector: 'card-image',
    template: `
        <div [ngClass]="backgroundClass">
            <div
                [class.card-sprite-large]="isLarge()"
                [class.card-sprite-medium]="isMedium()"
                class="card-sprite"
                [ngStyle]="cardStyle()"
                [class.interactable]="interactable && !(card && card.selected)"
                [class.selected]="card && card.selected"
                [style.cursor]="interactable ? 'pointer' : 'default'"
                [style.opacity]="card && card.phantom ? 0.1 : ''">
                <div *ngIf="card && card.role === 6" style="height:100%;padding:8px;">
                    <div style="border:3px solid white;height:100%"></div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .card-sprite {
            border: 0;
        }
        .card-sprite-large {
            width: 216px;
            height: 301px;
            box-shadow: inset 0 0 6px 6px black;
        }
        .card-sprite-medium {
            width: 89px;
            height: 123.8px;
            box-shadow: inset 0 0 4px 4px black;
        }
        .interactable {
            box-shadow: inset 0 0 4px 4px #F89406;
        }
        .interactable:hover {
            opacity: 0.8; !important;
        }

        .selected {
            box-shadow: inset 0 0 4px 4px #22A7F0;
        }

        .white-background {
            background-color: white;
        }
        .architect-option {
            background-color: #5F5F5F;
        }
        .craftsman-option {
            background-color: #1E824C;
        }
        .laborer-option {
            background-color: #F5AB35;
        }
        .legionary-option {
            background-color: #CF000F;
        }
        .merchant-option {
            background-color: #22A7F0;
        }
        .patron-option {
            background-color: #8E44AD;
        }
  `]
})
export class CardImageComponent implements OnChanges, DoCheck, AfterContentInit {

    spriteUrl;
    offsetX;
    offsetY;
    width;
    height;

    style = {};
    backgroundClass = 'white-background';

    classMap = [
        'architect-option',
        'craftsman-option',
        'laborer-option',
        'legionary-option',
        'merchant-option',
        'patron-option'
    ];

    x = 0;
    y = 0;

    @Input('card') private card: ICard;
    @Input('size') private size: eCardSize;
    @Input('interactable') private interactable;
    @Input('invert') private invert;
    @Input('customSize') private customSize: ICustomCardSize;
    differ: any;

    constructor(
        private differs: KeyValueDiffers,
        private _cardImageService: CardImageService
    ) {
		this.differ = differs.find({}).create(null);
    }

    private isLarge() {
        return this.size === eCardSize.large && !this.customSize;
    }
    private isMedium() {
        return this.size === eCardSize.medium && !this.customSize;
    }

    private _formatCardImage() {
        if (this.card) {
            if (this.card.title) {

                if (this.size == eCardSize.large) {
                    this.spriteUrl = this.card.asset ? cardSpriteLarge2 : cardSpriteLarge;
                }
                else {
                    this.spriteUrl = this.card.asset ? cardSpriteMed2 : cardSpriteMed;
                }

                this.x = this.offsetX - this.card.x * this.width;
                this.y = this.offsetY - this.card.y * this.height;

                if (this.customSize) {
                    this.x = this.x - this.customSize.offsetX;
                    this.y = this.y - this.customSize.offsetY;
                }

                this.style = {
                    'background': 'url(' + this.spriteUrl + ') ' + this.x + 'px ' + this.y + 'px',
                }

                if (this.customSize) {
                    _.extend(this.style, {
                        height: this.customSize.height + 'px',
                        width: this.customSize.width + 'px'
                    });
                }

                if (this.card.role == eWorkerType.jack && this.invert) {
                    _.extend(this.style, {
                        'mix-blend-mode': 'multiply',
                        filter: 'invert()'
                    });
                    this.backgroundClass = this.classMap[this.card.mode];
                }
                return;
            }
        }
        this.style =  {
            'background': 'white'
        }
    }

    ngAfterContentInit() {
        switch(this.size) {
            case eCardSize.large:
                let size = cardConfig.sprites.large;
                this.offsetX = size.cardOffsetH;
                this.offsetY = size.cardOffsetV;
                this.width = size.cardWidth;
                this.height = size.cardHeight;
                break;
            case eCardSize.medium:
                let med = cardConfig.sprites.medium;
                this.offsetX = med.cardOffsetH;
                this.offsetY = med.cardOffsetV;
                this.width = med.cardWidth;
                this.height = med.cardHeight;
                break;
        }
        this._formatCardImage();
    }

    ngDoCheck() {
        let changes = this.differ.diff(this.card);

        if (changes) {
            this._formatCardImage();
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        this._formatCardImage()
    }

    cardStyle() {
        return this.style;
    }

    @HostListener('mouseover')
    onCardHover(event: MouseEvent) {
        this._cardImageService.cardHover(this.card)
    }

}