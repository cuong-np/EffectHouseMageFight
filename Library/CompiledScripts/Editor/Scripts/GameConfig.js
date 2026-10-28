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
exports.GameConfig = void 0;
let GameConfig = class GameConfig extends APJS.BasicScriptComponent {
    constructor() {
        super(...arguments);
        this.maxHp = 100;
        this.minDamage = 10;
        this.maxDamage = 15;
        this.critRate = 0.15;
        this.critMultiplier = 2;
        this.flightSec = 0.5;
    }
    onStart() {
        this.maxHp = this.clampInt(this.maxHp, 1, 500);
        this.minDamage = this.clampInt(this.minDamage, 1, 50);
        this.maxDamage = Math.max(this.minDamage, this.clampInt(this.maxDamage, 1, 50));
        this.critRate = this.clamp(this.critRate, 0, 0.5);
        this.critMultiplier = this.clamp(this.critMultiplier, 1, 3);
        this.flightSec = this.clamp(this.flightSec, 0.1, 2);
    }
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
    clampInt(value, min, max) {
        return Math.round(this.clamp(value, min, max));
    }
};
__decorate([
    header("Gameplay Tuning"),
    serializeProperty,
    tooltip("Starting health for both fighters."),
    spinBox(1, 500, 1)
], GameConfig.prototype, "maxHp", void 0);
__decorate([
    serializeProperty,
    tooltip("Minimum normal damage dealt by one hit."),
    spinBox(1, 50, 1)
], GameConfig.prototype, "minDamage", void 0);
__decorate([
    serializeProperty,
    tooltip("Maximum normal damage dealt by one hit."),
    spinBox(1, 50, 1)
], GameConfig.prototype, "maxDamage", void 0);
__decorate([
    serializeProperty,
    tooltip("Chance for an attack to deal critical damage."),
    slider(0, 0.5, 0.01)
], GameConfig.prototype, "critRate", void 0);
__decorate([
    serializeProperty,
    tooltip("Critical damage multiplier."),
    slider(1, 3, 0.1)
], GameConfig.prototype, "critMultiplier", void 0);
__decorate([
    header("Turn Timing"),
    serializeProperty,
    tooltip("How long the WaterBall takes to fly to the other fighter at normal physics speed."),
    slider(0.1, 2, 0.1)
], GameConfig.prototype, "flightSec", void 0);
GameConfig = __decorate([
    component()
], GameConfig);
exports.GameConfig = GameConfig;
