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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Character = void 0;
let Character = class Character extends APJS.BasicScriptComponent {
    constructor() {
        super(...arguments);
        this.damageMultiplier = 1;
        this.maxHp = 100;
        this.hp = 100;
    }
    onStart() {
        this.damageMultiplier = Math.max(1, Math.min(10, this.damageMultiplier));
        if (this.healthFillObj)
            this.healthFill = this.healthFillObj.getComponent("Image");
        this.updateBars();
    }
    resetState(maxHp) {
        this.maxHp = Math.max(1, maxHp);
        this.hp = this.maxHp;
        this.updateBars();
    }
    getHp() { return this.hp; }
    getDamageMultiplier() { return this.damageMultiplier; }
    applyDamage(amount) {
        this.hp = Math.max(0, Math.min(this.maxHp, this.hp - Math.max(0, amount)));
        this.updateBars();
    }
    refreshBars() {
        this.updateBars();
    }
    updateBars() {
        if (this.healthFill)
            this.healthFill.setMaterialProperty("_filledRange", this.hp / this.maxHp);
    }
};
__decorate([
    header("Character Tuning"),
    serializeProperty,
    tooltip("Damage dealt by this character. 1x is normal; raise it for quick tests."),
    slider(1, 10, 0.5)
], Character.prototype, "damageMultiplier", void 0);
__decorate([
    serializeSceneObjectFlag,
    header("Character Wiring"),
    serializeProperty,
    tooltip("Health bar fill image for this character.")
], Character.prototype, "healthFillObj", void 0);
Character = __decorate([
    component()
], Character);
exports.Character = Character;
