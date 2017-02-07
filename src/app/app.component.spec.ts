import { TestBed } from '@angular/core/testing';

import { AppComponent } from './app.component';

describe('TEST', () => {

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [AppComponent],
        });
    });

    it('should say HELLO WORLD!', () => {
        let fixture = TestBed.createComponent(AppComponent);
        fixture.detectChanges();
        let title = fixture.debugElement.componentInstance.title;
        expect(title).toEqual('HELLO WORLD!');
    });
});