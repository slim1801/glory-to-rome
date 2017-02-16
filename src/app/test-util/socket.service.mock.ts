import { SocketService } from '../common/socket.service';

import { GameService, IGameState, eLegionaryStage } from '../common/game.service';
import { PlayerInfoService, IPlayer, IPlayerState } from '../common/player.info.service';

import { Injectable } from '@angular/core';

@Injectable()
export class MockSocketService extends SocketService {

    io = new MockIO();

    constructor(
        _gameService: GameService,
        _playerInfoService: PlayerInfoService
    ) {
        super(
            _gameService,
            _playerInfoService
        );

        this.initSocketListeners(this.io);
    }
}

class MockIO {

    private listenerMap = {};
    private socket = new MockSocket(this);

    constructor() {
        require('../../../socket/socket')().listen(this.socket);
    }

    emit(msg: string, params) {
        this.socket.invoke(msg, params);
    }

    on(msg: string, callback) {
        if (!this.listenerMap[msg]) {
            this.listenerMap[msg] = callback;
        }
    }

    invoke(msg: string, params) {
        if (this.listenerMap[msg]) {
            this.listenerMap[msg](params);
        }
    }
}

class MockSocket {

    private messageListeners = {};

    constructor(
        private socketServer: MockIO
    ) {
    }

    invoke(msg: string, params) {
        if (this.messageListeners[msg]) {
            this.messageListeners[msg](params);
        }
    }

    on(msg: string, callback) {
        this.messageListeners[msg] = callback;
    }

    emit(msg: string, params) {
        this.socketServer.invoke(msg, params);
    }

    join(msg: string, params) {
        
    }

    broadcast = {
        emit: (msg: string, params) => {
            this.socketServer.invoke(msg, params);
        }
    }

    to(msg: string, params) {
        return {
            emit: () => {}
        };
    }
}