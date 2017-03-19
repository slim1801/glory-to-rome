import { find } from 'lodash';

import { Component } from '@angular/core';

import { ICard, Card, eCardSize, eCardEffect, eWorkerType } from '../../common/card/card';
import { CardFactoryService } from '../../common/card/card.factory.service';
import { GameMechanicsService } from '../../common/game.mechanics.service';
import { GameService, eActionMode, eActions } from '../../common/game.service';
import { PlayerService } from '../../common/player.service';
import { PlayerInfoService } from '../../common/player.info.service';
import { SocketService } from '../../common/socket.service';
import { MessageService } from '../../common/message.service';

@Component({
    selector: 'control-component',
    templateUrl: './control.template.html',
    styleUrls: ['./control.styles.css']
})
export class ControlComponent {

    constructor(
        private _cardFactoryService: CardFactoryService,
        private _gameMechanicsService: GameMechanicsService,
        private _gameService: GameService,
        private _playerService: PlayerService,
        private _playerInfoService: PlayerInfoService,
        private _socketService: SocketService,
        private _messageService: MessageService
    ) {
    }

    /* Normal section */

    no_action_think() {
        this._playerService.thinkAction();
    }

    think = () => {
        if (!this.enableThink()) return;

        // Vomitorium Condition
        if (this._playerService.hasCompletedBuilding(eCardEffect.vomitorium)) {
            this._playerService.actionPerformTrigger = eCardEffect.vomitorium;
        }
        // Latrine Condition
        else if (this._playerService.hasCompletedBuilding(eCardEffect.latrine)) {
            this._playerService.actionPerformTrigger = eCardEffect.latrine;
            this._playerService.resolvingCard = true;
        }
        // Normal Condition
        else {
            this._playerService.thinkAction();
        }
    }

    drawJack = () => {
        if (!this.enableJack()) return;

        this._playerService.addCards(this._gameService.drawJack());
        this._playerInfoService.isPlayersTurn = false;

        this._messageService.addTextMessage("draws a JACK");

        this._playerService.thinkCheck();
        this._gameService.updateGameState();

        this._socketService.think();
    }

    private jackMenuVisible = false;
    playCardsAsJack = () => {
        if (
            !this.enableThreeJack() ||
            this._playerService.canPlayCardsAsJack().length == 0
        ) return;

        if (
            this._playerInfoService.isPlayersTurn &&
            this._playerInfoService.isFollowing
        ) {
            this._playerService.playCardsAsJack(this._gameService.gameState.mode);
        }
        else {
            this.jackMenuVisible = !this.jackMenuVisible;
        }
    }

    optionClicked = (wType: eWorkerType) => {
        this.jackMenuVisible = false;
        this._playerService.playCardsAsJack(wType);
    }

    /* THINK SECTION */

    showThink = () => {
        return true;
    }

    enableThink = () => {
        if (this._playerService.actionFinishTrigger || this._playerService.actionPerformTrigger) return false;
        if (this._enableInActionMode()) return true;
        if (this._enableOnActionModeResponse() && !this._playerInfoService.isFollowing) return true;
        return false;
    }

    /* JACK SECTION */

    showJack = () => {
        return true;
    }

    enableJack = () => {
        if (this._gameService.gameState.jacks == 0) return false;
        if (this._playerService.actionFinishTrigger || this._playerService.actionPerformTrigger) return false;
        if (this._enableInActionMode())return true;
        if (this._enableOnActionModeResponse() && !this._playerInfoService.isFollowing) return true;
        return false;
    }

    /* THREE JACK SECTION */

    showThreeJack = () => {
        if (this._playerInfoService.isFollowing) return true;
        if (this._enableInActionMode()) return true;
    }

    enableThreeJack = () => {
        if (this._playerService.actionFinishTrigger || this._playerService.actionPerformTrigger) return false;
        if (this._playerService.canPlayCardsAsJack().length == 0) return false;
        if (this._enableInActionMode()) return true;
        if (this._enableWhileFollowing()) return true;
    }

    /* FOLLOW SECTION */

    follow = () => {
        if (!this.enableFollow()) return;
        this._playerInfoService.isFollowing = true;
        this._messageService.addTextMessage("is FOLLOWING");
    }

    showFollow = () => {
        if (!this._enableInActionMode() && !this._playerInfoService.isFollowing) return true;
        return false;
    }

    enableFollow = () => {
        if (this._enableOnActionModeResponse() && this.canFollow()) return true;
    }

    canFollow = () => {
        return find(this._playerService.handCards, card => 
            card.role == eWorkerType.jack || card.mode == this._gameService.gameState.mode
        ) || this._playerService.canPlayCardsAsJack().length > 0;
    }

    private _enableInActionMode() {
        return this._gameService.gameState.actionMode == eActionMode.actionCardMode && 
                this._playerInfoService.isPlayersLead &&
                this._playerInfoService.isPlayersTurn
    }

    private _enableOnActionModeResponse() {
        return this._gameService.gameState.actionMode == eActionMode.actionCardMode &&
            this._playerInfoService.isPlayersTurn;
    }

    private _enableWhileFollowing() {
        return this._playerInfoService.isPlayersTurn && this._playerInfoService.isFollowing;
    }
}