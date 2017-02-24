import { Component } from '@angular/core';

import { PlayerService } from '../../../common/player.service';

export interface IDetailTab {
    key: string;
    name: string;
    active: boolean;
}

@Component({
    selector: 'detail-tab',
    template: `
        <div class="detail-tab-container">
            <div class="detail-tab-col-left">
                <div class="completed-tab">
                    <div class="tab-header"><i class="fa fa-university"></i>Completed</div>
                    <completed-component></completed-component>
                </div>
                <div class="stockpile-tab">
                    <div class="tab-header"><i class="fa fa-bars"></i>Stockpile</div>
                    <stockpile-component></stockpile-component>
                </div>
                <div class="under-construction-tab">
                    <div class="tab-header"><i class="fa fa-gavel"></i>Under Construction</div>
                    <under-construction-component></under-construction-component>
                </div>
            </div>
            <div class="detail-tab-col-right">
                <foundation-component></foundation-component>
            </div>
        </div>
    `,
    styles: [`
        .detail-tab-container {
            height: 100%;
            padding: 5px;
            display: flex;
            background-color: white;
        }
        .detail-tab-col-left {
            flex-flow: column;
            flex: 1;
            display: flex;
            flex-flow: column;
        }
        .tab-header {
            font-weight: bold;
            padding-bottom: 3px;
        }
        .tab {
            text-align: center;
            font-size: bold;
            flex: 1;
            padding: 5px;
            cursor: pointer;
        }
        .active {
            background-color: #ddd;
        }
        .detail-tab-content {
            flex: 1;
            background-color: #ddd;
        }
        .under-construction-tab {
            min-height: 180px;
            z-index: 2;
        }

        .stockpile-tab {
            min-height: 80px;
            z-index: 1;
        }

        .completed-tab {
            min-height: 80px;
        }

        .under-construction-tab,
        .stockpile-tab,
        .completed-tab {
            flex: 1;
            background-color: white;
        }
        i {
            margin-right: 10px;
        }
    `]
})
export class DetailTabComponent {

    constructor(
        private _playerService: PlayerService
    ) {
    }
}