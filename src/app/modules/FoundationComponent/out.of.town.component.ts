import { Component, Input, AfterContentInit } from '@angular/core';

import { eWorkerType } from '../../common/card/card';
import { PlayerService } from '../../common/player.service';

@Component({
    selector: 'out-of-town-component',
    template: `
        <div class="out-of-town-container"
             [ngClass]="className"
             [class.interactable]="canInteract()"
             title="out of town site">
                <div class="icon-container fa fa-gavel"></div>
        </div>
    `,
    styles: [`
        .out-of-town-container {
            height: 100%;
            width: 100%;
        }
        .icon-container {
            position: absolute;
            top: 25%;
            left: 50%;
            transform: translate(-50%, -50%);

            font-size: 25px;
        }
        .interactable {
            box-shadow: inset 0 0 4px 4px #F89406;
        }
    `]
})
export class OutOfTownComponent implements AfterContentInit {

    @Input('role') private role: eWorkerType;
    private className: string;

    constructor(
        private _playerService: PlayerService
    ) {
    }

    ngAfterContentInit() {
        switch(this.role) {
            case eWorkerType.architect: this.className = 'architect-text'; break;
            case eWorkerType.craftsman: this.className = 'craftsman-text'; break;
            case eWorkerType.laborer: this.className = 'laborer-text'; break;
            case eWorkerType.legionary: this.className = 'legionary-text'; break;
            case eWorkerType.merchant: this.className = 'merchant-text'; break;
            case eWorkerType.patron: this.className = 'patron-text'; break;
        }
    }

    canInteract() {
        return this._playerService.canAddNewBuilding(this.role);
    }
}