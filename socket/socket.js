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
        socket.on("card played", function(params) { this.cardPlayed(params, socket) }.bind(this) );
        socket.on("think", function(params) { this.think(params, socket) }.bind(this) );
        socket.on("rome demands", function(params) { this.emitState(params, socket, 'on rome demands') }.bind(this) );
        socket.on("extort material", function(params) { this.emitState(params, socket, 'on extort material') }.bind(this) );
        socket.on("send message", function(params) { this.sendMessage(params, socket) }.bind(this) );
        socket.on("player chat", function(params) { this.playerChat(params, socket) }.bind(this) );
        socket.on("turn end", function(params) { this.turnEnd(params, socket) }.bind(this) );
        socket.on("end game", function(params) { this.emitAll(params, socket, 'game ended') }.bind(this) );

        // DISCONNECT
        socket.on('disconnect', function(params) { this.onDisconnect(params, socket) }.bind(this));
    }.bind(this);

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

        socket.emit("room created", room);

        socket.emit("room changed", this.roomsArray);
        socket.broadcast.emit("room changed", this.roomsArray);
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

        // Emit to clients
        socket.broadcast.emit("room changed", this.roomsArray);
    }

    this.leaveRoom = function(params, socket) {
        let room = _.find(this.roomsArray, room => params.room.id == room.id);

        _.remove(room.players, player => params.player.id == player.id);
        socket.broadcast.emit("room changed", this.roomsArray);
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
    
    initGameState = function(room) {
        let state = gameStates[room.id] = {};

        _.extend(state, {
            playerOrder: [],
            startingHand: [],
            playerTurn: 0,
            actionMode: eActionMode.actionCardMode,
            actions: [],
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
        state.startingHand = _.map(playerOrder, player => state.deck.splice(0,4));
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
            
            influence: 2,
            cardsInHand: 5,

            maxHandSize: 5,
            maxVault: 2,
            maxClientelles: 2,

            actionCard: null,
            additionalActions: [],
            jackCards: null,

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

    cardPlayed = function(params, socket) {
        let state = gameStates[params.roomID];
        _.extend(state, params.gameState);

        if (state.actionMode == eActionMode.actionCardMode) {
            state.actions.push(eActions.playCard);
        }

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
            socket.to(params.roomID).emit("on all players chosen", res);
        }
        else if (state.actionMode == eActionMode.turnEnd) {
            socket.emit("on turn end", state);
            socket.to(params.roomID).emit("on turn end", state);
        }
        else {
            socket.emit("on card played", res);
            socket.to(params.roomID).emit("on card played", res);
        }
    }

    turnEnd = function(params, socket) {
        let state = gameStates[params.roomID];
        _.extend(state, params.gameState);

        let pStates = state.playerStates;

        // Condition to accum client responses
        incrementPlayerTurn(state);

        if (state.playerTurn > 0) {
            socket.emit("on turn end", state);
            socket.to(params.roomID).emit("on turn end", state);
            return;
        }

        // Get all action cards clients used for the turn
        let actionCards = _.map(pStates, pState => pState.actionCard);

        // Add to pool if not null
        _.forEach(actionCards, card => {
            if (card) {
                if (card.role != 6) {
                    state.pool.push(card);
                }
                else {
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
        let jackCards = _.map(pStates, pState => pState.jackCards);
        _.forEach(jackCards, cards => {
            if (cards) {
                _.forEach(cards, card => {
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

        state.actions = [];

        let pOrder = state.playerOrder;
        state.actionMode = eActionMode.actionCardMode;
        pOrder.push(pOrder.shift());

        _.extend(state, {
            playerLead: pOrder[0],
            actionMode: state.actionMode
        });

        socket.emit("on turn started", state);
        socket.to(params.roomID).emit("on turn started", state);
    }

    emitState = function(params, socket, emit) {
        let state = gameStates[params.roomID];
        _.extend(state, params.gameState);
        socket.broadcast.emit(emit, state);
    }

    emitAll = function(params, socket, emit) {
        let state = gameStates[params.roomID];
        _.extend(state, params.gameState);
        socket.emit(emit, state);
        socket.to(params.roomID).emit(emit, state);
    }

    think = function(params, socket) {
        let state = gameStates[params.roomID];
        _.extend(state, params.gameState);

        if (state.playerTurn === 0) {
            let res = _.extend(state, {
                actionMode: eActionMode.turnEnd
            });

            socket.emit("on turn end", state);
            socket.to(params.roomID).emit("on turn end", state);
        }
        else {

            incrementPlayerTurn(state);
            state.actions.push(eActions.think);
            
            if (state.playerTurn === 0) {
                socket.emit("on all players chosen", state);
                socket.to(params.roomID).emit("on all players chosen", state);
            }
        }
    }

    incrementPlayerTurn = function(state) {
        let len = state.playerOrder.length;
        if (state.playerTurn % len === len - 1) {
            if (state.actionMode == eActionMode.actionCardMode) {
                state.actionMode = eActionMode.resolveAction;
            }
            else if (state.actionMode == eActionMode.resolveAction) {
                state.actionMode = eActionMode.turnEnd;
            }
        }
        state.playerTurn = (state.playerTurn + 1) % len;

        if (state.actionMode == eActionMode.resolveAction) {
            while (state.actions[state.playerTurn] == eActions.think) {
                state.playerTurn = (state.playerTurn + 1) % len;
                if (state.playerTurn == 0) {
                    state.actionMode = eActionMode.turnEnd;
                }
            }
        }
    }

    sendMessage = function(params, socket) {
        socket.to(params.roomID).emit("receive message", params.message);
    }

    playerChat = function(params, socket) {
        socket.to(params.roomID).emit("on player chat", params.text);
    }

    onDisconnect = function(params, socket) {
        // this.leaveRoom(params, socket);
    }

    return this;
}