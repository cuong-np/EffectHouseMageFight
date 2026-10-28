const APJS = globalThis.orion['@orion/orion-sdk/EditorFramework'].APJS;

const {BasicScriptNode} = require('../BasicScriptNode');
const {
  customNode,
  component,
  input,
  output,
  serializeSceneObjectFlag,
  serializeProperty,
  label, readOnly, slider, spinBox, dropDown,
  textArea, header, showIf, tooltip, separator,
  space, groupBegin, groupEnd, disablePin,
} = require('../OrionDecorators');

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PlayerStamina_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerStamina = void 0;
let PlayerStamina = PlayerStamina_1 = class PlayerStamina extends APJS.BasicScriptComponent {
    constructor() {
        super(...arguments);
        this.currentStamina = PlayerStamina_1.STARTING_STAMINA;
    }
    resetForBattle() {
        this.currentStamina = PlayerStamina_1.STARTING_STAMINA;
        return this.currentStamina;
    }
    recoverForTurn(amount) {
        const recoveryAmount = Number.isFinite(amount) ? Math.max(0, Math.floor(amount)) : 0;
        this.currentStamina = Math.min(PlayerStamina_1.MAX_STAMINA, this.currentStamina + recoveryAmount);
        return this.currentStamina;
    }
    trySpend(cost) {
        const amount = Math.floor(cost);
        if (!Number.isFinite(amount) || amount <= 0 || this.currentStamina < amount) {
            return false;
        }
        this.currentStamina -= amount;
        return true;
    }
    getCurrentStamina() {
        return this.currentStamina;
    }
};
PlayerStamina.STARTING_STAMINA = 5;
PlayerStamina.MAX_STAMINA = 10;
PlayerStamina = PlayerStamina_1 = __decorate([
    component()
], PlayerStamina);
exports.PlayerStamina = PlayerStamina;
