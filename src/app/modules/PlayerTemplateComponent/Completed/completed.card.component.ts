import {
    Component,
    Input,

    animate,
    state,
    style,
    transition,
    trigger
} from '@angular/core';

import { forEach } from 'lodash';
import { eCardSize, ICompletedFoundation } from '../../../common/card/card';

@Component({
    selector: 'completed-card-component',
    template: `
        <div class="completed-cards-inner-container"
            (mouseleave)="onHoverOut(compF)">
            <div class="completed-material-container"
                    *ngFor="let compM of compF.materials; let i = index">
                <card-image class="completed-material"
                            [card]="compM"
                            [size]="size"
                            [@state]="compM.animationState">
                </card-image>
            </div>
            <div class="completed-card-container"
                    [@state]="compF.building.animationState">
                <div class="completed-card-inner-container">
                    <card-image [card]="compF.building"
                                [size]="size">
                    </card-image>

                    <i class="completed-eye-icon fa fa-eye" (click)="eyeClick(compF)" aria-hidden="true"></i>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .completed-cards-inner-container {
            height: 123.8px;
            width: 89px;
            position: relative;
        }
        .completed-eye-icon {
            color: black;
            top: 5px;
            left: 10px;
            position: absolute;
            cursor: pointer;
            font-size: 15px;
            display: none;
        }
        .completed-cards-inner-container:hover .completed-eye-icon {
            display: block;
        }
        .completed-material-container {
            position: relative;
        }
        .completed-material {
            position: absolute;
        }
        .completed-card-container {
            height: 100%;
            width: 100%;
            position: absolute;
        }
        .completed-card-inner-container {
            height: 100%;
            width: 100%;
            position: relative;
        }
    `],
    animations: [
        trigger('state', [
            state('drop1', style({top: '20px'})),
            state('drop2', style({top: '40px'})),
            state('drop3', style({top: '60px'})),

            transition('none => drop1', animate('50ms ease-in')),
            transition('none => drop2', animate('50ms ease-in')),
            transition('none => drop3', animate('50ms ease-in')),
            transition('* => none', animate('50ms ease-in'))
        ])
    ]
})
export class CompletedCardComponent {

    private size = eCardSize.medium;

    @Input('completedFoundation') private compF;

    eyeClick(compF: ICompletedFoundation) {
        let matLength = compF.materials.length;
        if (matLength === 1) {
            compF.building.animationState = "drop1";
        }
        else if (matLength === 2) {
            compF.materials[1].animationState = "drop1";
            compF.building.animationState = "drop2";
        }
        else if (matLength === 3) {
            compF.materials[1].animationState = "drop1";
            compF.materials[2].animationState = "drop2";
            compF.building.animationState = "drop3";
        }
    }

    onHoverOut(compF: ICompletedFoundation) {
        compF.building.animationState = "none";
        forEach(compF.materials, mat => {
            mat.animationState = "none";
        });
    }
}