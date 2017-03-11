import { forEach, remove, extend } from 'lodash';

import { 
    TestBed,
    ComponentFixture
} from '@angular/core/testing';

import { eCardEffect, eWorkerType, ICard } from '../common/card/card';
import { TestHelper } from './test-helper';

import { CardFactoryService } from '../common/card/card.factory.service';
import { GameService, eActionMode } from '../common/game.service';
import { PlayerInfoService } from '../common/player.info.service';
import { PlayerService } from '../common/player.service';
import { MockSocketService } from './socket.service.mock';

export enum eSelector {
    additionalPromptText,
    additionYesButton,
    numActions,
    noButton,
    promptText,
    think,
    yesButton,
    gloryToRomeButton,

    woodFoundation,
    rubbleFoundation,
    brickFoundation,
    concreteFoundation,
    marbleFoundation,
    stoneFoundation,

    fountain,
    fountainText,
    fountainYes,

    thinkButton,
    jackButton,
    petitionButton,
    followButton,

    architectOption,
    craftsmanOption,
    laborerOption,
    legionaryOption,
    merchantOption,
    patronOption
}

export interface IServices {
    pis: PlayerInfoService,
    ps: PlayerService,
    cfs: CardFactoryService,
    gs: GameService,
    ss: MockSocketService
}

export interface IConfigureParams {
    handCards?: eCardEffect[],
    underConstruction?: {
        cardEff: eCardEffect;
        materials?: number;
    }[],
    completed?: eCardEffect[],
    pool?: eCardEffect[],
    clientelles?: eCardEffect[],
    vault?: eCardEffect[],
    stockpile?: eCardEffect[]
}

export enum eInteractable {
    interactable,
    noninteractable,
    inactive
}

export class GameTestHelper<T> {

    srvs: IServices

    constructor(
        private testHelper: TestHelper<T>,
        private fixture: ComponentFixture<T>
    ) {
    }

    setServices(srvs: IServices) {
        this.srvs = srvs;
    }

    configureState(conf: IConfigureParams) {
        let pState = this.srvs.pis.getPlayerState();

        // Create Hand Cards
        if (conf.handCards)
            this.replaceCards(conf.handCards, this.srvs.ps.handCards);

        // Create Stockpile
        if (conf.stockpile)
            this.replaceCards(conf.stockpile, pState.stockpile);

        // Create Pool
        if (conf.pool)
            this.replaceCards(conf.pool, this.srvs.gs.gameState.pool);

        // Create clientelles
        if (conf.clientelles)
            this.replaceCards(conf.clientelles, pState.clientelles);

        // Create vault
        if (conf.vault)
            this.replaceCards(conf.vault, pState.vault);
        
        // Create Completed
        if (conf.completed) {
            forEach(conf.completed, comp => {
                let newCard = this.srvs.cfs.createCard(comp);
                let completed = this.srvs.cfs.createCompletedFoundation(newCard, newCard.role, []);
                pState.completed.push(completed);
            });
        }

        // Create Under Construction
        if (conf.underConstruction) {
            forEach(conf.underConstruction, unco => {
                let newCard = this.srvs.cfs.createCard(unco.cardEff);

                let materials = [];
                let numMaterials = unco.materials !== undefined ? unco.materials : this.srvs.gs.materialsToComplete(newCard.role) - 1;
                for (let i = 0; i < numMaterials; i++) {
                    materials.push(this.srvs.cfs.createCard(unco.cardEff));
                }

                let foundation = this.srvs.cfs.createFoundation(newCard, newCard.role, materials);
                pState.underConstruction.push(foundation);
            });
        }
        this.fixture.detectChanges();
    }

    private replaceCards(replacingCards: eCardEffect[], cardToReplace: ICard[]) {
        remove(cardToReplace);
        forEach(replacingCards, card => {
            cardToReplace.push(this.srvs.cfs.createCard(card))
        });
    }

    getElement(selector: eSelector) {
        switch(selector) {
            case eSelector.additionalPromptText:
                return this.testHelper.getElement('.additional-message-text');
            case eSelector.additionYesButton:
                return this.testHelper.getElement('.additional-yes-button');
            case eSelector.numActions:
                return this.testHelper.getElement('.action-card-container .num-actions');
            case eSelector.promptText:
                return this.testHelper.getElement('.message-content .message-text');
            case eSelector.think:
                return this.testHelper.getElement('.control-buttons-container .think-button-container');
            case eSelector.yesButton:
                return this.testHelper.getElement('.message-action .yes-button');
            case eSelector.noButton:
                return this.testHelper.getElement('.message-action .no-button');

            case eSelector.woodFoundation:
                return this.testHelper.getElement('.foundation-card:nth-of-type(1)');
            case eSelector.rubbleFoundation:
                return this.testHelper.getElement('.foundation-card:nth-of-type(2)');
            case eSelector.brickFoundation:
                return this.testHelper.getElement('.foundation-card:nth-of-type(3)');
            case eSelector.concreteFoundation:
                return this.testHelper.getElement('.foundation-card:nth-of-type(4)');
            case eSelector.marbleFoundation:
                return this.testHelper.getElement('.foundation-card:nth-of-type(5)');
            case eSelector.stoneFoundation:
                return this.testHelper.getElement('.foundation-card:nth-of-type(6)');
            
            case eSelector.fountain:
                return this.testHelper.getElement('.fountain-container .fountain-card');
            case eSelector.fountainText:
                return this.testHelper.getElement('.fountain-container .fountain-message .fountain-text');
            case eSelector.fountainYes:
                return this.testHelper.getElement('.fountain-container .fountain-message .yes-button');
                
            case eSelector.thinkButton:
                return this.testHelper.getElement('.think-button-container');
            case eSelector.jackButton:
                return this.testHelper.getElement('.jack-button-container');
            case eSelector.followButton:
                return this.testHelper.getElement('.follow-button-container');
            case eSelector.petitionButton:
                return this.testHelper.getElement('.three-card-jack-container');
            
            case eSelector.architectOption:
                return this.testHelper.getElement('.architect-option');
            case eSelector.craftsmanOption:
                return this.testHelper.getElement('.craftsman-option');
            case eSelector.laborerOption:
                return this.testHelper.getElement('.laborer-option');
            case eSelector.legionaryOption:
                return this.testHelper.getElement('.legionary-option');
            case eSelector.merchantOption:
                return this.testHelper.getElement('.merchant-option');
            case eSelector.patronOption:
                return this.testHelper.getElement('.patron-option');
            case eSelector.gloryToRomeButton:
                return this.testHelper.getElement('.gtr-button');
            
        }
    }

    getHandCards() {
        return this.testHelper.getElements('.card .card-sprite');
    }

    getStockpileCards() {
        return this.testHelper.getElements('.stockpile-card-container .card-sprite');
    }

    getPoolCards() {
        return this.testHelper.getElements('.pool-card-container .card-sprite');
    }

    completeBuilding(cardEff: eCardEffect) {
        this.srvs.gs.gameState.actionMode = eActionMode.resolveCardMode;
        this.srvs.ps.activeActionItem = {
            numActions: 1,
            action: eWorkerType.craftsman,
            cardEffect: null
        };

        this.srvs.ps.selectedBuilding = this.srvs.pis.getPlayerState().underConstruction[0];
        this.srvs.ps.addMaterialToConstruction(this.srvs.cfs.createCard(cardEff));

        this.fixture.detectChanges();
    }

    checkNumAction(type: eWorkerType, num: string) {
        expect(this.srvs.pis.getPlayerState().actionCard.mode).toBe(type);
        expect(this.getElement(eSelector.numActions).innerText).toBe(num);
    }

    promptTextIs(text: string) {
        let prompt = this.getElement(eSelector.promptText);
        if (prompt)
            expect(prompt.innerText).toBe(text);
    }

    additionalPromptTextIs(text: string) {
        let prompt = this.getElement(eSelector.additionalPromptText);
        expect(prompt.innerText).toBe(text);
    }

    checkPrompt(
        promptText: string,
        yesButton?: boolean,
        noButton?: boolean
    ) {
        this.promptTextIs(promptText);
        this.promptButtonsDefined(yesButton, noButton);
        this.testHelper.click(this.getElement(eSelector.yesButton));

        this.promptTextIs('');
        this.promptButtonsDefined(false, false);
    }

    checkAdditionalPrompt(
        promptText: string,
        yesButton?: boolean
    ) {
        this.additionalPromptTextIs(promptText);
        this.additionalYesButtonDefined(true);
        this.testHelper.click(this.getElement(eSelector.additionYesButton));

        this.promptTextIs('');
        this.additionalYesButtonDefined(false);
    }

    promptButtonsDefined(yes: boolean, no: boolean) {
        let yesButton = this.getElement(eSelector.yesButton);
        let noButton = this.getElement(eSelector.noButton);

        if (yes)
            expect(yesButton).not.toBeNull('Yes Button is NULL');
        else
            expect(yesButton).toBeNull('Yes Button should not be visible');

        if (no)
            expect(noButton).not.toBeNull('No Button is NULL');
        else
            expect(noButton).toBeNull('No Button should not be visible');
    }

    additionalYesButtonDefined(yes: boolean) {
        if (yes) {
            let noButton = this.getElement(eSelector.additionYesButton);
            expect(noButton).not.toBeNull('Additional Yes Button is NULL');
        }
    }

    invokeAction(msg: string) {
        this.srvs.ss.io.invoke(msg, this.srvs.gs.gameState);
        this.fixture.detectChanges();
    }

    clickOnHandCard(index: number) {
        let handCards = this.testHelper.getElements('.card-in-hand .card');
        this.testHelper.click(handCards[index]);
    }

    clickOnStockpile(index: number) {
        let handCards = this.testHelper.getElements('.stockpile-card-container');
        this.testHelper.click(handCards[index]);
    }

    clickOnPool(index: number) {
        let poolCards = this.testHelper.getElements('.pool-card-container');
        this.testHelper.click(poolCards[index]);
    }

    clickOnUnderConstruction(index: number) {
        let uncoCards = this.testHelper.getElements('.under-construction-card-container');
        this.testHelper.click(uncoCards[index]);
    }

    clickOnClientelles(index: number) {
        let client = this.testHelper.getElements('.clientelle-card-container');
        this.testHelper.click(client[index]);
    }

    actionRoleIs(type: eWorkerType) {
        if (this.srvs.pis.getPlayerState().actionCard)
            expect(this.srvs.pis.getPlayerState().actionCard.role).toBe(type);
    }

    addPlayer(id: string, extendedProps?: any) {
        this.srvs.gs.gameState.playerStates.push(extend({
            player: {
                id,
                name: "Player 2"
            },
            completed: [],
            stockpile: [],
            underConstruction: [],
            vault: [],
            clientelles: [],
            functionAvailable: [],
            
            influence: 2,
            cardsInHand: 5,

            maxHandSize: 5,
            maxVault: 2,
            maxClientelles: 2,

            actionCard: null,
            additionalActions: [],
            jackCards: null,

            loot: [],
            hasLooted: false,
            gloryToRome: false
        }, extendedProps));
    }

    checkInteraction(cards: HTMLElement[], classes: eInteractable[]) {
        forEach(cards, (card, i) => {
            switch(classes[i]) {
                case eInteractable.interactable:
                    expect(card.classList.contains('interactable')).toBe(true); break;
                case eInteractable.noninteractable:
                    expect(card.classList.contains('interactable')).toBe(false); break;
                case eInteractable.inactive:
                    expect(card.classList.contains('inactive')).toBe(true); break;
            }
        });
    }
}