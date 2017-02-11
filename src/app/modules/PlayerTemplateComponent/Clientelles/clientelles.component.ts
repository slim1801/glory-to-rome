import * as _ from 'lodash';

import { Component, ViewChild, AfterContentInit } from '@angular/core';

import { ICard, eCardSize } from '../../../common/card/card';
import { PlayerService } from '../../../common/player.service';
import { PlayerInfoService } from '../../../common/player.info.service';
import { SocketService } from '../../../common/socket.service';
import { GameService, eLegionaryStage } from '../../../common/game.service';

const cardConfig = require('../../../config/card.config.json');

@Component({
    selector: 'clientelle-component',
    template: `
        <div class="clientelle-container" #clientelleContainer [style.width]="calcWidth()">
            <div *ngFor="let card of _playerInfoService.getPlayerState().clientelles; let i = index">
                <div class="clientelle-card-container"
                     [ngStyle]="clientPosition(i)"
                     (click)="clientClicked(card)">
                    <card-image [card]="card"
                                [size]="size"
                                [interactable]="clientEnable(card)">
                    </card-image>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .clientelle-container {
            flex: 1;
            position: relative;
            margin-top: 22px;
        }
        .clientelle-card-container {
            position: absolute;
            transform: translate(100%, 0);
        }
    `]
})
export class ClientelleComponent {

    private size = eCardSize.medium;

    constructor(
        private _playerInfoService: PlayerInfoService,
        private _playerService: PlayerService,
        private _gameService: GameService,
        private _socketService: SocketService
    ) {
    }

    clientClicked(card: ICard) {
        if (!this.clientEnable(card)) return;

        let ps = this._playerService;
        ps.addRemoveFromLoot(card);

        if (!ps.hasCardsToLoot(this._playerInfoService.getPlayerState().clientelles)) {
            _.forEach(this._playerInfoService.getPlayerState().loot, card => {
                this._playerService.removeFromClientelles(card);
            })
            ps.extortMaterial();
        }
    }

    clientEnable(card: ICard) {
        // Coliseum Condition
        if (
            this._gameService.gameState.legionaryStage === eLegionaryStage.coliseum &&
            this._playerService.hasTypeToLoot(card.role, this._playerInfoService.getPlayerState().clientelles)
        ) {
            return true;
        }
        return false;
    }

    clientPosition(index: number) {
        let offset = (index + 1) * 20 + 'px';
        return {
            right: offset,
            zIndex: index * -1
        }
    }

    calcWidth() {
        let len = this._playerInfoService.getPlayerState().clientelles.length;
        return len * 20 + 'px';
    }
}