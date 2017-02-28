import * as _ from 'lodash';

export enum eCardSize {
    small,
    medium,
    large
}

export interface ICardPlayed {
    type: eWorkerType;
    card: ICard;
    jack: eWorkerType;
}

export interface IFoundation {
    building: ICard;
    site: ICard;
    materials: ICard[];
}

export interface ICompletedFoundation extends IFoundation {
    stairway: boolean;
}

export interface IFoundationPile {
    foundation: ICard;
    inTown: number;
    outOfTown: number;
}

export interface ICard {
    uid: string;
    id: eCardEffect;
    title: string;
    role: eWorkerType;
    desc: string;
    value: number;
    count: number;
    x: number;
    y: number;
    mode: eWorkerType;
    asset: string;
    phantom: boolean;
    selected: boolean;
    changeValues(data: ICard): void; 
    setPhantom(val: boolean): void;
    setMode(wType: eWorkerType): void;
}

export interface ICardData {
    id: number;
    title: string;
    role: number;
    desc: string;
    value: number;
    count: number;
    x: number;
    y: number;
    asset: string;
}

export enum eWorkerType {
    architect,
    craftsman,
    laborer,
    legionary,
    merchant,
    patron,
    jack
}

export enum eCardEffect {
    academy,
    amphitheatre,
    aqueduct,
    archway,
    atrium,
    bar,
    basilica,
    bath,
    bridge,
    catacomb,
    circus,
    circusMaximus,
    coliseum,
    dock,
    forum,
    foundry,
    fountain,
    garden,
    gate,
    insula,
    latrine,
    ludusMagna,
    market,
    palace,
    palisade,
    prison,
    road,
    school,
    scriptorium,
    senate,
    sewer,
    shrine,
    stairway,
    statue,
    storeroom,
    temple,
    tower,
    villa,
    vomitorium,
    wall,
    
    brick,
    concrete,
    marble,
    rubble,
    stone,
    wood
}

export class Card implements ICard {

    uid: string;
    id: eCardEffect;
    title: string = "";
    role: eWorkerType = 0;
    desc: string = "";
    value: number = 0;
    x: number = 0;
    y: number = 0;
    count: number = 0;
    asset: string = "";
    phantom = false;
    mode: eWorkerType = null;
    selected = false;

    constructor(data?: ICardData) {
        this.assignData(data);
        this.uid =  Math.random().toString(36).substring(7);
    }

    changeValues(data: ICard) {
        if (data == null) return;
        this.assignData(data);

    }

    setPhantom(val: boolean) {
        this.phantom = val;
    }

    setMode(wType: eWorkerType) {
        this.mode = wType;
    }

    private assignData(data?: ICardData) {
        if (data) {
            this.id = data.id;
            this.title = data.title;
            this.role = data.role;
            this.desc = data.desc;
            this.value = data.value;
            this.x = data.x;
            this.y = data.y;
            this.count = data.count;
            this.asset = data.asset;

            if (data.role != eWorkerType.jack)
                this.mode = data.role;
        }
    }
}