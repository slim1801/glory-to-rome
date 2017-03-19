import { remove, forEach, find, filter, concat } from 'lodash';

import {
    inject,
    TestBed,
    ComponentFixture
} from '@angular/core/testing';

import { eCardEffect, eWorkerType, ICard } from './common/card/card';

import { AppImports } from './app.module';
import { AppComponent } from './app.component';
import { TestHelper } from './test-util/test-helper';
import { GameTestHelper, IServices, eSelector, eInteractable } from './test-util/game-test-helper';

import { CardFactoryService } from './common/card/card.factory.service';
import { GameService, eActionMode } from './common/game.service';
import { PlayerInfoService } from './common/player.info.service';
import { PlayerService } from './common/player.service';

import { SocketService, IRoom } from './common/socket.service';
import { MockSocketService } from './test-util/socket.service.mock';

describe('Test whole application', () => {
    
    let fixture: ComponentFixture<AppComponent>;
    let component: AppComponent;

    let th: TestHelper<AppComponent>;
    let gth: GameTestHelper<AppComponent>

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ AppImports ],
            providers: [
                { provide: SocketService, useClass: MockSocketService }
            ],
            declarations: [ AppComponent ]
        });
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;

        th = new TestHelper<AppComponent>(fixture);
        gth = new GameTestHelper(th, fixture);
        fixture.detectChanges();

        startGame();
    });

    function startGame() {
        th.click('.create-game-button');

        component.lobbyComponent.rooms[0].numPlayers = 1;
        fixture.detectChanges();

        th.click('.exit-game-text');
    }

    const Services = [
        CardFactoryService,
        GameService,
        PlayerInfoService,
        PlayerService,
        SocketService
    ];

    const ALL_CLIENTS = [
        eCardEffect.academy,
        eCardEffect.dock,
        eCardEffect.latrine,
        eCardEffect.amphitheatre,
        eCardEffect.scriptorium,
        eCardEffect.basilica
    ]

    function mapService(services): IServices {
        return {
            cfs: services[0],
            gs: services[1],
            pis: services[2],
            ps: services[3],
            ss: services[4]
        }
    }

    function injector(callback: (srvs: IServices) => void) {
        return inject([...Services], (...services) => {
            let servs = mapService(services);
            gth.setServices(servs);
            callback(servs);
        })
    }

    // BASIC FUNCTIONALITY

    it('tests following functionality', injector(srvs => {
        gth.configureState({
            handCards: ALL_CLIENTS
        });
        srvs.ps.handCards.push(srvs.cfs.getJack());
        fixture.detectChanges();

        srvs.pis.saveActionCardToPlayerState(srvs.cfs.createCard(eCardEffect.dock));
        srvs.gs.gameState.mode = eWorkerType.craftsman;
        srvs.pis.isPlayersLead = false;

        gth.invokeAction('on card played');

        th.click(gth.getElement(eSelector.followButton));
        expect(srvs.pis.isFollowing).toBe(true);

        let handCards = gth.getHandCards();
        gth.checkInteraction(handCards, [
            eInteractable.noninteractable,
            eInteractable.interactable,
            eInteractable.noninteractable,
            eInteractable.noninteractable,
            eInteractable.noninteractable,
            eInteractable.noninteractable,
            eInteractable.interactable
        ]);
    }));

    it('tests adding material to buildings when CRAFTSMAN', injector(srvs => {
        let handCards = concat([eCardEffect.dock], ALL_CLIENTS);
        gth.configureState({
            underConstruction: [{ cardEff: eCardEffect.dock }],
            handCards
        });

        srvs.ps.handCards.push(srvs.cfs.getJack());
        fixture.detectChanges();

        gth.clickOnHandCard(0);
        gth.clickOnUnderConstruction(0);

        let hCards = gth.getHandCards();
        gth.checkInteraction(hCards, [
            eInteractable.noninteractable,
            eInteractable.interactable,
            eInteractable.noninteractable,
            eInteractable.noninteractable,
            eInteractable.noninteractable,
            eInteractable.noninteractable,
            eInteractable.noninteractable
        ]);
    }));

    it('tests adding material to buildings when ARCHITECT', injector(srvs => {
        gth.configureState({
            underConstruction: [{ cardEff: eCardEffect.dock }],
            handCards: [eCardEffect.amphitheatre],
            stockpile: ALL_CLIENTS
        });

        gth.clickOnHandCard(0);
        gth.clickOnUnderConstruction(0);

        let spCards = gth.getStockpileCards();
        gth.checkInteraction(spCards, [
            eInteractable.noninteractable,
            eInteractable.interactable,
            eInteractable.noninteractable,
            eInteractable.noninteractable,
            eInteractable.noninteractable,
            eInteractable.noninteractable
        ]);
    }));

    it('tests petitioning', injector(srvs => {
        let handCards = concat([eCardEffect.academy, eCardEffect.academy], ALL_CLIENTS);
        gth.configureState({
            handCards,
            pool: []
        });

        srvs.ps.playCardsAsJack(eWorkerType.craftsman);
        fixture.detectChanges();

        let hCards = gth.getHandCards();
        gth.checkInteraction(hCards, [
            eInteractable.interactable,
            eInteractable.interactable,
            eInteractable.interactable,
            eInteractable.noninteractable,
            eInteractable.noninteractable,
            eInteractable.noninteractable,
            eInteractable.noninteractable,
            eInteractable.noninteractable
        ]);

        // Select cards
        gth.clickOnHandCard(0);
        gth.clickOnHandCard(1);
        gth.clickOnHandCard(2);

        // Perform craftsman action
        gth.clickOnHandCard(0);
        expect(srvs.gs.gameState.pool.length).toBe(3);
    }));

    it('tests maximum clientelles', injector(srvs => {
        gth.configureState({
            handCards: [eCardEffect.basilica],
            clientelles: [eCardEffect.academy, eCardEffect.academy],
            pool: ALL_CLIENTS
        });
        
        gth.clickOnHandCard(0);

        let pCards = gth.getPoolCards();
        gth.checkInteraction(pCards, [
            eInteractable.noninteractable,
            eInteractable.noninteractable,
            eInteractable.noninteractable,
            eInteractable.noninteractable,
            eInteractable.noninteractable,
            eInteractable.noninteractable
        ]);
    }));

    it('tests maximum vault', injector(srvs => {
        gth.configureState({
            handCards: [eCardEffect.scriptorium],
            vault: [eCardEffect.academy, eCardEffect.academy],
            stockpile: ALL_CLIENTS
        });

        gth.clickOnHandCard(0);

        let spCards = gth.getStockpileCards();
        gth.checkInteraction(spCards, [
            eInteractable.noninteractable,
            eInteractable.noninteractable,
            eInteractable.noninteractable,
            eInteractable.noninteractable,
            eInteractable.noninteractable,
            eInteractable.noninteractable
        ]);
    }));

    it('tests duplicate under construction', injector(srvs => {
        gth.configureState({
            handCards: [
                eCardEffect.dock,
                eCardEffect.scriptorium,
                eCardEffect.scriptorium
            ],
            clientelles: [eCardEffect.dock]
        });

        gth.clickOnHandCard(0);
        let hCards = gth.getHandCards();
        gth.checkInteraction(hCards, [
            eInteractable.interactable,
            eInteractable.interactable
        ]);

        gth.clickOnHandCard(0);
        hCards = gth.getHandCards();
        gth.checkInteraction(hCards, [
            eInteractable.noninteractable
        ]);
    }));

    it('tests three jacks', injector(srvs => {
        gth.configureState({
            handCards: [
                eCardEffect.dock,
                eCardEffect.dock,
                eCardEffect.dock
            ]
        });

        let petitionButton = gth.getElement(eSelector.petitionButton);

        th.click(petitionButton);
        let archOption = gth.getElement(eSelector.architectOption);
        expect(archOption).toBeDefined("Architect option not visible");
        srvs.ps.playCardsAsJack(eWorkerType.architect);

        gth.checkInteraction(gth.getHandCards(), [
            eInteractable.interactable,
            eInteractable.interactable,
            eInteractable.interactable
        ]);

        let { handCards } = srvs.ps;
        gth.clickOnHandCard(0);
        expect(handCards[0].selected).toBe(true, "Card 0 should be selected");
        gth.clickOnHandCard(1);
        expect(handCards[1].selected).toBe(true, "Card 1 should be selected");
        gth.clickOnHandCard(1);
        expect(handCards[1].selected).toBe(false, "Card 1 should not be selected");
        gth.clickOnHandCard(1);
        expect(handCards[1].selected).toBe(true, "Card 1 should be selected (2)");
        gth.clickOnHandCard(2);

        expect(srvs.ps.handCards.length).toBe(0, "Hand size length should be 0");
        gth.actionRoleIs(eWorkerType.architect);

        let actionCards = th.getElements('.action-cards-as-jack');
        expect(actionCards.length).toBe(3);
    }));

    // CARD EFFECTS

    it('is testing ACADEMY functionality', injector(srvs => {
        gth.configureState({
            completed: [eCardEffect.academy]
        });

        gth.invokeAction('on turn end');
        gth.checkPrompt('[Academy] Think on turn end?', true, true);

        expect(srvs.ps.handCards.length).toBe(6);
    }));

    it('is testing AMPTHITHEATRE functionality', injector(srvs => {
        gth.configureState({
            underConstruction: [{ cardEff: eCardEffect.amphitheatre }],
            handCards: [eCardEffect.amphitheatre]
        });

        gth.completeBuilding(eCardEffect.amphitheatre);

        gth.checkPrompt('Perform CRAFTSMAN for each influence?', true, true);
        
        let activeItem = srvs.ps.activeActionItem;
        expect(activeItem.action).toBe(eWorkerType.craftsman, 'Action should be CRAFTSMAN');
        expect(activeItem.cardEffect).toBe(eCardEffect.amphitheatre, 'Completed building should be AMPHITHEATRE');
        expect(activeItem.numActions).toBe(4, 'Number of PATRON actions should be 4');

        gth.checkNumAction(eWorkerType.craftsman, '4');
    }));

    it('is testing AQUEDUCT funtionality', injector(srvs => {
        gth.configureState({
            underConstruction: [{ cardEff: eCardEffect.aqueduct }],
            handCards: [eCardEffect.amphitheatre, eCardEffect.basilica],
            pool: [eCardEffect.bridge]
        });

        gth.completeBuilding(eCardEffect.aqueduct);
        expect(srvs.pis.getPlayerState().maxClientelles).toBe(8);

        gth.clickOnHandCard(1);
        gth.actionRoleIs(eWorkerType.patron);

        gth.clickOnPool(0);
        expect(srvs.pis.getPlayerState().clientelles.length).toBe(1);

        gth.checkAdditionalPrompt('[Aqueduct] Additionally perform PATRON from hand?', true);

        gth.clickOnHandCard(0);
        expect(srvs.pis.getPlayerState().clientelles.length).toBe(2);
    }));

    it('is testing ARCHWAY functionality', injector(srvs => {
        gth.configureState({
            completed: [eCardEffect.archway],
            handCards: [eCardEffect.amphitheatre],
            underConstruction: [{
                cardEff: eCardEffect.basilica,
                materials: 0
            }],
            pool: [eCardEffect.basilica]
        });

        gth.clickOnHandCard(0);
        gth.actionRoleIs(eWorkerType.architect);

        gth.clickOnUnderConstruction(0);
        gth.clickOnPool(0);

        expect(srvs.pis.getPlayerState().underConstruction[0].materials.length).toBe(1);
    }));

    it('is testing ATRIUM functionality', injector(srvs => {
        gth.configureState({
            completed: [eCardEffect.atrium],
            handCards: [eCardEffect.scriptorium]
        });

        gth.clickOnHandCard(0);
        gth.actionRoleIs(eWorkerType.merchant);

        let deckSize = srvs.gs.gameState.deck.length;
        
        gth.checkPrompt('[Atrium] Perform MERCHANT action from DECK?', true, false);

        expect(srvs.gs.gameState.deck.length).toBeLessThan(deckSize);
        expect(srvs.pis.getPlayerState().vault.length).toBe(1);
    }));

    it('is testing BAR functionality', injector(srvs => {
        gth.configureState({
            completed: [eCardEffect.bar],
            handCards: [eCardEffect.basilica]
        });

        gth.clickOnHandCard(0);
        gth.actionRoleIs(eWorkerType.patron);

        let deckSize = srvs.gs.gameState.deck.length;

        gth.checkPrompt('[Bar] Perform PATRON action from DECK?', true, false);

        expect(srvs.gs.gameState.deck.length).toBeLessThan(deckSize);
        expect(srvs.pis.getPlayerState().clientelles.length).toBe(1);
    }));

    it('is testing BASILICA functionality', injector(srvs => {
        gth.configureState({
            completed: [eCardEffect.basilica],
            handCards: [eCardEffect.scriptorium, eCardEffect.basilica],
            stockpile: [eCardEffect.academy]
        });

        gth.clickOnHandCard(0);
        gth.actionRoleIs(eWorkerType.merchant);
        gth.promptButtonsDefined(false, false);

        gth.clickOnStockpile(0);
        expect(srvs.pis.getPlayerState().vault.length).toBe(1);

        gth.checkAdditionalPrompt('[Basilica] Additionally perform MERCHANT from hand?', true);

        gth.clickOnHandCard(0);
        expect(srvs.pis.getPlayerState().vault.length).toBe(2);
    }));

    it('is testing BATH functionality [ARCHITECT]', injector(srvs => {
        bathLoop([eCardEffect.amphitheatre], eWorkerType.architect, srvs);
    }));

    it('is testing BATH functionality [CRAFTSMAN]', injector(srvs => {
        bathLoop([eCardEffect.dock], eWorkerType.craftsman, srvs);
    }));

    it('is testing BATH functionality [LABORER]', injector(srvs => {
        bathLoop([eCardEffect.latrine], eWorkerType.laborer, srvs);
    }));

    it('is testing BATH functionality [LEGIONARY]', injector(srvs => {
        bathLoop([eCardEffect.gate], eWorkerType.legionary, srvs);
    }));

    it('is testing BATH functionality [MERCHANT]', injector(srvs => {
        bathLoop([eCardEffect.scriptorium], eWorkerType.merchant, srvs);
    }));

    it('is testing BATH functionality [PATRON]', injector(srvs => {
        bathLoop([eCardEffect.basilica, eCardEffect.insula, eCardEffect.dock], eWorkerType.patron, srvs);

        srvs.pis.getPlayerState().maxClientelles = 3;
        fixture.detectChanges();

        gth.clickOnPool(0);
        gth.checkPrompt('[Bath] Perform LABORER action?', true, true);
        gth.clickOnPool(0);
        
        expect(srvs.pis.getPlayerState().stockpile.length).toBe(1);
    }));

    function bathLoop(cardEffs: eCardEffect[], type: eWorkerType, srvs: IServices) {
        gth.configureState({
            completed: [eCardEffect.bath],
            pool: cardEffs,
            handCards: [eCardEffect.basilica]
        });

        gth.clickOnHandCard(0);
        gth.clickOnPool(0);

        let typeString = srvs.cfs.getRoleFromType(type);
        gth.checkPrompt(`[Bath] Perform ${typeString.toUpperCase()} action?`, true, true);

        let activeItem = srvs.ps.activeActionItem;
        expect(activeItem.action).toBe(type, `Action should be ${typeString}`);
        expect(activeItem.numActions).toBe(1, 'Number of actions should be 1');

    }

    it('is testing BRIDGE functionality', injector(srvs => {
        gth.configureState({
            completed: [eCardEffect.bridge, eCardEffect.palisade],
            stockpile: [eCardEffect.latrine],
            handCards: [
                eCardEffect.gate,
                eCardEffect.latrine
            ],
            pool: [eCardEffect.latrine]
        });
        // Legionary Action
        gth.clickOnHandCard(0);
        expect(gth.promptTextIs('Rome Demands...'));

        gth.clickOnHandCard(0);
        gth.checkPrompt('[Bridge] Take from opponents stockpile?', true, true);

        srvs.pis.isPlayersTurn = false;
        fixture.detectChanges();
        // Legionary from hand
        gth.clickOnHandCard(0);
        expect(srvs.ps.handCards.length).toBe(0, 'Did not legionary from hand');

        srvs.pis.isPlayersTurn = true;
        fixture.detectChanges();
        // Legionary from stockpile
        gth.clickOnStockpile(0);
        expect(srvs.pis.getPlayerState().stockpile.length).toBe(0, 'Did not legionary from stockpile');

        gth.clickOnPool(0);
        // After action is finished
        expect(srvs.gs.gameState.pool.length).toBe(1, 'Did not legionary from pool');
    }));
    
    it('is testing CATACOMB functionality', injector(srvs => {
        gth.configureState({
            underConstruction: [{ cardEff: eCardEffect.catacomb }]
        });

        gth.completeBuilding(eCardEffect.catacomb);
        expect(component.gameEnded).toBe(true);
    }));

    it('is testing CIRCUS functionality', injector(srvs => {
        gth.configureState({
            underConstruction: [{ cardEff: eCardEffect.circus }]
        });

        expect(srvs.pis.getPlayerState().cardsForJack).toBe(3);
        gth.completeBuilding(eCardEffect.circus);
        expect(srvs.pis.getPlayerState().cardsForJack).toBe(2);
    }));

    it('is testing CIRCUS MAXIMUS functionality [ARCHITECT]', injector(srvs => {
        circusMaximusLoop([eCardEffect.amphitheatre], srvs);
    }));

    it('is testing CIRCUS MAXIMUS functionality [CRAFTSMAN]', injector(srvs => {
        circusMaximusLoop([eCardEffect.dock], srvs);
    }));

    it('is testing CIRCUS MAXIMUS functionality [LABORER]', injector(srvs => {
        circusMaximusLoop([eCardEffect.latrine], srvs);
    }));

    it('is testing CIRCUS MAXIMUS functionality [LEGIONARY]', injector(srvs => {
        circusMaximusLoop([eCardEffect.bath], srvs);
    }));

    it('is testing CIRCUS MAXIMUS functionality [MERCHANT]', injector(srvs => {
        circusMaximusLoop([eCardEffect.scriptorium], srvs);
    }));

    it('is testing CIRCUS MAXIMUS functionality [PATRON]', injector(srvs => {
        circusMaximusLoop([eCardEffect.basilica], srvs);
    }));

    function circusMaximusLoop(handCards: eCardEffect[], srvs: IServices) {
        gth.configureState({
            completed: [eCardEffect.circusMaximus],
            clientelles: ALL_CLIENTS,
            handCards
        });

        gth.clickOnHandCard(0);

        let activeItem = srvs.ps.activeActionItem;
        expect(activeItem.numActions).toBe(3);
    }

    it('is testing COLISEUM functionality', injector(srvs => {
        gth.configureState({
            completed: [eCardEffect.coliseum],
            clientelles: [eCardEffect.latrine],
            handCards: [
                eCardEffect.gate,
                eCardEffect.latrine
            ],
            pool: [eCardEffect.latrine]
        });
        // Legionary Action
        gth.clickOnHandCard(0);
        expect(gth.promptTextIs('Rome Demands...'));

        gth.clickOnHandCard(0);
        gth.checkPrompt("[Coliseum] Take opponent's client's and place in VAULT?", true, true);

        srvs.pis.isPlayersTurn = false;
        fixture.detectChanges();
        // Legionary from hand
        gth.clickOnHandCard(0);
        expect(srvs.ps.handCards.length).toBe(0);

        srvs.pis.isPlayersTurn = true;
        fixture.detectChanges();
        // Legionary from stockpile
        gth.clickOnClientelles(0);
        expect(srvs.pis.getPlayerState().stockpile.length).toBe(0);

        gth.clickOnPool(0);
        // After action is finished
        expect(srvs.gs.gameState.pool.length).toBe(1);
    }));

    it('is testing DOCK functionality', injector(srvs => {
        gth.configureState({
            completed: [eCardEffect.dock],
            handCards: [eCardEffect.latrine, eCardEffect.dock],
            pool: [eCardEffect.academy]
        });

        gth.clickOnHandCard(0);
        gth.clickOnPool(0);
        expect(srvs.pis.getPlayerState().stockpile.length).toBe(1);

        gth.checkAdditionalPrompt('[Dock] Additionally perform LABORER from hand?', true);

        gth.clickOnHandCard(0);
        expect(srvs.pis.getPlayerState().stockpile.length).toBe(2);
    }));

    it('is testing FORUM functionality', injector(srvs => {
        gth.configureState({
            underConstruction: [{ cardEff: eCardEffect.forum }],
            clientelles: ALL_CLIENTS
        });
        gth.completeBuilding(eCardEffect.forum);
        expect(component.gameEnded).toBe(true);
    }));

    it('is testing FORUM functionality [STOREROOM]', injector(srvs => {
        gth.configureState({
            completed: [eCardEffect.storeroom],
            underConstruction: [{ cardEff: eCardEffect.forum }],
            clientelles: [
                eCardEffect.academy,
                eCardEffect.dock,
                eCardEffect.amphitheatre,
                eCardEffect.scriptorium,
                eCardEffect.basilica
            ]
        });
        gth.completeBuilding(eCardEffect.forum);
        expect(component.gameEnded).toBe(true);
    }));

    it('is testing FORUM functionality [LUDUS MAGNA]', injector(srvs => {
        gth.configureState({
            completed: [eCardEffect.ludusMagna],
            underConstruction: [{ cardEff: eCardEffect.forum }],
            clientelles: [
                eCardEffect.scriptorium,
                eCardEffect.scriptorium,
                eCardEffect.scriptorium,
                eCardEffect.scriptorium,
                eCardEffect.scriptorium,
                eCardEffect.scriptorium
            ]
        });
        gth.completeBuilding(eCardEffect.forum);
        expect(component.gameEnded).toBe(true);
    }));

    it('is testing FOUNDRY functionality', injector(srvs => {
        gth.configureState({
            underConstruction: [{ cardEff: eCardEffect.foundry }]
        });

        gth.completeBuilding(eCardEffect.foundry);

        gth.checkPrompt('Perform LABORER for each each influence?', true, true);

        let activeItem = srvs.ps.activeActionItem;
        expect(activeItem.action).toBe(eWorkerType.laborer, 'Action should be LABORER');
        expect(activeItem.cardEffect).toBe(eCardEffect.foundry, 'Completed building should be FOUNDRY');
        expect(activeItem.numActions).toBe(4, 'Number of LABORER actions should be 4');

    }));

    it('is testing FOUNTAIN functionality', injector(srvs => {
        gth.configureState({
            completed: [eCardEffect.fountain],
            handCards: [eCardEffect.dock],
            clientelles: [eCardEffect.dock]
        });

        gth.clickOnHandCard(0);
        gth.checkPrompt('[Fountain] Perform CRAFTSMAN from DECK?', true, false);
        checkFountainPrompt();

        th.click(gth.getElement(eSelector.fountain));
        expect(srvs.pis.getPlayerState().underConstruction.length).toBe(1);

        gth.checkPrompt('[Fountain] Perform CRAFTSMAN from DECK?', true, false);
        checkFountainPrompt();

        th.click(gth.getElement(eSelector.fountainYes));
        expect(srvs.ps.handCards.length).toBe(1);
    }));

    function checkFountainPrompt() {
        let promptText = gth.getElement(eSelector.fountainText);
        expect(promptText.innerText).toBe('Add to hand?');
        expect(gth.getElement(eSelector.fountainText)).not.toBeNull();
    }

    it('is testing GARDEN functionality', injector(srvs => {
        gth.configureState({
            underConstruction: [{ cardEff: eCardEffect.garden }]
        });

        gth.completeBuilding(eCardEffect.garden);

        gth.checkPrompt('Perform PATRON for each influence?', true, true);
        
        let activeItem = srvs.ps.activeActionItem;
        expect(activeItem.action).toBe(eWorkerType.patron, 'Action should be PATRON');
        expect(activeItem.cardEffect).toBe(eCardEffect.garden, 'Completed building should be GARDEN');
        expect(activeItem.numActions).toBe(5, 'Number of PATRON actions should be 5');

        gth.checkNumAction(eWorkerType.patron, '5');
    }));

    it('is testing GATE functionality', injector(srvs => {
        gth.configureState({
            underConstruction: [
                { cardEff: eCardEffect.gate },
                { cardEff: eCardEffect.temple }
            ]
        });

        gth.completeBuilding(eCardEffect.gate);
        expect(srvs.pis.getPlayerState().maxHandSize).toBe(9);
    }));

    it('is testing INSULA functionality', injector(srvs => {
        gth.configureState({
            underConstruction: [{ cardEff: eCardEffect.insula }]
        });

        let maxClients = srvs.pis.getPlayerState().maxClientelles;
        expect(maxClients).toBe(2);

        gth.completeBuilding(eCardEffect.insula);
        expect(srvs.pis.getPlayerState().maxClientelles).toBe(5);
    }));

    it('is testing LATRINE functionality', injector(srvs => {
        gth.configureState({
            completed: [eCardEffect.latrine],
            handCards: [eCardEffect.academy],
            pool: []
        });

        th.click(gth.getElement(eSelector.think));
        expect(srvs.gs.gameState.pool.length).toBe(0);

        gth.checkPrompt('[Latrine] Discard one card to POOL before THINKER action?', true, true);

        gth.clickOnHandCard(0);
        expect(srvs.gs.gameState.pool.length).toBe(1);
        expect(srvs.ps.handCards.length).toBe(5);
    }));

    it('is testing LUDUS MAGNA functionality [ARCHITECT]', injector(srvs => {
        ludusMagnaLoop(eCardEffect.amphitheatre, srvs);
    }));

    it('is testing LUDUS MAGNA functionality [CRAFTSMAN]', injector(srvs => {
        ludusMagnaLoop(eCardEffect.dock, srvs);
    }));

    it('is testing LUDUS MAGNA functionality [LABORER]', injector(srvs => {
        ludusMagnaLoop(eCardEffect.latrine, srvs);
    }));

    it('is testing LUDUS MAGNA functionality [LEGIONARY]', injector(srvs => {
        ludusMagnaLoop(eCardEffect.gate, srvs);
    }));

    it('is testing LUDUS MAGNA functionality [MARBLE]', injector(srvs => {
        ludusMagnaLoop(eCardEffect.basilica, srvs);
    }));

    it('is testing LUDUS MAGNA functionality [STONE]', injector(srvs => {
        ludusMagnaLoop(eCardEffect.scriptorium, srvs);
    }));

    function ludusMagnaLoop(handCard: eCardEffect, srvs: IServices) {
        gth.configureState({
            completed: [eCardEffect.ludusMagna],
            clientelles: ALL_CLIENTS,
            handCards: [handCard],
        });

        gth.clickOnHandCard(0);
        
        let activeItem = srvs.ps.activeActionItem;
        expect(activeItem.numActions).toBe(activeItem.action === eWorkerType.merchant ? 2 : 3, 'Number of actions should be 2');
    }

    it('is testing MARKET functionality', injector(srvs => {
        gth.configureState({
            underConstruction: [{ cardEff: eCardEffect.market }]
        });

        let maxClients = srvs.pis.getPlayerState().maxVault;
        expect(maxClients).toBe(2);

        gth.completeBuilding(eCardEffect.market);
        expect(srvs.pis.getPlayerState().maxVault).toBe(5);
    }));

    it('is testing ROAD functionality', injector(srvs => {
        gth.configureState({
            completed: [eCardEffect.road],
            underConstruction: [{ cardEff: eCardEffect.scriptorium, materials: 0}],
            handCards: [
                // Testing wood
                eCardEffect.dock,
                eCardEffect.dock,
                // Testing rubble
                eCardEffect.dock,
                eCardEffect.latrine,
                // Testing brick
                eCardEffect.dock,
                eCardEffect.shrine,
                // Testing concrete
                eCardEffect.dock,
                eCardEffect.amphitheatre,
                // Testing stone
                eCardEffect.dock,
                eCardEffect.scriptorium,
                // Testing marble
                eCardEffect.dock,
                eCardEffect.basilica,
            ]
        });
        
        for (let i = 0; i < 5; i++) {
            roadLoop(srvs, i);
        }
    }));

    function roadLoop(srvs: IServices, index: number) {
        gth.clickOnHandCard(0);
        gth.clickOnUnderConstruction(0);
        gth.clickOnHandCard(0);

        expect(srvs.ps.handCards.length).toBe(12 - (index * 2 + 2), "Hand size is incorrect");

        let materials = srvs.pis.getPlayerState().underConstruction[0].materials;
        expect(materials.length).toBe(1, "Materials should be 1");
        remove(materials);
    }

    it('is testing PALACE functionality', injector(srvs => {
        gth.configureState({
            completed: [eCardEffect.palace],
            handCards: [eCardEffect.dock, eCardEffect.dock, eCardEffect.dock]
        });

        gth.clickOnHandCard(0);

        gth.promptTextIs('[Palace] Play multiple cards of the same role for additional actions?');
        gth.promptButtonsDefined(true, true);
        th.click(gth.getElement(eSelector.yesButton));

        gth.promptTextIs('[Palace] Finish playing cards?');
        gth.promptButtonsDefined(true, false);

        gth.clickOnHandCard(0);
        th.click(gth.getElement(eSelector.yesButton));
        
        let activeItem = srvs.ps.activeActionItem;
        expect(activeItem.action).toBe(eWorkerType.craftsman, 'Action should be CRAFTSMAN');
        expect(activeItem.numActions).toBe(2, 'Number of PATRON actions should be 2');

    }));

    it('is testing PALISADES functionality', injector(srvs => {
        gth.configureState({
            completed: [eCardEffect.palisade],
            handCards: [
                eCardEffect.gate,
                eCardEffect.latrine
            ]
        });

        spyOn(srvs.ps, 'extortMaterial');
        // Start legionary action
        gth.clickOnHandCard(0);
        // Demand material
        gth.clickOnHandCard(0);
        gth.invokeAction('on rome demands');
        expect(srvs.ps.extortMaterial).toHaveBeenCalled();
    }));

    it('is testing PRISON functionality', injector(srvs => {
        gth.configureState({
            underConstruction: [{ cardEff: eCardEffect.prison }]
        });

        gth.addPlayer("0", {
            completed: [srvs.cfs.createCompletedFoundation(
                srvs.cfs.createCard(eCardEffect.shrine),
                eWorkerType.legionary,
                []
            )]
        });

        gth.completeBuilding(eCardEffect.prison);
        gth.checkPrompt("Exchange 3 INFLUENCE for opponent's structure?", true, true);

        let comp = th.getElement('.opponent-completed');
        th.click(comp);

        expect(srvs.pis.getPlayerState().completed.length).toBe(2);
        expect(srvs.pis.getPlayerState().influence).toBe(2);
        expect(srvs.pis.getPlayerState().maxHandSize).toBe(7);
    }));

    it('is testing SCHOOL functionality', injector(srvs => {
        gth.configureState({
            underConstruction: [{ cardEff: eCardEffect.school }],
            handCards: []
        });

        gth.completeBuilding(eCardEffect.school);
        gth.checkPrompt('Perform THINKER action for each influence?', true, true);
        expect(srvs.ps.handCards.length).toBe(8);
    }));

    it('is testing SCRIPTORIUM functionality', injector(srvs => {
        gth.configureState({
            completed: [eCardEffect.scriptorium],
            underConstruction: [{
                cardEff: eCardEffect.latrine,
            }, {
                cardEff: eCardEffect.shrine
            }, {
                cardEff: eCardEffect.temple
            }],
            handCards: [
                eCardEffect.dock,
                eCardEffect.basilica,
                eCardEffect.dock,
                eCardEffect.basilica,
                eCardEffect.dock,
                eCardEffect.basilica,
            ]
        });

        for (let i = 0; i < 3; i++) {
            scriptoriumLoop(srvs, i);
        }
    }));
    
    function scriptoriumLoop(srvs: IServices, index: number) {
        gth.clickOnHandCard(0);
        gth.actionRoleIs(eWorkerType.craftsman);

        gth.clickOnUnderConstruction(0);
        gth.clickOnHandCard(0);
        
        expect(srvs.pis.getPlayerState().completed.length).toBe(index + 2);
    }

    it('is testing SENATE functionality', injector(srvs => {
        gth.configureState({
            completed: [eCardEffect.senate],
            handCards: []
        });
        let jackCard = srvs.cfs.getJack();
        jackCard.setMode(eWorkerType.craftsman);

        srvs.pis.getPlayerState().actionCard = jackCard;

        let jackCard2 = srvs.cfs.getJack();
        jackCard2.setMode(eWorkerType.craftsman);

        gth.addPlayer("0", {
            actionCard: jackCard2
        });

        gth.invokeAction('on turn end');
        gth.checkPrompt("[Senate] Take opponent's JACK's", true, true);

        let jacksInHand = filter(srvs.ps.handCards, handCard => handCard.role == eWorkerType.jack);
        expect(jacksInHand.length).toBe(1);
    }));

    it('is testing SEWER functionality', injector(srvs => {
        gth.configureState({
            completed: [eCardEffect.sewer],
            handCards: [
                eCardEffect.dock,
                eCardEffect.academy
            ]
        });

        gth.clickOnHandCard(0);
        gth.clickOnHandCard(0);

        gth.checkPrompt('[Sewer] Place order card into STOCKPILE?', true, true);

        expect(srvs.pis.getPlayerState().stockpile.length).toBe(1);
    }));

    it('is testing SHRINE functionality', injector(srvs => {
        gth.configureState({
            underConstruction: [{ cardEff: eCardEffect.shrine }]
        });

        expect(srvs.pis.getPlayerState().maxHandSize).toBe(5);
        gth.completeBuilding(eCardEffect.shrine);
        expect(srvs.pis.getPlayerState().maxHandSize).toBe(7);
    }));

    it('is testing STAIRWAY functionality', injector(srvs => {
        stairwayFunction(srvs, eCardEffect.gate);
    }));

    function stairwayFunction(srvs: IServices, cardEff: eCardEffect) {
        gth.configureState({
            completed: [eCardEffect.stairway],
            handCards: [eCardEffect.amphitheatre],
            stockpile: [cardEff]
        });

        gth.addPlayer("0", {
            completed: [srvs.cfs.createCompletedFoundation(
                srvs.cfs.createCard(cardEff),
                eWorkerType.legionary,
                []
            )]
        });

        gth.clickOnHandCard(0);
        gth.checkPrompt("[Stairway] Add material to opponent's structure to make PUBLIC?", true, false);

        let comp = th.getElement('.opponent-completed');
        th.click(comp);
        gth.clickOnStockpile(0);
        
        expect(srvs.gs.gameState.publicBuildings.length).toBe(1);
    }

    // Test for no stockpile available for STAIRWAY

    it('is testing STATUE functionality [WOOD]', injector(srvs => {
        statueLoop(eSelector.woodFoundation, eWorkerType.craftsman, srvs);
    }));

    it('is testing STATUE functionality [RUBBLE]', injector(srvs => {
        statueLoop(eSelector.rubbleFoundation, eWorkerType.laborer, srvs);
    }));

    it('is testing STATUE functionality [BRICK]', injector(srvs => {
        statueLoop(eSelector.brickFoundation, eWorkerType.legionary, srvs);
    }));

    it('is testing STATUE functionality [CONCRETE]', injector(srvs => {
        statueLoop(eSelector.concreteFoundation, eWorkerType.architect, srvs);
    }));

    it('is testing STATUE functionality [STONE]', injector(srvs => {
        statueLoop(eSelector.stoneFoundation, eWorkerType.merchant, srvs);
    }));

    it('is testing STATUE functionality [MARBLE]', injector(srvs => {
        statueLoop(eSelector.marbleFoundation, eWorkerType.patron, srvs);
    }));

    it('is testing STATUE functionality [WOOD] same material', injector(srvs => {
        statueLoop(eSelector.woodFoundation, eWorkerType.craftsman, srvs, eCardEffect.dock);
    }));

    it('is testing STATUE functionality [RUBBLE] same material', injector(srvs => {
        statueLoop(eSelector.rubbleFoundation, eWorkerType.laborer, srvs, eCardEffect.latrine);
    }));

    it('is testing STATUE functionality [BRICK] same material', injector(srvs => {
        statueLoop(eSelector.brickFoundation, eWorkerType.legionary, srvs, eCardEffect.gate);
    }));

    it('is testing STATUE functionality [CONCRETE] same material', injector(srvs => {
        statueLoop(eSelector.concreteFoundation, eWorkerType.architect, srvs, eCardEffect.amphitheatre);
    }));

    it('is testing STATUE functionality [STONE] same material', injector(srvs => {
        statueLoop(eSelector.stoneFoundation, eWorkerType.merchant, srvs, eCardEffect.scriptorium);
    }));

    it('is testing STATUE functionality [MARBLE] same material', injector(srvs => {
        statueLoop(eSelector.marbleFoundation, eWorkerType.patron, srvs, eCardEffect.basilica);
    }));

    function statueLoop(foundation: eSelector, type: eWorkerType, srvs: IServices, material?: eCardEffect) {
        gth.configureState({
            handCards: [
                eCardEffect.dock,
                eCardEffect.statue,

                eCardEffect.dock,
                material !== undefined ? material : eCardEffect.basilica
            ]
        });

        gth.clickOnHandCard(0);
        gth.clickOnHandCard(0);

        th.click(gth.getElement(foundation));
        
        let underCo = srvs.pis.getPlayerState().underConstruction;
        expect(underCo.length).toBe(1, 'Under construction should have site');
        expect(underCo[0].site.role).toBe(type, 'Site type is not the same');

        gth.clickOnHandCard(0);
        gth.clickOnUnderConstruction(0);
        gth.clickOnHandCard(0);

        if (type === eWorkerType.laborer || type === eWorkerType.craftsman) {
            expect(srvs.pis.getPlayerState().completed.length).toBe(1, 'Building should be completed');
        }
        else {
            expect(srvs.pis.getPlayerState().underConstruction[0].materials.length).toBe(1, 'There should be one material');
        }
    }

    it('is testing STOREROOM functionality', injector(srvs => {
        gth.configureState({
            completed: [eCardEffect.storeroom],
            clientelles: [eCardEffect.dock, eCardEffect.latrine, eCardEffect.basilica],
            handCards: [eCardEffect.latrine]
        });

        gth.clickOnHandCard(0);
        gth.actionRoleIs(eWorkerType.laborer);
        
        let activeItem = srvs.ps.activeActionItem;
        expect(activeItem.numActions).toBe(4, 'Number of LABORER actions should be 4');
    }));

    it('is testing TEMPLE functionality', injector(srvs => {
        gth.configureState({
            underConstruction: [{ cardEff: eCardEffect.temple }]
        });

        expect(srvs.pis.getPlayerState().maxHandSize).toBe(5);
        gth.completeBuilding(eCardEffect.temple);
        expect(srvs.pis.getPlayerState().maxHandSize).toBe(9);
    }));

    it('is testing TOWER functionality', injector(srvs => {
        gth.configureState({
            completed: [eCardEffect.tower],
            underConstruction: [
                { cardEff: eCardEffect.gate },
                { cardEff: eCardEffect.market },
                { cardEff: eCardEffect.latrine },
                { cardEff: eCardEffect.temple },
                { cardEff: eCardEffect.scriptorium },
                { cardEff: eCardEffect.vomitorium }
            ],
            handCards: [
                // Testing wood
                eCardEffect.dock,
                eCardEffect.latrine,
                // Testing rubble
                eCardEffect.dock,
                eCardEffect.latrine,
                // Testing brick
                eCardEffect.dock,
                eCardEffect.latrine,
                // Testing concrete
                eCardEffect.dock,
                eCardEffect.latrine,
                // Testing stone
                eCardEffect.dock,
                eCardEffect.latrine,
                // Testing marble
                eCardEffect.dock,
                eCardEffect.latrine
            ]
        });

        for (let i = 0; i < 5; i++) {
            towerLoop();
        }
    }));

    function towerLoop() {
        gth.clickOnHandCard(0);
        gth.clickOnUnderConstruction(0);
        gth.clickOnHandCard(0);
    }

    it('is testing TOWER site functionality', injector(srvs => {
        gth.configureState({
            completed: [eCardEffect.tower],
            handCards: [
                // Testing concrete
                eCardEffect.dock,
                eCardEffect.vomitorium,
                // Testing wood
                eCardEffect.dock,
                eCardEffect.market,
                // Testing rubble
                eCardEffect.dock,
                eCardEffect.latrine,
                // Testing brick
                eCardEffect.dock,
                eCardEffect.gate,
                // Testing stone
                eCardEffect.dock,
                eCardEffect.scriptorium,
                // Testing marble
                eCardEffect.dock,
                eCardEffect.temple
            ]
        });

        fixture.detectChanges();

        for (let i = 0; i < 6; i++) {
            srvs.gs.gameState.foundations[i].inTown = 0;
            gth.clickOnHandCard(0);
            gth.clickOnHandCard(0);
            expect(srvs.ps.handCards.length).toBe(12 - (i * 2 + 2), "Hand size is wrong");
            expect(srvs.pis.getPlayerState().underConstruction.length).toBe(i + 1, "Under Construction is wrong");
            srvs.gs.gameState.foundations[i].inTown = 2;
        }

    }));

    it('is testing VILLA functionality', injector(srvs => {
        gth.configureState({
            underConstruction: [{ cardEff: eCardEffect.villa, materials: 0 }],
            handCards: [eCardEffect.amphitheatre],
            stockpile: [eCardEffect.scriptorium]
        });

        gth.clickOnHandCard(0);
        gth.clickOnUnderConstruction(0);
        gth.clickOnStockpile(0);

        gth.checkPrompt('Complete VILLA?', true, true);

        expect(srvs.pis.getPlayerState().completed.length).toBe(1);
    }));

    it('is testing VOMITORIUM functionality', injector(srvs => {
        gth.configureState({
            completed: [eCardEffect.vomitorium],
            pool: [],
            handCards: [eCardEffect.academy, eCardEffect.amphitheatre, eCardEffect.aqueduct]
        });

        th.click(gth.getElement(eSelector.think));
        expect(srvs.gs.gameState.pool.length).toBe(0);

        gth.checkPrompt('[Vomitorium] Discard all cards to POOL before THINKER action?', true, true);

        expect(srvs.gs.gameState.pool.length).toBe(3);
        expect(srvs.ps.handCards.length).toBe(5);
    }));

    it('is testing WALL functionality', injector(srvs => {
        gth.configureState({
            completed: [eCardEffect.wall],
            handCards: [
                eCardEffect.gate,
                eCardEffect.latrine
            ]
        });

        spyOn(srvs.ps, 'extortMaterial');
        // Start legionary action
        gth.clickOnHandCard(0);
        // Demand material
        gth.clickOnHandCard(0);
        gth.invokeAction('on rome demands');
        expect(srvs.ps.extortMaterial).toHaveBeenCalled();
    }));

    it('is testing WALL game end functionality', injector(srvs => {
        gth.configureState({
            completed: [eCardEffect.wall],
            stockpile: ALL_CLIENTS
        });
        gth.invokeAction('game ended');
        expect(component.endGameResult[0].wallBonus).toBe(3);
    }));

    // SPECIAL CASES

    // FORUM STAIRWAY COMBO

    it('is testing STAIRWAY into FORUM', injector(srvs => {
        stairwayFunction(srvs, eCardEffect.forum);
        expect(component.gameEnded).toBe(true);
    }));

    it('is testing GATE into FORUM', injector(srvs => {
        gth.configureState({
            underConstruction: [
                { cardEff: eCardEffect.gate },
                { cardEff: eCardEffect.forum }
            ],
            clientelles: ALL_CLIENTS
        });
        gth.completeBuilding(eCardEffect.gate);
        expect(component.gameEnded).toBe(true);
    }));
});