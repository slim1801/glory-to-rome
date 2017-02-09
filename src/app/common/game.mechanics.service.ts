import * as _ from 'lodash';

import { Injectable, Inject } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { ICard, Card, eWorkerType, ICardPlayed } from './card/card';
import { CardFactoryService } from './card/card.factory.service';
import { GameService, eActionMode, eActions } from './game.service';
import { SocketService } from './socket.service';
import { PlayerInfoService } from './player.info.service';

@Injectable()
export class GameMechanicsService {

    private roleMap;

    activeCard: ICard = new Card();
    private mode: eWorkerType;
    private actionMode: eActionMode;

    // When other players lead
    private playedCard: ICard = new Card();

    constructor(
        @Inject(GameService) private _gameService: GameService,
        @Inject(CardFactoryService) private _cardFactoryService: CardFactoryService,
        @Inject(SocketService) private _socketService: SocketService,
        @Inject(PlayerInfoService) private _playerInfoService: PlayerInfoService
    ) {
        this.roleMap = [
            this._architectPlayed,
            this._craftsmanPlayed,
            this._laborerPlayed,
            this._legionaryPlayed,
            this._merchantPlayed,
            this._patronPlayed,
            this._jackPlayed
        ]
        this._initListeners();
    }

    private _initListeners() {
        this._gameService.onAllPlayersChosen().subscribe(card => {
            this.performSubject.next();
        })

        let skt = this._socketService;

        skt.onGameStarted().subscribe(gameState => {
            this.actionMode = gameState.actionMode;
        });
        
        skt.onTurnStarted().subscribe(gameState => {
            this.actionMode = gameState.actionMode;
        });

        skt.onCardPlayed().subscribe(gameState => {

            if (gameState.playerOrder[gameState.playerTurn].id == this._playerInfoService.player.id) {
                this._playerInfoService.isPlayersTurn = true;
            }

            if (gameState.actionMode == eActionMode.resolveCardMode) {
                this.performSubject.next();
            }
            else if (gameState.actionMode == eActionMode.turnEndMode) {
                this.actionEnd();
            }
        });
    }

    getActionMode = () => this.actionMode;

    getMode = () => this.mode;

    getPlayedCard = () => this.playedCard;

    setMode = (type: eWorkerType) => {
        this.mode = type;
    }

    changeActiveCard = (card: ICard) => {
        this.activeCard.changeValues(card);
    }

    private _architectPlayed = (card: ICard, type?: eWorkerType) => {
        this._onCardNext(eWorkerType.architect, card, type);
    }

    private _craftsmanPlayed = (card: ICard, type?: eWorkerType) => {
        this._onCardNext(eWorkerType.craftsman, card, type);
    }

    private _laborerPlayed = (card: ICard, type?: eWorkerType) => {
        this._onCardNext(eWorkerType.laborer, card, type);
    }

    private _legionaryPlayed = (card: ICard, type?: eWorkerType) => {
        console.log("LEGIONARY PLAYED");
        // TODO: HERE
    }

    private _merchantPlayed = (card: ICard, type?: eWorkerType) => {
        this._onCardNext(eWorkerType.merchant, card, type);
    }

    private _patronPlayed = (card: ICard, type?: eWorkerType) => {
        this._onCardNext(eWorkerType.patron, card, type);
    }

    private _jackPlayed = (card: ICard, type?: eWorkerType) => {
        this._onCardNext(eWorkerType.jack, card, type);
    }

    private _onCardNext(type: eWorkerType, card: ICard, jack?: eWorkerType) {
        this._gameService.playerHasActioned(card);
    }

    private playCardsAsJackSubject = new Subject<eWorkerType[]>();
    playCardsAsJack = (types: eWorkerType[], type: eWorkerType) => {
        this.activeCard.changeValues(this._cardFactoryService.getJack());
        this.mode = type;
        this.playCardsAsJackSubject.next(types);
    }

    onPlayCardsAsJack = () => {
        return this.playCardsAsJackSubject.asObservable();
    }

    private cardsAsJackPlayedSubject = new Subject<ICard[]>();
    cardsPlayedAsJack = (cards: ICard[]) => {
        this.cardsAsJackPlayedSubject.next(cards);
        this.roleMap[this.mode](this.activeCard, this.mode);
    }

    onCardsPlayedAsJack = () => {
        return this.cardsAsJackPlayedSubject.asObservable();
    }

    cardPerform() {
        this.performSubject.next();
    }

    private performSubject = new Subject<void>();
    onCardPerform() {
        return this.performSubject.asObservable();
    }

    private actionEndSubject = new Subject<ICard>();
    actionEnd() {
        this.mode = null;
        this.actionEndSubject.next(_.cloneDeep(this.activeCard));
        this.activeCard.changeValues(new Card);
    }

    onActionEnd() {
        return this.actionEndSubject.asObservable();
    }

    private drawJackSubject = new Subject<any>()
    drawJack() {
        this.drawJackSubject.next();
    }

    onDrawJack() {
        return this.drawJackSubject.asObservable();
    }
}