import { Component } from '@angular/core';

import { eCardEffect } from '../../common/card/card';

import { GameService } from '../../common/game.service';
import { PlayerService } from '../../common/player.service';
import { PlayerInfoService } from '../../common/player.info.service';
import { CardFactoryService } from '../../common/card/card.factory.service';
import { GameMechanicsService } from '../../common/game.mechanics.service';

@Component({
    selector: 'user-stats-component',
    template: `
        <div class="user-label">Deck: {{_gameService.gameState.deck.length}}</div>
        <div class="user-label">Vault ({{_playerInfoService.getPlayerState().maxVault}}): {{_playerInfoService.getPlayerState().vault.length}}</div>
        <div class="user-label">Influence: {{_playerInfoService.getPlayerState().influence}}</div>
        <div class="user-label">Max Hand Size: {{_playerInfoService.getPlayerState().maxHandSize}}</div>
    `,
    styles: [`
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
        private _cardFactoryService: CardFactoryService,
        private _gameMechanicsService: GameMechanicsService
    ) {
    }
}