import { Directive, Input, ElementRef, Renderer } from '@angular/core';

import { eCardSize } from './card';

const largeWidth = require('../../config/card.config.json').sprites.large.cardWidth;
const medWidth = require('../../config/card.config.json').sprites.medium.cardWidth;

@Directive({
    selector: '[cardGroup]'
})
export class CardGroupDirective {
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