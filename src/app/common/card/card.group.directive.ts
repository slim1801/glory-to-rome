import { Directive, Input, ElementRef, Renderer, OnInit } from '@angular/core';

import { eCardSize, eWorkerType } from './card';
import { CardFactoryService } from './card.factory.service';

const largeWidth = require('../../config/card.config.json').sprites.large.cardWidth;
const medWidth = require('../../config/card.config.json').sprites.medium.cardWidth;

@Directive({
    selector: '[cardGroup]'
})
export class CardGroupDirective implements OnInit {
    constructor(
        private el: ElementRef,
        private renderer: Renderer
    ) {
        this.el.nativeElement.style.position = 'absolute';
    }

    @Input() cardGroupIndex: number;
    @Input() cardGroupLength: number;
    @Input() size: eCardSize;

    @Input('cardGroup') cardGroupRef;

    ngDoCheck() {
        this.calcPosition();
    }

    ngOnInit() {
        this.calcPosition();
    }

    calcPosition() {
        let contWidth = this.cardGroupRef.clientWidth;
        let width = this.getWidth();
        let nativeEl = this.el.nativeElement;

        if (width * this.cardGroupLength > contWidth) {
            let offset = (contWidth - width) / (this.cardGroupLength - 1);
            nativeEl.style.left = (offset * this.cardGroupIndex) + 'px';
        }
        else {
            nativeEl.style.left = (width * this.cardGroupIndex) + 'px';
        }
    }

    getWidth() {
        switch(this.size) {
            case eCardSize.large: return largeWidth;
            case eCardSize.medium: return medWidth;
        }
    }
}

@Directive({
    selector: '[actionColor]'
})
export class ActionColorDirective implements OnInit {

    @Input() actionColor: eWorkerType;

    constructor(
        private el: ElementRef,
        private renderer: Renderer,

        private _cardFactoryService: CardFactoryService
    ) {
    }

    ngOnInit() {
        this.el.nativeElement.classList.add(
            this._cardFactoryService.getTextColor(this.actionColor)
        );
    }
}