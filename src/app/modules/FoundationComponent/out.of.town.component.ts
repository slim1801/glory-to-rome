import { Component, Input } from '@angular/core';

import { eWorkerType } from '../../common/card/card';

@Component({
    selector: 'out-of-town-component',
    template: `
        <div class="out-of-town-container"
            [class.architect]="role == 0"
            [class.craftsman]="role == 1"
            [class.laborer]="role == 2"
            [class.legionary]="role == 3"
            [class.merchant]="role == 4"
            [class.patron]="role == 5">
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
            transform: translate(-50%, 0%);

            color: white;
            font-size: 20px;
        }
    `]
})
export class OutOfTownComponent {

    @Input('role') private role: eWorkerType;

    constructor() {
    }
}