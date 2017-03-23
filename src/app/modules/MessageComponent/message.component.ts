import * as _ from 'lodash';

import { Component, ElementRef, ViewChild } from '@angular/core';

import { CardFactoryService } from '../../common/card/card.factory.service';
import { PlayerInfoService } from '../../common/player.info.service';
import { SocketService } from '../../common/socket.service';
import { IMessage, eMessageType, MessageService } from '../../common/message.service';

@Component({
    selector: 'message-component',
    templateUrl: './message.template.html',
    styleUrls: ['./message.styles.css']
})
export class MessageComponent {

    @ViewChild('scrollContainer') scrollCont: ElementRef;
    private eMessageType = eMessageType;

    constructor(
        private _cardFactoryService: CardFactoryService,
        private _playerInfoService: PlayerInfoService,
        private _socketService: SocketService,
        private _messageService: MessageService
    ) {
        _messageService.onRerenderScroll().subscribe(() => {
            setTimeout(() => {
                let sElement = this.scrollCont.nativeElement;
                sElement.scrollTop = sElement.scrollHeight;
            }, 0);
        })
    }

    messageClicked(input: HTMLInputElement) {
        this._addInput(input);
    }

    enterPressed = (event: KeyboardEvent) => {
        if (event.keyCode === 13) {
            let input = (<HTMLInputElement>event.target);
            this._addInput(input);
        }
    }

    private _addInput(input: HTMLInputElement) {
        if (input.value !== "") {

            this._messageService.addPlayerMessage(input.value);
            input.value = "";
        }
    }

    showPlayerName(i: number, message: IMessage) {
        let currMessage = this._messageService.messages[i];
        let prevMessage = this._messageService.messages[i - 1];

        if (i == 0) return true;

        if (
            prevMessage.type !== eMessageType.player &&
            currMessage.type === eMessageType.player
        )
            return true;
        if (
            prevMessage.type === eMessageType.player &&
            currMessage.type === eMessageType.player &&
            prevMessage.player.id !== currMessage.player.id
        ) 
            return true;
        
        return false;
    }
}