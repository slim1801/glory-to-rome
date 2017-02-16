import { 
    TestBed,
    ComponentFixture
} from '@angular/core/testing';

import { SocketService } from '../../common/socket.service';
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

    it('should show player joined in game list and join game', () => {
        let createButton = th.getElement('.create-game-button');
        th.click(createButton);

        expect(component.rooms.length).toBe(1);
        expect(component.rooms[0].players.length).toBe(1);

        let randomPlayer = {
            id: "1234567890",
            name: "Doug"
        };

        component.rooms[0].players[0] = randomPlayer
        component.rooms[0].host = randomPlayer;
        fixture.detectChanges();
        
        let joinButton = th.getElement('.join-room');
        th.click(joinButton);

        expect(component.rooms[0].players.length).toBe(2);

        let leaveRoomText = th.getElementText('.exit-game-text');
        expect(leaveRoomText).toBe('Leave Game');
    });

});