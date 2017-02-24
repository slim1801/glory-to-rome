import { find } from 'lodash';

import { 
    TestBed,
    ComponentFixture
} from '@angular/core/testing';

import { eCardEffect } from '../common/card/card';

export class TestHelper<T> {

    constructor(
        private fixture: ComponentFixture<T>
    ) {
    }

    getElement(selector: string): HTMLElement {
        return this.fixture.debugElement.nativeElement.querySelector(selector);
    }

    getElements(selector: string): HTMLElement[] {
        return this.fixture.debugElement.nativeElement.querySelectorAll(selector);
    }

    getElementText(selector: string) {
        return this.fixture.debugElement.nativeElement.querySelector(selector).innerText;
    }

    click(el: HTMLElement | string) {
        if (el instanceof HTMLElement)
            el.click();
        else if (typeof el === 'string') {
            this.getElement(el).click();
        }
        this.fixture.detectChanges();
    }
}