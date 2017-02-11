import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'jack-menu-component',
    template: `
        <div class="jack-menu">
            <div class="left-jack-menu">
                <div class="architect-option" (click)="optionClicked(0)">
                    <div class="option-text-container">
                        <span class="option-text">Architect</span>
                    </div>
                </div>
                <div class="laborer-option" (click)="optionClicked(2)">
                    <div class="option-text-container">
                        <span class="option-text">Laborer</span>
                    </div>
                </div>
                <div class="merchant-option" (click)="optionClicked(4)">
                    <div class="option-text-container">
                        <span class="option-text">Merchant</span>
                    </div>
                </div>
            </div>
            <div class="right-jack-menu">
                <div class="craftsman-option" (click)="optionClicked(1)">
                    <div class="option-text-container">
                        <span class="option-text">Craftsman</span>
                    </div>
                </div>
                <div class="legionary-option" (click)="optionClicked(3)">
                    <div class="option-text-container">
                        <span class="option-text">Legionary</span>
                    </div>
                </div>
                <div class="patron-option" (click)="optionClicked(5)">
                    <div class="option-text-container">
                        <span class="option-text">Patron</span>
                    </div>
                </div>
            </div>
        </div>
    `,
    styleUrls: ['./card.styles.css']
})
export class JackMenuComponent {
    
    @Output('optionClicked')
    private _optionClicked: EventEmitter<number> = new EventEmitter<number>();

    optionClicked = (index: number) => {
        this._optionClicked.emit(index);
    }
}