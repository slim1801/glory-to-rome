import * as _ from 'lodash';

import { Component, ViewChild } from '@angular/core';

import { ICard, ICompletedFoundation, eWorkerType, eCardEffect } from './common/card/card';
import { SocketService } from './common/socket.service';
import { PlayerService } from './common/player.service';
import { PlayerInfoService } from './common/player.info.service';
import { IPlayerState } from './common/player.info.service';
import { GameService } from './common/game.service';

import { LobbyComponent } from './modules/LobbyComponent/lobby.component';

@Component({
    selector: 'my-app',
    templateUrl: './app.template.html',
    styleUrls: ['./app.styles.css']
})
export class AppComponent {

    gameStarted = false;
    gameEnded = false;
    endGameResult: {
        buildingInfluence: number;
        vault: number;
        vaultBonus: number;
        statueBonus: number;
        wallBonus: number;
        rank: number;
        total: number;
        playerState: IPlayerState
    }[] = [];

    constructor(
        private _socketService: SocketService,
        private _gameService: GameService,
        private _playerService: PlayerService,
        private _playerInfoService: PlayerInfoService
    ){  
        this._initListeners();
    }

    private _initListeners() {
        this._socketService.onGameStarted().subscribe(gameState => {
            this.gameStarted = true;
        });
        this._socketService.onGameEnded().subscribe(gamsState => {
            this._computeResults();
            this.gameEnded = true;
        });
    }

    private _computeResults() {
        let players = this._gameService.gameState.playerStates;

        _.forEach(players, player => {
            let buildingInfluence = this.sumBuildingInfluence(player.completed);
            let vault = this.sumVault(player.vault);
            let vaultBonus = this.sumVaultBonus(player);
            let statueBonus = this.statueBonus(player);
            let wallBonus = this.wallBonus(player);

            let total = buildingInfluence + vault + vaultBonus + statueBonus + wallBonus;

            this.endGameResult.push({
                buildingInfluence,
                vault,
                vaultBonus,
                statueBonus,
                wallBonus,
                total,
                rank: 0,
                playerState: player
            });
        });
    }

    private sumBuildingInfluence(compB: ICompletedFoundation[]) {
        return _.sumBy(compB, comp => this._playerService.getInfluence(comp));
    }

    private sumVault(vault: ICard[]) {
        return _.sumBy(vault, v => this._playerService.getInfluenceByType(v.role));
    }

    private sumVaultBonus(playerState: IPlayerState) {
        let bonus = 0;
        let players = this._gameService.gameState.playerStates;

        for (let i = 0; i < 6; i++) {
            let typeInVault = this.getNumInVault(playerState.vault, i);
            let isHighest = _.every(players, ply => typeInVault > this.getNumInVault(ply.vault, i));
            bonus += isHighest ? 3 : 0;
        }
        return bonus;
    }

    private getNumInVault(vault: ICard[], type: eWorkerType) {
        return _.filter(vault, v => v.role == type);
    }

    private statueBonus(player: IPlayerState) {
        return this._hasBuildingFunction(player, eCardEffect.statue) ||
               !!(_.find(player.completed, c => c.building.id === eCardEffect.gate) &&
               _.find(player.underConstruction, c => c.building.id === eCardEffect.statue)) ? 3 : 0;
    }

    private wallBonus(player: IPlayerState) {
        return this._hasBuildingFunction(player, eCardEffect.wall) ? this._computeWall(player.stockpile) : 0
    }

    private _hasBuildingFunction(player: IPlayerState, type: eCardEffect) {
        return !!_.find(player.completed, c => c.building.id === type) ||
               _.find(this._gameService.gameState.publicBuildings, c => c.id === type) 
    }

    private _computeWall(cards: ICard[]) {
        return Math.floor(cards.length / 2);
    }

    @ViewChild(LobbyComponent) lobbyComponent: LobbyComponent;
}
