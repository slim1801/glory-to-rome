import { Component } from '@angular/core';

import { ICard, eCardSize, eCardEffect, eWorkerType } from '../../common/card/card';
import { PlayerService } from '../../common/player.service';
import { PlayerInfoService } from '../../common/player.info.service';
import { CardFactoryService } from '../../common/card/card.factory.service';
import { GameService, eLegionaryStage, eActionMode } from '../../common/game.service';
import { GameMechanicsService } from '../../common/game.mechanics.service';
import { SocketService } from '../../common/socket.service';

@Component({
    selector: 'player-template',
    templateUrl: './player.template.html',
    styleUrls: ['./player.template.styles.css']
})
export class PlayerTemplateComponent {

    size = eCardSize.medium;

    constructor(
        private _playerInfoService: PlayerInfoService,
        private _playerService: PlayerService,
        private _gameService: GameService,
        private _gameMechanicsService: GameMechanicsService,
        private _cardFactoryService: CardFactoryService,
        private _socketService: SocketService

    ) {
        this._gameMechanicsService.onActionEnd().subscribe(() => {
            this.currCompleted = null;
            this.selected = false;
        });
    }

    romeIsDemanding() {
        return this._gameService.gameState.legionaryStage === eLegionaryStage.romeDemanding;
    }

    yesAction = null;
    noAction = null;
    currCompleted: eCardEffect = null;
    selected: boolean = false;

    message() {
        if (this.selected) {
            if (this._playerService.actionPerformTrigger === eCardEffect.palace) {
                this.currCompleted = eCardEffect.palace;
                this.yesAction = this._palaceFinishAction;
                this.noAction = null;
                return `[Palace] Finish playing cards?`;
            }
            return;
        }

        if (
            this._playerInfoService.isPlayersTurn &&
            this._gameMechanicsService.getMode() == eWorkerType.legionary &&
            this._gameService.gameState.legionaryStage === eLegionaryStage.declare &&
            (this._playerService.actionPerformTrigger !== eCardEffect.bridge &&
                this._playerService.actionPerformTrigger !== eCardEffect.coliseum)
        ) {
            return `Rome Demands...`;
        }

        // else if (completed.length > 0) {

        //     // Prison trigger
        //     let prison = this._playerService.isInActionStack(eCardEffect.prison);
        //     if (prison) {
        //         this.currCompleted = eCardEffect.prison;
        //         this.yesAction = this._prisonYesAction;
        //         this.noAction = this._prisonNoAction;
        //         return `Exchange 3 INFLUENCE for opponent's structure?`;
        //     }

        //     // School trigger
        //     let school = this._playerService.isInActionStack(eCardEffect.school);
        //     if (school) {
        //         this.yesAction = this._schoolYesAction
        //         this.noAction = this.noCompletionAction;
        //         this.currCompleted = eCardEffect.prison;
        //         return `Perform THINKER action for each influence?`;
        //     }
        // }

        // Academy trigger
        else if (this._playerService.actionFinishTrigger === eCardEffect.academy) {
            this.currCompleted = eCardEffect.academy;
            this.yesAction = this._academyYesAction;
            this.noAction = this.noTurnFinish;
            return `[Academy] Think on turn end?`;
        }
        // Amphitheatre trigger
        else if (this._playerService.actionPerformTrigger === eCardEffect.amphitheatre) {
            this.yesAction = this.yesResolveAction;
            this.noAction = this.noCompletionAction;
            return `Perform CRAFSTMAN for each each influence?`;
        }
        // Atrium trigger
        else if (this._playerService.actionPerformTrigger === eCardEffect.atrium) {
            this.currCompleted = eCardEffect.atrium;
            this.yesAction = this._atriumYesAction;
            this.noAction = null;
            return `[Atrium] Perform MERCHANT action from DECK?`;
        }
        // Bar trigger
        else if (this._playerService.actionPerformTrigger === eCardEffect.bar) {
            this.yesAction = this._barYesAction;
            return `[Bar] Perform PATRON action from DECK?`;
        }
        // Bath trigger
        else if (this._playerService.actionPerformTrigger === eCardEffect.bath) {
            this.currCompleted = eCardEffect.bath;
            this.yesAction = this._bathYesAction;
            this.noAction = this.noActionFinish;

            let clientelles = this._playerInfoService.getPlayerState().clientelles;
            let client = clientelles[clientelles.length - 1];

            return `[Bath] Perform ${this._cardFactoryService.getRole(client).toUpperCase()} action?`;
        }
        // Bridge trigger
        else if (this._playerService.actionPerformTrigger === eCardEffect.bridge) {
            this.currCompleted = eCardEffect.bridge;
            this.yesAction = this._bridgeYesAction;
            this.noAction = this._bridgeNoAction;
            return `[Bridge] Take from opponents stockpile?`;
        }
        // Coliseum trigger
        else if (this._playerService.actionPerformTrigger === eCardEffect.coliseum) {
            this.yesAction = this._coliseumYesAction;
            this.noAction = this._coliseumNoAction;
            return `[Coliseum] Take opponent's client's and place in VAULT?`;
        }
        // Foundry trigger
        else if (this._playerService.actionPerformTrigger === eCardEffect.foundry) {
            this.yesAction = this.yesResolveAction;
            this.noAction = this.noCompletionAction;
            return `Perform LABORER for each each influence?`;
        }
        // Fountain trigger
        else if (this._playerService.fountainCondition()) {
            this.yesAction = this._fountainYesAction;
            return `[Fountain] Perform CRAFTSMAN from DECK?`;
        }
        // Garden trigger
        else if (this._playerService.actionPerformTrigger === eCardEffect.garden) {
            this.yesAction = this.yesResolveAction;
            this.noAction = this.noCompletionAction;
            return `Perform PATRON action for each influence?`;
        }
        // Latrine trigger
        else if (this._playerService.actionPerformTrigger === eCardEffect.latrine) {
            this.yesAction = this._latrineYesAction;
            this.noAction = this.noThink;
            return `[Latrine] Discard one card to POOL before THINKER action?`;
        }
        // Palace trigger
        else if (this._playerService.actionPerformTrigger === eCardEffect.palace) {
            this.currCompleted = eCardEffect.palace;
            this.yesAction = this._palaceYesAction;
            this.noAction = this._palaceNoAction;
            return `[Palace] Play multiple cards of the same role for additional actions?`;
        }
        // Senate trigger
        else if (this._playerService.actionFinishTrigger === eCardEffect.senate) {
            this.currCompleted = eCardEffect.senate;
            this.yesAction = this._senateYesAction;
            this.noAction = this.noTurnFinish;
            return `[Senate] Take opponent's JACK's`;
        }
        // Sewer trigger
        else if (this._playerService.actionFinishTrigger === eCardEffect.sewer) {
            this.currCompleted = eCardEffect.sewer;
            this.yesAction = this._sewerYesAction;
            this.noAction = this.noTurnFinish;
            return `[Sewer] Place order card into STOCKPILE?`;
        }
        // Stairway trigger
        else if (this._playerService.actionPerformTrigger === eCardEffect.stairway) {
            this.yesAction = this._stairwayYesAction;
            return `[Stairway] Add material to opponent's structure to make PUBLIC?`;
        }
        // Statue trigger
        else if (this._playerService.actionPerformTrigger === eCardEffect.statue) {
            this.currCompleted = eCardEffect.statue;
            this.yesAction = null;
            this.noAction = null;
            return `Select a foundation to build your STATUE`;
        }
        // Villa trigger
        else if (this._playerService.villaCanBeCompleted()) {
            this.noAction = this.noActionFinish;
            this.yesAction = this._villaAction;
            this.currCompleted = eCardEffect.villa;
            return `Complete VILLA?`
        }
        // Vomitorium trigger
        else if (this._playerService.actionPerformTrigger == eCardEffect.vomitorium) {
            this.noAction = this.noThink;
            this.yesAction = this._vomitoriumAction;
            this.currCompleted = eCardEffect.vomitorium;
            return `[Vomitorium] Discard all cards to POOL before THINKER action?`
        }
    }

    yesVisible = () => {
        let perfTrig = this._playerService.actionPerformTrigger;
        return  this.currCompleted == eCardEffect.school ||
                this.currCompleted == eCardEffect.villa ||
                this.currCompleted == eCardEffect.academy || 
                perfTrig == eCardEffect.amphitheatre || 
                this.currCompleted == eCardEffect.atrium || 
                perfTrig == eCardEffect.bar ||
                this.currCompleted == eCardEffect.bath ||
                perfTrig == eCardEffect.bridge ||
                perfTrig == eCardEffect.coliseum ||
                perfTrig == eCardEffect.foundry ||
                this._playerService.fountainCondition() ||
                perfTrig == eCardEffect.garden ||
                perfTrig == eCardEffect.latrine ||
                this.currCompleted == eCardEffect.palace ||
                this.currCompleted == eCardEffect.prison ||
                this.currCompleted == eCardEffect.senate ||
                this.currCompleted == eCardEffect.sewer ||
                perfTrig == eCardEffect.stairway ||
                this.currCompleted == eCardEffect.vomitorium;
    }

    yesResolveAction() {
        this._playerService.actionPerformTrigger = null;
        this._playerService.resolveNextActionState();
    }

    yesClicked() {
        this._playerService.resolvingCard = false;
        this.yesAction && this.yesAction();
    }

    noVisible = () => {
        let perfTrig = this._playerService.actionPerformTrigger;
        return  this.currCompleted == eCardEffect.school ||
                this.currCompleted == eCardEffect.garden ||
                this.currCompleted == eCardEffect.villa ||
                this.currCompleted == eCardEffect.academy ||
                perfTrig == eCardEffect.amphitheatre ||
                this.currCompleted == eCardEffect.bath ||
                perfTrig == eCardEffect.bridge ||
                perfTrig == eCardEffect.coliseum ||
                perfTrig == eCardEffect.foundry ||
                perfTrig == eCardEffect.garden ||
                perfTrig == eCardEffect.latrine ||
                (this.currCompleted == eCardEffect.palace && this._playerService.resolvingCard) ||
                this.currCompleted == eCardEffect.prison ||
                this.currCompleted == eCardEffect.senate ||
                this.currCompleted == eCardEffect.sewer ||
                this.currCompleted == eCardEffect.vomitorium;
    }

    noActionFinish() {
        this._playerService.actionFinished();
    }

    noCompletionAction() {
        this._playerService.resolvingCard = false;
        this._playerService.resolveActionStack();
    }

    noTurnFinish() {
        this._playerService.turnFinished();
    }

    noThink() {
        this._playerService.resolvingCard = false;
        this._playerService.thinkAction();
    }

    noClicked() {
        this.currCompleted = null;
        this.noAction && this.noAction();
    }

    additionalActionMessage() {
        let additionTrig = this._playerService.additionalActionTrigger;
        // Aqueduct trigger
        if (additionTrig === eCardEffect.aqueduct) {
            this.yesAction = () => this._yesAdditional(eCardEffect.aqueduct);
            return `[Aqueduct] Addtionally perform PATRON from hand?`;
        }
        // Basilica trigger
        else if (additionTrig === eCardEffect.basilica) {
            this.yesAction = () => this._yesAdditional(eCardEffect.basilica);
            return `[Basilica] Addtionally perform MERCHANT from hand?`;
        }
        // Dock trigger
        else if (additionTrig === eCardEffect.dock) {
            this.yesAction = () => this._yesAdditional(eCardEffect.dock);
            return `[Dock] Addtionally perform LABORER from hand?`;
        }
    }

    additionalYesVisible() {
        let additionTrig = this._playerService.additionalActionTrigger;
        return  additionTrig === eCardEffect.aqueduct ||
                additionTrig === eCardEffect.basilica ||
                additionTrig === eCardEffect.dock;
    }

    // AQUEDUCT
    private _yesAdditional(effect: eCardEffect) {
        this._playerService.additionalActionTrigger = null;
        this._playerService.activeActionTrigger = effect;
    }

    // ACADEMY
    private _academyYesAction() {
        this._playerService.actionFinishTrigger = null;
        this._playerService.think();
        this._playerService.turnFinished();
    }

    // ATRIUM
    private _atriumYesAction() {
        let card = this._playerService.drawCardsFromDeck(1);
        if (card !== null) {
            this._playerService.addToVault(card);
            this._playerService.decrementActions();
        }
    }

    // BAR
    private _barYesAction() {
        let card = this._playerService.drawCardsFromDeck(1);
        if (card !== null) {
            if (this._playerService.addToClientelles(card[0]))
                this._playerService.decrementActions();
        }
    }

    // BRIDGE
    private _bridgeYesAction() {
        this._gameService.gameState.actionTriggers.push(eCardEffect.bridge);
        this._checkForColiseum();
    }

    private _bridgeNoAction() {
        this._checkForColiseum();
    }

    private _checkForColiseum() {
        let ps = this._playerService;
        if (ps.hasCompletedBuilding(eCardEffect.coliseum)) {
            ps.resolvingCard = true;
            ps.actionPerformTrigger = eCardEffect.coliseum;
        }
        else {
            ps.resolvingCard = false;
            ps.actionPerformTrigger = null;
            this._socketService.romeDemands();
        }
    }

    // BATH
    private _bathYesAction() {

        let clientelles = this._playerInfoService.getPlayerState().clientelles;
        let card = clientelles[clientelles.length - 1];

        this._playerService.actionStack.push({
            numActions: 1,
            action: card.role,
            cardEffect: card.id
        });

        this._playerService.resolveNextActionState();
        this._gameMechanicsService.cardPerform();
    }

    // COLISEUM

    private _coliseumYesAction() {
        this._gameService.gameState.actionTriggers.push(eCardEffect.coliseum);
        this._playerService.resolvingCard = false;
        this._playerService.actionPerformTrigger = null;
        this._socketService.romeDemands();
    }

    private _coliseumNoAction() {
        this._playerService.resolvingCard = false;
        this._playerService.actionPerformTrigger = null;
        this._socketService.romeDemands();
    }

    // FOUNDATION

    private _fountainYesAction() {
        this._playerService.activeActionTrigger = eCardEffect.fountain;
        let card = this._playerService.drawCardsFromDeck(1);
        if (card !== null)
            this._playerService.fountainCard = card[0];
    }

    onMouseOver(event: MouseEvent) {
        this._playerService.cardIsHoveredNewBuilding(this._playerService.fountainCard);
    }

    onMouseLeave(event: MouseEvent) {
        this._playerService.cardIsNotHovered(this._playerService.fountainCard);
    }

    private fountainInteraction() {
        return this._playerService.canAddNewBuilding(this._playerService.fountainCard.role);
    }

    private fountainClicked() {
        this._playerService.activeActionTrigger = null;
        this._playerService.addToUnderConstruction(this._playerService.fountainCard);
    }

    private fountainYes() {
        this._playerService.activeActionTrigger = null;
        this._playerService.addCards([this._playerService.fountainCard]);
        this._playerService.fountainCard = null;
        this._playerService.decrementActions();
    }
    
    // SCHOOL
    private _schoolYesAction() {
        this._playerService.drawCards(this._playerInfoService.getPlayerState().influence);
        this._playerService.actionStack.pop();
        this._playerService.actionFinished();
    }

    // LATRINE
    private _latrineYesAction() {
        this._playerService.resolvingCard = false;
        this._playerService.activeActionTrigger = eCardEffect.latrine;
        this._playerService.actionPerformTrigger = null;
        this._playerService.latrineTriggered();
    }

    // PALACE
    private _palaceYesAction() {
        this._playerService.resolvingCard = false;
        this._playerService.palaceResolved();
    }

    private _palaceNoAction() {
        this._playerService.resolvingCard = false;
    }

    private _palaceFinishAction() {
        this._playerService.actionFinished();
    }

    // PRISON
    private _prisonYesAction() {
        this._playerService.actionFinishTrigger = eCardEffect.prison;
    }

    private _prisonNoAction() {
        this._playerService.actionStack.pop();
        this._playerService.actionFinished();
    }

    // SENATE
    private _senateYesAction() {
        this._playerService.takeOpponentsJacks();
        this._playerService.turnFinished();
    }

    // SEWER
    private _sewerYesAction() {
        let pState = this._playerInfoService.getPlayerState();
        let actionCard = pState.actionCard;
        if (actionCard.role != eWorkerType.jack) {
            pState.stockpile.push(actionCard);
        }
        pState.actionCard = null;
        this._playerService.turnFinished();
    }

    // STAIRWAY
    private _stairwayYesAction() {
        this._playerService.activeActionTrigger = eCardEffect.stairway;
        this._playerService.actionPerformTrigger = null;
    }

    // VILLA
    private _villaAction() {
        let villa = this._playerService.getVillaFromUnderConstruction();
        this._playerService.removeFromUnderConstruction(villa)
        this._playerService.addToCompleted(villa);
    }

    // Vomitorium
    private _vomitoriumAction() {
        this._playerService.discardHand();
        this._playerService.think();
        this._playerService.turnFinished();
    }
}