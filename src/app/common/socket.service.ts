import * as _ from 'lodash';

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { ICard, eWorkerType, IFoundationPile } from './card/card';
import { GameService, IGameState, eLegionaryStage } from './game.service';
import { PlayerInfoService, IPlayer, IPlayerState } from './player.info.service';

const io = require('socket.io-client');

export interface ICreateRoomParams {
    players: number;
    player: IPlayer;
}

export interface IRoom {
    id: string;
    numPlayers: number;
    host: IPlayer;
    players: IPlayer[];
}

@Injectable()
export class SocketService {

    hostUrl: string;
    io = null;
    roomID: string = null;

    constructor(
        private _gameService: GameService,
        private _playerInfoService: PlayerInfoService
    ){
        this.hostUrl = window.location.protocol + "//" + window.location.hostname + ":" + window.location.port;
        this.io = io(this.hostUrl);

        this.initSocketListeners(this.io);
    }

    protected initSocketListeners(io) {
        
        io.on("room created", data => {
            this.roomID = data.id;
            this.roomCreatedSubject.next(data);
        });
        io.on("room changed", data => {
            this.roomChangedSubject.next(data);
        });
        io.on("game started", data => {
            this._gameService.gameState = data;
            this._onNext(this.gameStartedSubject, data);
        });
        io.on("on card played", data => {
            this._onNext(this.cardPlayedSubject, data);
        });
        io.on("on turn end", data => {
            this._onNext(this.turnEndSubject, data);
        });
        io.on("on turn started", data => {
            this._onNext(this.turnStartedSubject, data);
        });
        io.on("on rome demands", data => {
            this._onNext(this.romeDemandsSubject, data);
        });
        io.on("on extort material", data => {
            this._onNext(this.extortMaterialSubject, data);
        });
        io.on("game ended", data => {
            this._onNext(this.gameEndedSubject, data);
        });
    }

    private _onNext(subject: Subject<IGameState>, data: IGameState) {
        // CONSOLE LOG
        console.log(data);
        let gState = this._gameService.gameState;
        _.extend(gState, data);
        this._playerInfoService.setPlayerState(gState)
        subject.next(data);
    }

    createRoom = (params: ICreateRoomParams) =>  {
        this.io.emit('create', params);
    }

    joinRoom = (room: IRoom, player: IPlayer) => {
        this.roomID = room.id;
        this.io.emit("join room", {
            room, player
        });
    }

    leaveRoom = (room: IRoom, player: IPlayer) => {
        this.io.emit("leave room", {
            room, player
        })
    }

    cardPlayed = (card: ICard, mode: eWorkerType) => {
        this._gameService.gameState.mode = mode;

        this.io.emit("card played", {
            roomID: this.roomID,
            card,
            gameState: this._gameService.gameState
        });
    }

    think = () => {
        this.io.emit("think", {
            roomID: this.roomID,
            gameState: this._gameService.gameState
        });
    }

    startGame = (room: IRoom, deck: ICard[]) => {
        this.io.emit("start game", { room, deck });
    }
    
    endGame = () => {
        this.io.emit("end game", {
            roomID: this.roomID,
            gameState: this._gameService.gameState
        });
    }

    getAllRooms = () => {
        this.io.emit("all rooms");
    }

    turnEnd = () => {
        this.io.emit("turn end", {
            roomID: this.roomID,
            gameState: this._gameService.gameState
        });
    }

    romeDemands = () => {
        this._gameService.gameState.legionaryStage = eLegionaryStage.romeDemanding;
        this.io.emit("rome demands", {
            roomID: this.roomID,
            gameState: this._gameService.gameState
        })
    }

    extortMaterial = () => {
        let pState = this._playerInfoService.getPlayerState();
        pState.hasLooted = true;

        _.forEach(pState.loot, card => {
            card.selected = false;
        });

        this.io.emit("extort material", {
            roomID: this.roomID,
            gameState: this._gameService.gameState
        })
    }

    private roomCreatedSubject = new Subject<IRoom>();
    onRoomCreated = () => {
        return this.roomCreatedSubject.asObservable();
    }

    private roomChangedSubject = new Subject<IRoom[]>();
    onRoomChanged = () => {
        return this.roomChangedSubject.asObservable();
    }

    private roomJoinedSubject = new Subject<IRoom>();
    onRoomJoined = () => {
        return this.roomJoinedSubject.asObservable();
    }

    private gameStartedSubject = new Subject<IGameState>();
    onGameStarted = () => {
        return this.gameStartedSubject.asObservable();
    }

    private cardPlayedSubject = new Subject<IGameState>();
    onCardPlayed = () => {
        return this.cardPlayedSubject.asObservable();
    }

    private turnStartedSubject = new Subject<IGameState>();
    onTurnStarted = () => {
        return this.turnStartedSubject.asObservable();
    }

    private turnEndSubject = new Subject<IGameState>();
    onTurnEnd = () => {
        return this.turnEndSubject.asObservable();
    }
    
    private romeDemandsSubject = new Subject<IGameState>();
    onRomeDemands = () => {
        return this.romeDemandsSubject.asObservable();
    }
    
    private extortMaterialSubject = new Subject<IGameState>();
    onExtortMaterial = () => {
        return this.extortMaterialSubject.asObservable();
    }

    private gameEndedSubject = new Subject<IGameState>();
    onGameEnded = () => {
        return this.gameEndedSubject.asObservable();
    }
}