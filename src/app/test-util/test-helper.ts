import { 
    TestBed,
    ComponentFixture
} from '@angular/core/testing';

export class TestHelper<T> {

    constructor(
        private fixture: ComponentFixture<T>
    ) {
    }

    getElement(selector: string) {
        return this.fixture.debugElement.nativeElement.querySelector(selector);
    }

    getElementText(selector: string) {
        return this.fixture.debugElement.nativeElement.querySelector(selector).innerText;
    }

    click(el: HTMLElement) {
        el.click();
        this.fixture.detectChanges();
    }
}