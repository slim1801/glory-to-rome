import { map } from 'lodash';
import { Injectable, Inject } from '@angular/core';
import { Subject } from 'rxjs';

import { CardFactoryService } from './card/card.factory.service';
import { IPlayer, PlayerInfoService } from './player.info.service';
import { SocketService } from './socket.service';
import { GameService } from './game.service';
import { eWorkerType, ICard, IFoundation } from './card/card';

export enum eMessageType {
    player,
    line,
    custom
}

export interface IMessage {
    type: eMessageType;
    player?: IPlayer,
    textBlocks?: ICustomMessage[];
}

export interface ICustomMessage {
    player?: IPlayer;
    text?: string;
    card?: {
        title: string;
        mode: eWorkerType;
    };
}

@Injectable()
export class MessageService {

    messages: IMessage[] = [];

    constructor(
        @Inject(CardFactoryService) private _cardFactoryService: CardFactoryService,
        @Inject(SocketService) private _socketService: SocketService,
        @Inject(PlayerInfoService) private _playerInfoService: PlayerInfoService,
        @Inject(GameService) private _gameService: GameService
    ) {
        _socketService.onReceiveMessage().subscribe(message => {
            this.messages.push(message);
            this.rerenderScrollSubject.next();
        });

        _socketService.onPlayerChat().subscribe((text: string) => {
            this.messages[this.messages.length - 1].textBlocks.push({ text });
            this.rerenderScrollSubject.next();
        });

        _socketService.onPlayerDisconnected().subscribe((id: string) => {
            const pState = _gameService.getPlayerFromId(id);
            this.onPlayerDisconnectedMessage(pState.player);
        });
    }

    isType(message: ICustomMessage) {
        if (message.card) return 'card';
        if (message.player) return 'player';
        if (message.text) return 'text';
    }

    addMessage(msg: IMessage) {
        this.messages.push(msg);
        this._socketService.sendMessage(msg);
        this.rerenderScrollSubject.next();
    }

    addCustomMessage(textBlocks: ICustomMessage[]) {
        let msg = {
            type: eMessageType.custom,
            textBlocks
        };
        this.addMessage(msg);
    }

    addPlayerMessage(text: string) {
        let prevMessage = this.messages[this.messages.length - 1];
        if (
            this.messages.length > 0 &&
            prevMessage.player && prevMessage.player.id === this._playerInfoService.player.id
        ) {
            prevMessage.textBlocks.push({ text });
            this._socketService.sendPlayerChat(text);
            this.rerenderScrollSubject.next();
        }
        else {
            let msg: IMessage = {
                type: eMessageType.player,
                player: this._playerInfoService.player,
                textBlocks: [{ text }]
            };
            this.addMessage(msg);
        }
    }

    addLeadMessage(card: ICard) {
        let jack = card.role === eWorkerType.jack ? "(jack)" : "";
        let msg = {
            type: eMessageType.custom,
            textBlocks: [
                { player: this._playerInfoService.player },
                { text: "leads with" },
                { card: {
                    title: this._cardFactoryService.getRoleFromType(card.role === eWorkerType.jack ? card.mode : card.role).toUpperCase(),
                    mode: card.mode
                }},
                { text: jack }
            ]
        };
        this.addMessage(msg);
    }

    addTextMessage(text: string) {
        let msg = {
            type: eMessageType.custom,
            textBlocks: [
                { player: this._playerInfoService.player },
                { text }
            ]
        };
        this.addMessage(msg);
    }

    addUnderConstructionMessage(card: ICard) {
        let msg = {
            type: eMessageType.custom,
            textBlocks: [
                { player: this._playerInfoService.player },
                { text: "lays a foundation for" },
                { card: {
                    title: card.title.toUpperCase(),
                    mode: card.mode
                }}
            ]
        };
        this.addMessage(msg);
    }

    addMaterialMessage(card: ICard, foundationCard: ICard) {
        let msg = {
            type: eMessageType.custom,
            textBlocks: [
                { player: this._playerInfoService.player },
                { text: "added" },
                { card: {
                    title: card.title.toUpperCase(),
                    mode: card.mode
                }},
                { text: "as material to" },
                { card: {
                    title: foundationCard.title.toUpperCase(),
                    mode: foundationCard.mode
                }}
            ]
        };
        this.addMessage(msg);
    }

    addCompletedMessage(card: ICard) {
        let msg = {
            type: eMessageType.custom,
            textBlocks: [
                { player: this._playerInfoService.player },
                { text: "completed" },
                { card: {
                    title: card.title.toUpperCase(),
                    mode: card.mode
                }},
            ]
        };
        this.addMessage(msg);
    }

    addClientelleMessage(card: ICard) {
        let msg = {
            type: eMessageType.custom,
            textBlocks: [
                { player: this._playerInfoService.player },
                { text: "adds" },
                { card: {
                    title: this._cardFactoryService.getRoleFromType(card.mode).toUpperCase(),
                    mode: card.mode
                }},
                { text: "into clientelles" }
            ]
        };
        this.addMessage(msg);
    }

    addStockpileMessage(card: ICard) {
        let msg = {
            type: eMessageType.custom,
            textBlocks: [
                { player: this._playerInfoService.player },
                { text: "adds" },
                { card: {
                    title: this._cardFactoryService.mapMaterialName(card.mode).toUpperCase(),
                    mode: card.mode
                }},
                { text: "to stockpile" }
            ]
        };
        this.addMessage(msg);
    }

    addPoolLegionaryMessage(card: ICard) {
        let msg = {
            type: eMessageType.custom,
            textBlocks: [
                { player: this._playerInfoService.player },
                { text: "uses legionary to take" },
                { card: {
                    title: this._cardFactoryService.mapMaterialName(card.mode).toUpperCase(),
                    mode: card.mode
                }},
                { text: "from POOL" }
            ]
        };
        this.addMessage(msg);
    }

    romeDemandsMessage(cards: ICard[]) {
        let msg = {
            type: eMessageType.custom,
            textBlocks: [
                { player: this._playerInfoService.player },
                { text: "demands" },
                ...map(cards, card => ({
                    card: {
                        title: this._cardFactoryService.mapMaterialName(card.mode).toUpperCase(),
                        mode: card.mode
                    }
                }))
            ]
        };
        this.addMessage(msg);
    }

    discardMessage(cards: ICard[]) {
        let msg = {
            type: eMessageType.custom,
            textBlocks: [
                { player: this._playerInfoService.player },
                { text: "discards" },
                ...map(cards, card => ({
                    card: {
                        title: card.title.toUpperCase(),
                        mode: card.mode
                    }
                })),
                { text: "into pool" }
            ]
        };
        this.addMessage(msg);
    }

    petitionMessage(cards: ICard[]) {
        let msg = {
            type: eMessageType.custom,
            textBlocks: [
                { player: this._playerInfoService.player },
                { text: "petitions" },
                ...map(cards, card => ({
                    card: {
                        title: card.title.toUpperCase(),
                        mode: card.mode
                    }
                }))
            ]
        }
        this.addMessage(msg);
    }

    gloryToRomeMessage() {
        let msg = {
            type: eMessageType.custom,
            textBlocks: [
                { player: this._playerInfoService.player },
                { text: "shouts GLORY TO ROME!" }
            ]
        };
        this.addMessage(msg);
    }

    addLine() {
        let msg = { type: eMessageType.line };
        this.messages.push(msg);
    }

    onPlayerDisconnectedMessage(player: IPlayer) {
        let msg = {
            type: eMessageType.custom,
            textBlocks: [
                { player },
                { text: "has disconnected, waiting for reconnection" }
            ]
        };
        this.messages.push(msg);
        this.rerenderScrollSubject.next();
    }

    private rerenderScrollSubject: Subject<void> = new Subject<void>();
    onRerenderScroll() {
        return this.rerenderScrollSubject.asObservable();
    }
}