import { 
    TestBed,
    ComponentFixture
} from '@angular/core/testing';

import { SocketService, IRoom } from '../../common/socket.service';
import { MockSocketService } from '../../test-util/socket.service.mock';

import { LobbyImports } from './lobby.module';
import { LobbyComponent } from './lobby.component';

import { TestHelper } from '../../test-util/test-helper';

import { IPlayer } from '../../common/player.info.service';

import * as $ from 'jquery';

describe('Test Lobby Component', () => {

    let fixture: ComponentFixture<LobbyComponent>;
    let component: LobbyComponent;

    let th: TestHelper<LobbyComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: LobbyImports,
            providers: [
                { provide: SocketService, useClass: MockSocketService }
            ],
            declarations: [ LobbyComponent ]
        });
        fixture = TestBed.createComponent(LobbyComponent);
        fixture.detectChanges();

        th = new TestHelper<LobbyComponent>(fixture);
        component = fixture.componentInstance;
    });

    it('should display text properly', () => {
        expect(th.getElementText('.player-name-title')).toBe('Player Name');
        expect(th.getElementText('.create-game-title')).toBe('Create Game');
    });

    it('should show pencil icon in input box when mouse over', () => {
        let input = th.getElement('.name-input');

        let $nameCont = component.nameInputHover();
        fixture.detectChanges();

        expect(th.getElement('.right-input-icon')).not.toBeNull();
    });

    it('should show player joined in game list', () => {
        let createButton = th.getElement('.create-game-button');
        th.click(createButton);

        expect(component.rooms.length).toBe(1);
    });

    it('should join game when player clicks on Join Game', () => {

        let joinButton = th.getElement('.join-room');
        th.click(joinButton);

        expect(component.rooms[0].players.length).toBe(2);
    });

    // it('should say TEST', () => {
    //     let fixture = TestBed.createComponent(TestComponent);
    //     fixture.detectChanges();

    //     let title = fixture.debugElement.componentInstance.title;
    //     expect(title).toBe('TEST');
    // });

});