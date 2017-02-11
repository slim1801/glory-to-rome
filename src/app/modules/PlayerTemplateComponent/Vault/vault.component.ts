import { Component, ViewChild, AfterContentInit } from '@angular/core';

import { ICard, eCardSize } from '../../../common/card/card';
import { PlayerService } from '../../../common/player.service';

const cardConfig = require('../../../config/card.config.json');

@Component({
    selector: 'vault-component',
    template: `
        <div class="vault-container" #vaultContainer>
            <div *ngFor="let card of vault; let i = index">
                <div class="vault-card-container" [ngStyle]="cardStyle(i)">
                    <card-image [card]="card" [size]="size"></card-image>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .vault-container {
            flex: 1;
            position: relative;
        }
        .vault-card-container {
            position: absolute;
        }
    `]
})
export class VaultComponent implements AfterContentInit {

    private size = eCardSize.medium;
    private cardWidth: number = cardConfig.sprites.medium.cardWidth;

    @ViewChild('vaultContainer') private spContRef;
    private spContWidth: number;

    constructor(
        private _playerService: PlayerService
    ) {
    }

    ngAfterContentInit() {
        this.spContWidth = this.spContRef.nativeElement.offsetWidth;
    }
}