import { NgModule }      from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '../../common/common.module';

import { PlayerTemplateComponent } from './player.template.component';

import { StockpileComponent } from './Stockpile/stockpile.component';

import { UnderConstructionComponent } from './UnderConstruction/under.construction.component';
import { ClientelleComponent } from './Clientelles/clientelles.component';
import { CompletedCardComponent } from './Completed/completed.card.component';
import { CompletedComponent } from './Completed/completed.component';
import { DetailTabComponent } from './DetailTab/detail.tab.component';
import { FoundationModule } from '../FoundationComponent/foundation.module';
import { SummaryComponent, RoleBlockComponent } from './Summary/summary.component';
import { VaultComponent } from './Vault/vault.component';

import { CardModule } from '../CardComponent/card.module';
import { ControlModule } from '../ControlComponent/control.module';

import { ActionCardModule } from '../ActionCardComponent/action.card.module';
import { PoolModule } from '../PoolComponent/pool.module';

@NgModule({
    declarations: [
        PlayerTemplateComponent,
        
        StockpileComponent,
        CompletedCardComponent,
        CompletedComponent,
        ClientelleComponent,
        DetailTabComponent,
        RoleBlockComponent,
        SummaryComponent,
        UnderConstructionComponent,
        VaultComponent
    ],
    bootstrap: [ PlayerTemplateComponent ],
    imports: [
        BrowserModule,
        HttpModule,
        CommonModule,
        
        ActionCardModule,
        PoolModule,

        ControlModule,
        CardModule,
        FoundationModule
    ],
    exports: [
        PlayerTemplateComponent,
        CompletedCardComponent,
        CompletedComponent,
        ClientelleComponent,
        DetailTabComponent,
        RoleBlockComponent,
        SummaryComponent,
        UnderConstructionComponent,
        VaultComponent
    ]
})
export class PlayerTemplateModule { }
