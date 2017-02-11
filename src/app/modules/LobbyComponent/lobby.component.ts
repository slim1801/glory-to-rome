import * as _ from 'lodash';

import { Component } from '@angular/core';

import { GameService } from '../../common/game.service';
import { SocketService, IRoom } from '../../common/socket.service';
import { PlayerInfoService } from '../../common/player.info.service';

const gloryToRomeLogo = require('../../assets/glory-to-rome-logo.png');

@Component({
    selector: 'lobby-component',
    templateUrl: './lobby.template.html',
    styleUrls: ['./lobby.styles.css']
})
export class LobbyComponent {

    logoURL = gloryToRomeLogo;

    rooms: IRoom[] = [];
    room: IRoom;

    playerChoices = [{
        players: 2,
        selected: true
    },{
        players: 3,
        selected: false
    },{
        players: 4,
        selected: false
    },{
        players: 5,
        selected: false
    }];

    constructor(
        private _playerInfoService: PlayerInfoService,
        private _socketService: SocketService,
        private _gameService: GameService
    ) {
        this._initListeners();
    }

    private _initListeners() {
        let skt = this._socketService;
        skt.onRoomChanged().subscribe(rooms => {
            this.rooms = rooms;
        });
        skt.onRoomCreated().subscribe(room => {
            this.room = room;
        });
        skt.getAllRooms();
    }

    nameEditIconVisible = false;
    nameInputHover = () => {
        this.nameEditIconVisible = true;
    }
    nameInputLeave = () => {
        this.nameEditIconVisible = false;
    }

    selectNumPlayers = (index: number) => {
        _.forEach(this.playerChoices, (choice, i) => {
            choice.selected = !!(i == index);
        });
    }

    getSelectedNumPlayers() {
        return _.find(this.playerChoices, (choice, i) => choice.selected);
    }

    createRoomClick = () => {
        this._socketService.createRoom({
            players: this.getSelectedNumPlayers().players,
            player: this._playerInfoService.player
        });
    }

    joinGame = (room: IRoom) => {
        room.players.push(this._playerInfoService.player);
        this._socketService.joinRoom(room, this._playerInfoService.player);
    }

    leaveRoom = (room: IRoom) => {
        _.remove(room.players, player => player.id == this._playerInfoService.player.id);
        this._socketService.leaveRoom(room, this._playerInfoService.player);
    }

    startGame = (room: IRoom) => {
        let deck = this._gameService.createDeck();
        this._socketService.startGame(room, deck);
    }

    hideJoinButton = (room: IRoom) => {
        return room.host.id == this._playerInfoService.player.id || this._inRoom(room) ? true : false;
    }

    roomIsFull = (room: IRoom) => {
        return room.numPlayers == room.players.length && !this._inRoom(room);
    }

    private _inRoom(room: IRoom) {
        return _.find(room.players, player => player.id == this._playerInfoService.player.id);
    }
}