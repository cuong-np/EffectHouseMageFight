const APJS = globalThis.orion['@orion/orion-sdk/EditorFramework'].APJS;

const {BasicScriptNode} = require('../../../BasicScriptNode');
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
} = require('../../../OrionDecorators');

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MageHitReaction = void 0;
let MageHitReaction = class MageHitReaction extends APJS.BasicScriptComponent {
    constructor() {
        super(...arguments);
        this.hitDurationSec = 0.9;
        this.ready = false;
        this.previousPlayerFill = 1;
        this.previousBotFill = 1;
        this.playerHitRemaining = 0;
        this.botHitRemaining = 0;
    }
    onLateUpdate(deltaTime) {
        if (!this.ready) {
            if (!this.hitTex || !this.idleTex || !this.playerImage || !this.botImage ||
                !this.playerHealthFill || !this.botHealthFill) {
                return;
            }
            this.hitProvider = this.hitTex.getControl();
            this.previousPlayerFill = this.readHealth(this.playerHealthFill, 1);
            this.previousBotFill = this.readHealth(this.botHealthFill, 1);
            this.ready = true;
        }
        this.updateMage(this.playerImage, this.playerHealthFill, true, deltaTime);
        this.updateMage(this.botImage, this.botHealthFill, false, deltaTime);
    }
    readHealth(fill, fallback) {
        const value = fill.getMaterialProperty("_filledRange");
        if (typeof value !== "number")
            return fallback;
        return Math.max(0, Math.min(1, value));
    }
    updateMage(sprite, fill, isPlayer, deltaTime) {
        const previous = isPlayer ? this.previousPlayerFill : this.previousBotFill;
        const current = this.readHealth(fill, previous);
        let remaining = isPlayer ? this.playerHitRemaining : this.botHitRemaining;
        if (current < previous - 0.001) {
            if (current > 0) {
                sprite.texture = this.hitTex;
                this.hitProvider.playFromStart();
                remaining = Math.max(0.25, Math.min(1.5, this.hitDurationSec));
            }
            else if (current <= 0) {
                // The existing BattleManager owns the fatal-hit death animation.
                remaining = 0;
            }
            else {
                remaining = 0;
            }
        }
        if (remaining > 0) {
            remaining = Math.max(0, remaining - deltaTime);
            if (remaining === 0 && current > 0) {
                const displayed = sprite.texture;
                if (displayed && displayed.name === this.hitTex.name) {
                    sprite.texture = this.idleTex;
                }
            }
        }
        if (isPlayer) {
            this.previousPlayerFill = current;
            this.playerHitRemaining = remaining;
        }
        else {
            this.previousBotFill = current;
            this.botHitRemaining = remaining;
        }
    }
};
__decorate([
    header("Theme & Assets"),
    serializeProperty,
    tooltip("One-shot animation shown when a Mage takes nonlethal damage.")
], MageHitReaction.prototype, "hitTex", void 0);
__decorate([
    serializeProperty,
    tooltip("Idle animation restored after the hit reaction.")
], MageHitReaction.prototype, "idleTex", void 0);
__decorate([
    header("Gameplay Tuning"),
    serializeProperty,
    tooltip("Seconds to show the hit reaction before returning to idle."),
    slider(0.25, 1.5, 0.05)
], MageHitReaction.prototype, "hitDurationSec", void 0);
__decorate([
    header("Advanced — Scene Wiring"),
    serializeProperty,
    tooltip("Player Mage Image component.")
], MageHitReaction.prototype, "playerImage", void 0);
__decorate([
    serializeProperty,
    tooltip("Bot Mage Image component.")
], MageHitReaction.prototype, "botImage", void 0);
__decorate([
    serializeProperty,
    tooltip("Player health-fill Image, configured as Filled.")
], MageHitReaction.prototype, "playerHealthFill", void 0);
__decorate([
    serializeProperty,
    tooltip("Bot health-fill Image, configured as Filled.")
], MageHitReaction.prototype, "botHealthFill", void 0);
MageHitReaction = __decorate([
    component()
], MageHitReaction);
exports.MageHitReaction = MageHitReaction;
