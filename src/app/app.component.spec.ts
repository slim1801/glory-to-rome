import { TestBed, ComponentFixture } from '@angular/core/testing';

import { AppComponent } from './app.component';

describe('TEST', () => {

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ AppComponent ]
        });
    });

    // it('should say HELLO WORLD!', () => {
    //     let fixture = TestBed.createComponent(AppComponent);
    //     fixture.detectChanges();

    //     let title = fixture.debugElement.componentInstance.title;
    //     expect(title).toBe('HELLO WORLD!');
    // });

    // it('should show when button is clicked', () => {
    //     let fixture = TestBed.createComponent(AppComponent);
    //     fixture.detectChanges();
    //     let component = fixture.componentInstance;

    //     let button: HTMLElement = fixture.debugElement.nativeElement.querySelector('button');
    //     button.click();

    //     fixture.detectChanges();
    //     let shown = fixture.debugElement.nativeElement.querySelector('.shown');

    //     expect(shown.innerText).toBe('YOOO!');
    // });

    // it('should say TEST', () => {
    //     let fixture = TestBed.createComponent(TestComponent);
    //     fixture.detectChanges();

    //     let title = fixture.debugElement.componentInstance.title;
    //     expect(title).toBe('TEST');
    // });

});