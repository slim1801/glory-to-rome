import { Component } from '@angular/core';

import { GameService } from '../../common/game.service';
import { PlayerService } from '../../common/player.service';
import { PlayerInfoService } from '../../common/player.info.service';
import { CardFactoryService } from '../../common/card/card.factory.service';

@Component({
    selector: 'user-stats-component',
    template: `
        <div class="user-stats-container">
            <div class="user-stats-col">
                <div class="user-label">Deck: {{_gameService.gameState.deck.length}}</div>
                <div class="user-label">Hand Size: {{_playerInfoService.getPlayerState().maxHandSize}}</div>
            </div>
            <div class="user-stats-col">
                <div class="user-label">Vault ({{_playerInfoService.getPlayerState().maxVault}}): {{_playerInfoService.getPlayerState().vault.length}}</div>
                <div class="user-label">Influence: {{_playerInfoService.getPlayerState().influence}}</div>
            </div>
        </div>
    `,
    styles: [`
        .user-stats-container {
            display: flex;
        }
        .user-stats-col {
            flex: 1;
        }
        .user-label {
            font-weight: bold;
        }
    `]
})
export class UserStatsComponent {

    constructor(
        private _gameService: GameService,
        private _playerService: PlayerService,
        private _playerInfoService: PlayerInfoService,
        private _cardFactoryService: CardFactoryService
    ) {
    }
}