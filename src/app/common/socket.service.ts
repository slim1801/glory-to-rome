import * as _ from 'lodash';

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { ICard, eWorkerType, IFoundationPile } from './card/card';
import { CardFactoryService } from './card/card.factory.service';
import { GameService, IGameState, IRawGameState, eLegionaryStage } from './game.service';
import { PlayerInfoService, IPlayer, IPlayerState } from './player.info.service';
import { IMessage } from './message.service';

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
        private _playerInfoService: PlayerInfoService,
        private _cardFactoryService: CardFactoryService
    ){
        this.hostUrl = window.location.protocol + "//" + window.location.hostname + ":" + window.location.port;
        this.io = io(this.hostUrl);

        this.initSocketListeners(this.io);
    }

    private initCards(data) {
        this._cardFactoryService.createCards(data.deck);
        this._cardFactoryService.createCards(data.jacks);
        this._cardFactoryService.createCards(data.foundations);
    }

    protected initSocketListeners(io) {
        io.on("connected", data => {
            this._playerInfoService.player.id = data.uid;
            //this._playerInfoService.player.id = this.id;
        });
        io.on("cards created", data => {
            this.initCards(data);
        });
        io.on("room created", data => {
            this.roomID = data.id;
            this.roomCreatedSubject.next(data);
        });
        io.on("room changed", data => {
            this.roomChangedSubject.next(data);
        });
        io.on("game started", data => {
            this._onNext(this.gameStartedSubject, data);
        });
        io.on("on all players chosen", data => {
            this._onNext(this.allPlayersChosenSubject, data);
        });
        io.on("on action finished", data => {
            this._onNext(this.actionFinishedSubject, data);
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
        io.on("receive message", (message: IMessage) => {
            this.receiveMessageSubject.next(message);
        });
        io.on("on player chat", (text: string) => {
            this.playerChatSubject.next(text);
        });
        io.on("game ended", data => {
            this._onNext(this.gameEndedSubject, data);
        });
        io.on("on state changed", data => {
            this._onNext(null, data);
        });
        io.on("player disconnected", data => {
            this.playerDisconnectedSubject.next(data.id);
        });
        io.on("rejoin game", data => {
            this.playerRoomSubject.next();
        });
        io.on("restore state", data => {
            if (data && data.baseGameState && data.gameState) {
                this.initCards(data.baseGameState);
                this._onNext(this.gameStartedSubject, data.gameState);
            }
        });
        io.on("player rejoined", data => {
            this.playerRejoinedGameSubject.next(data.id);
        });
    }

    private _onNext(subject: Subject<IGameState>, data: IRawGameState) {
        if (data === null) return;
        
        this._gameService.processGameState(data);
        this._playerInfoService.setPlayerState(this._gameService.gameState);
        subject && subject.next(this._gameService.gameState);
    }

    createRoom = (params: ICreateRoomParams) =>  {
        this.io.emit('create', params);
    }

    joinRoom = (room: IRoom, player: IPlayer) => {
        this.io.emit("join room", {
            room, player
        });
    }

    leaveRoom = (room: IRoom, player: IPlayer) => {
        this.io.emit("leave room", {
            room, player
        })
    }

    actionFinished = (card: ICard) => {
        this.io.emit("action finished", {
            card,
            gameState: this._gameService.gameState
        });
    }

    think = () => {
        this.io.emit("think", {
            gameState: this._gameService.gameState
        });
    }

    startGame = (room: IRoom) => {
        this.io.emit("start game", { room });
    }
    
    endGame = () => {
        this.io.emit("end game", {
            gameState: this._gameService.gameState
        });
    }

    getAllRooms = () => {
        this.io.emit("all rooms");
    }

    turnEnd = () => {
        this.io.emit("turn end", {
            gameState: this._gameService.gameState
        });
    }

    romeDemands = () => {
        this._gameService.gameState.legionaryStage = eLegionaryStage.romeDemanding;
        this.io.emit("rome demands", {
            gameState: this._gameService.gameState
        });
    }

    extortMaterial = () => {
        let pState = this._playerInfoService.getPlayerState();
        pState.hasLooted = true;
        this._gameService.gameState.legionaryStage = eLegionaryStage.takeFromPool;

        _.forEach(pState.loot, card => {
            card.selected = false;
        });

        this.io.emit("extort material", {
            gameState: this._gameService.gameState
        });
    }

    sendMessage(message: IMessage) {
        this.io.emit("send message", {
            message
        });
    }

    sendPlayerChat(text: string) {
        this.io.emit("player chat", {
            text
        });
    }

    stateChanged() {
        this.io.emit("state changed", {
            gameState: this._gameService.gameState
        });
    }

    rejoinGame() {
        this.io.emit("rejoin game");
    }

    private roomCreatedSubject = new Subject<IRoom>();
    onRoomCreated = () => {
        return this.roomCreatedSubject.asObservable();
    }
    
    private playerRoomSubject = new Subject<void>();
    onPlayerRejoined = () => {
        return this.playerRoomSubject.asObservable();
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

    private allPlayersChosenSubject = new Subject<IGameState>();
    onAllPlayersChosen = () => {
        return this.allPlayersChosenSubject.asObservable();
    }

    private actionFinishedSubject = new Subject<IGameState>();
    onActionFinished = () => {
        return this.actionFinishedSubject.asObservable();
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

    private receiveMessageSubject = new Subject<IMessage>();
    onReceiveMessage = () => {
        return this.receiveMessageSubject.asObservable();
    }

    private playerChatSubject = new Subject<string>();
    onPlayerChat = () => {
        return this.playerChatSubject.asObservable();
    }

    private playerDisconnectedSubject = new Subject<string>();
    onPlayerDisconnected = () => {
        return this.playerDisconnectedSubject.asObservable();
    }

    private playerRejoinedGameSubject = new Subject<string>();
    onPlayerRejoinedGame = () => {
        return this.playerRejoinedGameSubject.asObservable();
    }
}