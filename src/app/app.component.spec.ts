import { TestBed, ComponentFixture } from '@angular/core/testing';

import { LobbyModule } from './modules/LobbyComponent/lobby.module';

import { AppComponent } from './app.component';

describe('TEST', () => {
    
    let fixture;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ LobbyModule ],
            declarations: [ AppComponent ]
        });
        fixture = TestBed.createComponent(AppComponent);
        fixture.detectChanges();
    });

    it('should say HELLO WORLD!', () => {
        let pTitle = fixture.debugElement.nativeElement.querySelector('.player-name-title');
        expect(pTitle.innerText).toBe('Player Name');
    });

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