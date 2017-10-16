var _ = require("lodash");

var cardConfig = require('../src/app/config/card.config.json');

module.exports = function() {

    this.roomsIDs = [];
    this.rooms = {};
    this.roomsArray = [];
    this.players = {};

    this.gameStates = {};

    this.listen = function(socket) {
        socket.on("create", function(params) { this.createRoom(params, socket) }.bind(this) );
        socket.on("join room", function(params) { this.joinRoom(params, socket) }.bind(this) );
        socket.on("leave room", function(params) { this.leaveRoom(params, socket) }.bind(this) );
        socket.on("all rooms", function(params) { this.allRooms(params, socket) }.bind(this) );
        socket.on("start game", function(params) { this.startGame(params, socket) }.bind(this) );
        socket.on("action finished", function(params) { this.actionFinished(params, socket) }.bind(this) );
        socket.on("state changed", function(params) { this.stateChanged(params, socket) }.bind(this) )
        socket.on("think", function(params) { this.think(params, socket) }.bind(this) );
        socket.on("extort material", function(params) { this.extortMaterial(params, socket) }.bind(this) );
        socket.on("rome demands", function(params) { this.romeDemands(params, socket) }.bind(this) );
        socket.on("send message", function(params) { this.sendMessage(params, socket) }.bind(this) );
        socket.on("player chat", function(params) { this.playerChat(params, socket) }.bind(this) );
        socket.on("turn end", function(params) { this.turnEnd(params, socket) }.bind(this) );
        socket.on("end game", function(params) { this.emitAll(params, socket, 'game ended') }.bind(this) );
        socket.on("rejoin game", function(params) { this.rejoin(params, socket) }.bind(this) );

        // DISCONNECT
        socket.on('disconnect', function(params) { this.onDisconnect(params, socket) }.bind(this));

        // Restore Game State
        const { uid, roomID } = socket.handshake.session;
        
        if (roomID && gameStates[roomID]) {
            socket.emit("rejoin game");
        }
    };

    this.rejoin = function(params, socket) {
        const { uid, roomID } = socket.handshake.session;

        if (gameStates[roomID]) {
            delete disconnectedPlayers[uid];
            socket.join(roomID);

            socket.emit("restore state", {
                gameState: gameStates[roomID]
            });
            socket.broadcast.emit("player rejoined", { id: uid });
        }
    }

    this.createRoom = function(params, socket) {
        let id = Math.random().toString(36).substring(7);

        this.roomsIDs.push(id);

        let room = {
            id: id,
            numPlayers: params.players,
            host: params.player,
            players: [params.player]
        };

        this.roomsArray.push(room);
        this.rooms[id] = room;

        // Create initial game state
        gameStates[id] = initGameState(room);
        gameStates[id].playerStates.push(newPlayerState(params.player));

        //Join Room as well
        socket.join(id);
        socket.handshake.session.roomID = id;
        socket.handshake.session.save(err => {
            socket.broadcast.emit("room created", room);
            socket.emit("room changed", this.roomsArray);
            socket.broadcast.emit("room changed", this.roomsArray);
        });
    }

    this.joinRoom = function(params, socket) {
        let roomID = params.room.id;
        let room = this.rooms[roomID];
        let player = params.player;

        // Do not join if max players reached
        if (room.players.length >= room.numPlayers) {
            return;
        }

        let state = gameStates[roomID];
        state.playerStates.push(newPlayerState(params.player));

        room.players.push(params.player);
        socket.join(roomID);
        socket.handshake.session.roomID = roomID;
        socket.handshake.session.save(error => {
            // Emit to clients
            socket.broadcast.emit("room changed", this.roomsArray);
        });
    }

    this.leaveRoom = function(params, socket) {
        removePlayerFromRoom(socket);
        socket.broadcast.emit("room changed", this.roomsArray);
    }

    removePlayerFromRoom = function(socket) {
        if (!socket.handshake.roomID) return;

        let roomIndex = _.findIndex(this.roomsArray, room => socket.handshake.roomID == room.id);
        let room = this.roomsArray[roomIndex];
        if (room) {
            _.remove(room.players, player => player.id == socket.id);
            room.numPlayers--;
            if (room.players.length === 0) {
                this.roomsArray.splice(roomIndex, 1);
            }
            removePlayerFromState(socket.handshake.roomID, socket.id);
            socket.broadcast.emit("room changed", this.roomsArray);
        }

        socket.handshake.roomID = null;
    }

    this.startGame = function(params, socket) {
        let id = params.room.id;
        _.remove(this.roomsArray, room => room.id == id);

        startGameState(rooms[id], params.deck);

        socket.to(id).emit("game started", this.gameStates[id]);
        socket.emit("game started", this.gameStates[id]);
        socket.broadcast.emit("room changed", this.roomsArray);
    }

    this.getRoom = function(roomID) {
        return this.rooms[this.roomID];
    }

    this.allRooms = function(params, socket) {
        socket.emit("room changed", this.roomsArray);
    }

    this.getAllRooms = function() {
        return this.roomsArray;
    }

    /* Game State functions */

    cards = cardConfig.cards;
    jack = cardConfig.jack;
    
    initGameState = function(room) {
        let state = gameStates[room.id] = {};

        _.extend(state, {
            playerOrder: [],
            playerTurn: 0,
            actionMode: eActionMode.actionCardMode,
            actionTriggers: [],
            playerStates: [],
            foundations: [],
            romeDemands: [],
            legionaryStage: null,
            publicBuildings: []
        })
        
        return state;
    }

    startGameState = function(room, deck) {
        let state = gameStates[room.id];
        state.deck = deck;

        let players = room.players.length;
        state.pool = state.deck.splice(0, players);

        let poolWithIndex = _.map(state.pool, (card, i) => {
            let cardClone = _.clone(card);
            cardClone.index = i;
            return cardClone;
        });

        let playerOrder = _.map(_.sortBy(poolWithIndex, 'title'), card => room.players[card.index]);

        state.playerOrder = _.map(_.sortBy(poolWithIndex, 'title'), card => room.players[card.index]);
        _.forEach(state.playerStates, pState => {
            pState.hand = state.deck.splice(0,4);
            pState.hand.push(cardConfig.jack);
        });
        state.playerLead = playerOrder[0];
        state.jacks = 6 - playerOrder.length;

        state.foundations = createFoundation();
    }

    function createFoundation() {
        return [
        ]
    }

    newPlayerState = function(player) {
        let playerState = {};

        _.extend(playerState, {
            player: player,
            completed: [],
            stockpile: [],
            underConstruction: [],
            vault: [],
            clientelles: [],
            functionAvailable: [],
            hand: [],
            
            influence: 2,
            cardsInHand: 5,

            maxHandSize: 5,
            maxVault: 2,
            maxClientelles: 2,

            actionCard: null,
            action: null,
            additionalActions: [],
            jackCards: null,
            cardsForJack: 3,

            loot: [],
            hasLooted: false,
            gloryToRome: false
        });

        return playerState;
    }

    const eActionMode = {
        actionCardMode: 0,
        resolveAction: 1,
        turnEnd: 2
    }

    const eActions = {
        playCard: 0,
        think: 1
    }

    stateChanged = function(params, socket) {
        let state = _.extend(gameStates[socket.handshake.session.roomID], params.gameState);
        socket.to(socket.handshake.session.roomID).emit('on state changed', state);
    }

    actionFinished = function(params, socket) {
        let state = gameStates[socket.handshake.session.roomID];
        _.extend(state, params.gameState);

        let prevActionMode = state.actionMode;
        incrementPlayerTurn(state);

        let res = _.extend(state, {
            actionMode: state.actionMode,
            mode: state.actionMode == eActionMode.turnEnd ? null : state.mode
        });
        
        if (
            prevActionMode === eActionMode.actionCardMode &&
            state.actionMode === eActionMode.resolveAction
        ) {
            socket.emit("on all players chosen", res);
            socket.to(socket.handshake.session.roomID).emit("on all players chosen", res);
        }
        else if (state.actionMode == eActionMode.turnEnd) {
            socket.emit("on turn end", state);
            socket.to(socket.handshake.session.roomID).emit("on turn end", state);
        }
        else {
            socket.emit("on action finished", res);
            socket.to(socket.handshake.session.roomID).emit("on action finished", res);
        }
    }

    turnEnd = function(params, socket) {
        let state = gameStates[socket.handshake.session.roomID];
        _.extend(state, params.gameState);

        let pStates = state.playerStates;

        // Condition to accum client responses
        incrementPlayerTurn(state);

        if (state.playerTurn > 0) {
            socket.emit("on turn end", state);
            socket.to(socket.handshake.session.roomID).emit("on turn end", state);
            return;
        }

        // Add to pool if not null
        _.forEach(pStates, pState => {
            if (pState.actionCard) {
                if (pState.actionCard.role != 6) {
                    state.pool.push(pState.actionCard);
                }
                else if (pState.jackCards === null) {
                    state.jacks++;
                }
            }
        });

        // Add additional cards to pool
        let additionalCards = _.map(pStates, pState => pState.additionalActions);
        _.forEach(additionalCards, cards => {
            _.forEach(cards, card => {
                if (card.role != 6) {
                    state.pool.push(card);
                }
                else {
                    state.jacks++;
                }
            });
        });
        _.forEach(pStates, pState => pState.additionActions = []);

        // Add jack cards to pool
        _.forEach(pStates, pState => {
            if (pState.jackCards) {
                _.forEach(pState.jackCards, card => {
                    state.pool.push(card);
                });
            }
        });
        _.forEach(pStates, pState => pState.jackCards = null);

        // Clean up loot
        _.forEach(pStates, pState => {
            pState.loot = [];
            pState.hasLooted = false;
        });

        // Set action cards to null
        _.forEach(pStates, pState => pState.actionCard = null);

        let pOrder = state.playerOrder;
        state.actionMode = eActionMode.actionCardMode;
        pOrder.push(pOrder.shift());

        _.extend(state, {
            playerLead: pOrder[0],
            actionMode: state.actionMode
        });

        socket.emit("on turn started", state);
        socket.to(socket.handshake.session.roomID).emit("on turn started", state);
    }

    romeDemands = function(params, socket) {
        let state = gameStates[socket.handshake.session.roomID];
        _.extend(state, params.gameState);
        socket.to(socket.handshake.session.roomID).emit('on rome demands', state);
    }

    extortMaterial = function(params, socket) {
        let state = gameStates[socket.handshake.session.roomID];
        _.extend(state, params.gameState);
        socket.to(socket.handshake.session.roomID).emit('on extort material', state);
    }

    emitAll = function(params, socket, emit) {
        let state = gameStates[socket.handshake.session.roomID];
        _.extend(state, params.gameState);
        socket.emit(emit, state);
        socket.to(socket.handshake.session.roomID).emit(emit, state);
    }

    think = function(params, socket) {
        let state = gameStates[socket.handshake.session.roomID];
        _.extend(state, params.gameState);

        if (state.playerTurn === 0) {
            let res = _.extend(state, {
                actionMode: eActionMode.turnEnd
            });

            socket.emit("on turn end", state);
            socket.to(socket.handshake.session.roomID).emit("on turn end", state);
        }
        else {

            incrementPlayerTurn(state);

            if (state.playerTurn === 0) {
                socket.emit("on all players chosen", state);
                socket.to(socket.handshake.session.roomID).emit("on all players chosen", state);
            }
        }
    }

    incrementPlayerTurn = function(state) {
        let len = state.playerOrder.length;
        state.playerTurn = (state.playerTurn + 1) % len;

        let currPlayer = getCurrentPlayer(state);

        if (state.actionMode == eActionMode.resolveAction) {
            while (
                currPlayer.action === eActions.think &&
                !_.find(currPlayer.clientelles, client => client.role === state.mode)
            ) {
                state.playerTurn = (state.playerTurn + 1) % len;
                currPlayer = getCurrentPlayer(state);
            }
        }

        if (state.playerTurn === 0) {
            if (state.actionMode == eActionMode.actionCardMode) {
                state.actionMode = eActionMode.resolveAction;
            }
            else if (state.actionMode == eActionMode.resolveAction) {
                state.actionMode = eActionMode.turnEnd;
            }
        }
    }

    getCurrentPlayer = function(state) {
        return _.find(state.playerStates, pState => pState.player.id === state.playerOrder[state.playerTurn].id);
    }

    removePlayerFromState = function(roomID, id) {
        if (gameStates[roomID])
            _.remove(gameStates[roomID].playerStates, pState => pState.player.id === id);
    }

    sendMessage = function(params, socket) {
        socket.to(socket.handshake.session.roomID).emit("receive message", params.message);
    }

    playerChat = function(params, socket) {
        socket.to(socket.handshake.session.roomID).emit("on player chat", params.text);
    }

    onDisconnect = function(params, socket) {
        removePlayerFromRoom(socket);
        handlePlayerInGame(socket);
    }

    function clearStates(roomID) {
        delete gameStates[roomID];
    }

    disconnectedPlayers = {}

    function handlePlayerInGame(socket) {
        const { uid, roomID } = socket.handshake.session;
        const roomState = gameStates[roomID];
        if (!roomState) return;

        const playersDisconnected = _.sumBy(roomState.playerStates, pState => !!disconnectedPlayers[pState.player.id]);

        if (playersDisconnected === roomState.playerStates.length - 1) {
            _.forEach(roomState.playerStates, pState => {
                if (disconnectedPlayers[pState.player.id]) {
                    delete disconnectedPlayers[pState.player.id];
                }
            });
            clearStates(roomID);
            delete socket.handshake.session.roomID;
        }
        else {
            disconnectedPlayers[uid] = true;
            socket.to(roomID).emit("player disconnected", { id: uid });
        }
    }

    return this;
}