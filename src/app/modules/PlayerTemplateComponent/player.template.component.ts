import { Component } from '@angular/core';

import { eCardSize, eCardEffect, eWorkerType } from '../../common/card/card';
import { PlayerService } from '../../common/player.service';
import { PlayerInfoService } from '../../common/player.info.service';
import { CardFactoryService } from '../../common/card/card.factory.service';
import { GameService, eLegionaryStage, eActionMode } from '../../common/game.service';
import { SocketService } from '../../common/socket.service';
import { MessageService } from '../../common/message.service';

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
        private _cardFactoryService: CardFactoryService,
        private _socketService: SocketService,
        private _messageService: MessageService

    ) {
        this._gameService.onActionEnd().subscribe(() => {
            this.selected = false;
        });
    }

    romeIsDemanding() {
        return this._gameService.gameState.legionaryStage === eLegionaryStage.romeDemanding;
    }

    gtrEnable() {
        return this._playerInfoService.getPlayerState().gloryToRome;
    }

    gloryToRome() {
        this._messageService.gloryToRomeMessage();
        this._playerService.extortMaterial();
    }

    isPlayersLead() {
        return  this._gameService.gameState.actionMode === eActionMode.actionCardMode &&
                this._playerInfoService.isPlayersLead &&
                this._playerInfoService.isPlayersTurn;
    }

    isPlayersTurn() {
        return  this._gameService.gameState.actionMode === eActionMode.actionCardMode &&
                !this._playerInfoService.isPlayersLead &&
                this._playerInfoService.isPlayersTurn;
    }

    yesAction = null;
    noAction = null;
    selected: boolean = false;

    actionMessageEnabled() {
        return  this._gameService.gameState.actionMode === eActionMode.resolveCardMode &&
                this._playerInfoService.isPlayersTurn && 
                this._gameService.gameState.mode !== eWorkerType.legionary ||
                this._gameService.gameState.actionMode === eActionMode.resolveCardMode &&
                this._playerInfoService.isPlayersTurn &&
                this._gameService.gameState.mode === eWorkerType.legionary &&
                this._gameService.gameState.legionaryStage === eLegionaryStage.declare
    }

    actionMessageClicked() {
        this._playerService.resolveNextActionState();
    }

    message() {
        if (!this._playerInfoService.isPlayersTurn) return;

        if (!this._playerService.resolvingCard) {
            if (this._playerService.activeActionTrigger === eCardEffect.palace) {
                this.yesAction = this._palaceFinishAction;
                this.noAction = null;
                return `[Palace] Finish playing cards?`;
            }
        }

        if (
            this._playerInfoService.isPlayersTurn &&
            this._gameService.gameState.mode == eWorkerType.legionary &&
            this._gameService.gameState.legionaryStage === eLegionaryStage.declare &&
            (this._playerService.actionPerformTrigger !== eCardEffect.bridge &&
                this._playerService.actionPerformTrigger !== eCardEffect.coliseum)
        ) {
            return `Rome Demands...`;
        }

        // Academy trigger
        else if (this._playerService.actionFinishTrigger === eCardEffect.academy) {
            this.yesAction = this._academyYesAction;
            this.noAction = this.noTurnFinish;
            return `[Academy] Think on turn end?`;
        }
        // Amphitheatre trigger
        else if (this._playerService.actionPerformTrigger === eCardEffect.amphitheatre) {
            this.yesAction = this.yesResolveAction;
            this.noAction = this.noCompletionAction;
            return `Perform CRAFTSMAN for each influence?`;
        }
        // Atrium trigger
        else if (this._playerService.actionPerformTrigger === eCardEffect.atrium) {
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
            this.yesAction = this._bathYesAction;
            this.noAction = this.noActionFinish;

            let clientelles = this._playerInfoService.getPlayerState().clientelles;
            let client = clientelles[clientelles.length - 1];

            return `[Bath] Perform ${this._cardFactoryService.getRole(client).toUpperCase()} action?`;
        }
        // Bridge trigger
        else if (this._playerService.actionPerformTrigger === eCardEffect.bridge) {
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
            return `Perform PATRON for each influence?`;
        }
        // Latrine trigger
        else if (this._playerService.actionPerformTrigger === eCardEffect.latrine) {
            this.yesAction = this._latrineYesAction;
            this.noAction = this.noThink;
            return `[Latrine] Discard one card to POOL before THINKER action?`;
        }
        // Palace trigger
        else if (this._playerService.actionPerformTrigger === eCardEffect.palace) {
            this.yesAction = this._palaceYesAction;
            this.noAction = this._palaceNoAction;
            return `[Palace] Play multiple cards of the same role for additional actions?`;
        }
        // Prison trigger
        else if (this._playerService.actionPerformTrigger === eCardEffect.prison) {
            this.yesAction = this._prisonYesAction;
            this.noAction = this._prisonNoAction;
            return `Exchange 3 INFLUENCE for opponent's structure?`;
        }
        // School trigger
        else if (this._playerService.actionPerformTrigger === eCardEffect.school) {
            this.yesAction = this._schoolYesAction;
            this.noAction = this.noCompletionAction;
            return `Perform THINKER action for each influence?`;
        }
        // Senate trigger
        else if (this._playerService.actionFinishTrigger === eCardEffect.senate) {
            this.yesAction = this._senateYesAction;
            this.noAction = this.noTurnFinish;
            return `[Senate] Take opponent's JACK's`;
        }
        // Sewer trigger
        else if (this._playerService.actionFinishTrigger === eCardEffect.sewer) {
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
            this.yesAction = null;
            this.noAction = null;
            return `Select a foundation to build your STATUE`;
        }
        // Villa trigger
        else if (this._playerService.actionPerformTrigger === eCardEffect.villa) {
            this.noAction = this.noActionFinish;
            this.yesAction = this._villaAction;
            return `Complete VILLA?`
        }
        // Vomitorium trigger
        else if (this._playerService.actionPerformTrigger == eCardEffect.vomitorium) {
            this.noAction = this.noThink;
            this.yesAction = this._vomitoriumAction;
            return `[Vomitorium] Discard all cards to POOL before THINKER action?`
        }
    }

    yesVisible = () => {
        let perfTrig = this._playerService.actionPerformTrigger;
        let finTrig = this._playerService.actionFinishTrigger;

        return  finTrig == eCardEffect.academy || 
                perfTrig == eCardEffect.amphitheatre || 
                perfTrig == eCardEffect.atrium || 
                perfTrig == eCardEffect.bar ||
                perfTrig == eCardEffect.bath ||
                perfTrig == eCardEffect.bridge ||
                perfTrig == eCardEffect.coliseum ||
                perfTrig == eCardEffect.foundry ||
                this._playerService.fountainCondition() ||
                perfTrig == eCardEffect.garden ||
                perfTrig == eCardEffect.latrine ||
                perfTrig == eCardEffect.palace ||
                this._playerService.activeActionTrigger == eCardEffect.palace ||
                perfTrig == eCardEffect.prison ||
                perfTrig == eCardEffect.school ||
                finTrig == eCardEffect.senate ||
                finTrig == eCardEffect.sewer ||
                perfTrig == eCardEffect.stairway ||
                perfTrig == eCardEffect.villa ||
                perfTrig == eCardEffect.vomitorium;
    }

    yesResolveAction() {
        this._playerService.resolveNextActionState();
    }

    yesClicked() {
        this._playerService.resolvingCard = false;
        this._playerService.actionPerformTrigger = null;
        this.yesAction && this.yesAction();
    }

    noVisible = () => {
        let perfTrig = this._playerService.actionPerformTrigger;
        let finTrig = this._playerService.actionFinishTrigger;

        return  finTrig == eCardEffect.academy ||
                perfTrig == eCardEffect.amphitheatre ||
                perfTrig == eCardEffect.bath ||
                perfTrig == eCardEffect.bridge ||
                perfTrig == eCardEffect.coliseum ||
                perfTrig == eCardEffect.foundry ||
                perfTrig == eCardEffect.garden ||
                perfTrig == eCardEffect.latrine ||
                perfTrig == eCardEffect.palace ||
                perfTrig == eCardEffect.prison ||
                perfTrig == eCardEffect.school ||
                finTrig == eCardEffect.senate ||
                finTrig == eCardEffect.sewer ||
                perfTrig == eCardEffect.villa ||
                perfTrig == eCardEffect.vomitorium;
    }

    noActionFinish() {
        this._playerService.resolvingCard = false;
        this._playerService.resolveNextActionState();
    }

    noCompletionAction() {
        this._playerService.resolvingCard = false;
        this._playerService.resolveActionStack();
    }

    noTurnFinish() {
        this._playerService.resolvingCard = false;
        this._playerService.turnFinished();
    }

    noThink() {
        this._playerService.resolvingCard = false;
        this._playerService.thinkAction();
    }

    noClicked() {
        this.noAction && this.noAction();
    }

    additionalActionMessage() {
        let additionTrig = this._playerService.additionalActionTrigger;
        // Aqueduct trigger
        if (additionTrig === eCardEffect.aqueduct) {
            this.yesAction = () => this._yesAdditional(eCardEffect.aqueduct);
            return `[Aqueduct] Additionally perform PATRON from hand?`;
        }
        // Basilica trigger
        else if (additionTrig === eCardEffect.basilica) {
            this.yesAction = () => this._yesAdditional(eCardEffect.basilica);
            return `[Basilica] Additionally perform MERCHANT from hand?`;
        }
        // Dock trigger
        else if (additionTrig === eCardEffect.dock) {
            this.yesAction = () => this._yesAdditional(eCardEffect.dock);
            return `[Dock] Additionally perform LABORER from hand?`;
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
        if (ps.hasBuildingFunction(eCardEffect.coliseum)) {
            ps.resolvingCard = true;
            ps.actionPerformTrigger = eCardEffect.coliseum;
        }
        else {
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
    }

    // COLISEUM

    private _coliseumYesAction() {
        this._gameService.gameState.actionTriggers.push(eCardEffect.coliseum);
        this._socketService.romeDemands();
    }

    private _coliseumNoAction() {
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
        if (!this.fountainInteraction()) return;
        this._playerService.cardIsHoveredNewBuilding(this._playerService.fountainCard);
    }

    onMouseLeave(event: MouseEvent) {
        if (!this.fountainInteraction()) return;
        this._playerService.cardIsNotHovered(this._playerService.fountainCard);
    }

    private fountainInteraction() {
        return this._playerService.canAddNewBuilding(this._playerService.fountainCard.id);
    }

    private fountainClicked() {
        if (!this.fountainInteraction()) return;
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
        let inf = this._playerInfoService.getPlayerState().influence;
        for (let i = 0; i < inf; i++) {
            this._playerService.think();
        }
        this._playerService.actionStack.pop();
        this._playerService.resolveNextActionState();
    }

    // LATRINE
    private _latrineYesAction() {
        this._playerService.activeActionTrigger = eCardEffect.latrine;
        this._playerService.latrineTriggered();
    }

    // PALACE
    private _palaceYesAction() {
        this._playerService.activeActionTrigger = eCardEffect.palace;
    }

    private _palaceNoAction() {
    }

    private _palaceFinishAction() {
        this._playerService.resolveNextActionState();
    }

    // PRISON
    private _prisonYesAction() {
        this._playerService.actionPerformTrigger = null;
    }

    private _prisonNoAction() {
        this._playerService.actionStack.pop();
        this._playerService.resolveNextActionState();
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