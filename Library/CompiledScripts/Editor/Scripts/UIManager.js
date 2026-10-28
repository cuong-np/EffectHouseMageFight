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
var UIManager_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UIManager = void 0;
let UIManager = UIManager_1 = class UIManager extends APJS.BasicScriptComponent {
    constructor() {
        super(...arguments);
        this.ready = false;
        this.retryVisible = false;
        this.fightNowVisible = false;
        this.resultTweenActive = false;
        this.resultTweenTimer = 0;
        this.resultTargetPercent = 0;
        this.lastChimePercent = 100;
        this.actionButtonsActive = false;
        this.actionStamina = 0;
    }
    onStart() {
        if (!this.turnObj || !this.retryObj || !this.fightNowObj ||
            !this.dodgeObj || !this.blockObj || !this.parryObj ||
            !this.dodgeDisabledOverlayObj || !this.blockDisabledOverlayObj || !this.parryDisabledOverlayObj ||
            !this.resultHpPercentObj || !this.staminaTextObj || !this.soundManagerObj) {
            console.error("[UIManager] One or more UI references are missing.");
            return;
        }
        this.turnLabel = this.turnObj.getComponent("Text");
        this.retryImage = this.retryObj.getComponent("Image");
        this.fightNowImage = this.fightNowObj.getComponent("Image");
        this.dodgeImage = this.dodgeObj.getComponent("Image");
        this.blockImage = this.blockObj.getComponent("Image");
        this.parryImage = this.parryObj.getComponent("Image");
        this.resultHpPercentText = this.resultHpPercentObj.getComponent("Text");
        this.staminaText = this.staminaTextObj.getComponent("Text");
        this.sound = this.soundManagerObj.getComponent("SoundManager");
        if (!this.turnLabel || !this.retryImage || !this.fightNowImage ||
            !this.dodgeImage || !this.blockImage || !this.parryImage ||
            !this.resultHpPercentText || !this.staminaText || !this.sound) {
            console.error("[UIManager] A wired UI object is missing its required component.");
            return;
        }
        this.resultCompleteType = APJS.EventManager.defineUserEventType("battle.ui.result_complete");
        this.ready = true;
        this.setActionButtonsState(false, 0);
    }
    isRetryButtonAt(position) {
        return this.ready && this.retryVisible && APJS.TouchUtils.isScreenPointOnImage(position, this.retryImage);
    }
    isFightNowButtonAt(position) {
        return this.ready && this.fightNowVisible && APJS.TouchUtils.isScreenPointOnImage(position, this.fightNowImage);
    }
    isDodgeButtonAt(position) {
        return this.ready && this.actionButtonsActive && this.actionStamina >= 1 &&
            APJS.TouchUtils.isScreenPointOnImage(position, this.dodgeImage);
    }
    isBlockButtonAt(position) {
        return this.ready && this.actionButtonsActive && this.actionStamina >= 3 &&
            APJS.TouchUtils.isScreenPointOnImage(position, this.blockImage);
    }
    isParryButtonAt(position) {
        return this.ready && this.actionButtonsActive && this.actionStamina >= 2 &&
            APJS.TouchUtils.isScreenPointOnImage(position, this.parryImage);
    }
    setActionButtonsState(active, stamina) {
        if (!this.ready)
            return;
        this.actionButtonsActive = active;
        this.actionStamina = Math.max(0, stamina);
        const dodgeAvailable = active && this.actionStamina >= 1;
        const blockAvailable = active && this.actionStamina >= 3;
        const parryAvailable = active && this.actionStamina >= 2;
        this.dodgeImage.opacity = 1;
        this.blockImage.opacity = 1;
        this.parryImage.opacity = 1;
        this.dodgeDisabledOverlayObj.setEnabledInHierarchy(!dodgeAvailable);
        this.blockDisabledOverlayObj.setEnabledInHierarchy(!blockAvailable);
        this.parryDisabledOverlayObj.setEnabledInHierarchy(!parryAvailable);
    }
    setStamina(value) {
        if (this.ready)
            this.staminaText.text = String(value);
    }
    setTurn(turn) {
        if (!this.ready)
            return;
        this.turnLabel.text = "Turn " + String(turn);
        this.turnLabel.fontSize = 45.139;
    }
    setFightNowVisible(visible) {
        if (!this.ready)
            return;
        this.fightNowVisible = visible;
        this.fightNowObj.setEnabledInHierarchy(visible);
    }
    setRetryVisible(visible) {
        if (!this.ready)
            return;
        this.retryVisible = visible;
        this.retryObj.setEnabledInHierarchy(visible);
    }
    resetResult() {
        if (!this.ready)
            return;
        this.resultTweenActive = false;
        this.resultTweenTimer = 0;
        this.resultTargetPercent = 0;
        this.lastChimePercent = 100;
        this.resultHpPercentText.text = "100%";
        if (this.resultHpLabelObj)
            this.resultHpLabelObj.setEnabledInHierarchy(false);
        this.resultHpPercentObj.setEnabledInHierarchy(false);
        this.setRetryVisible(false);
    }
    showResult(winnerText, hpPercent) {
        if (!this.ready)
            return;
        this.turnLabel.text = winnerText;
        this.turnLabel.fontSize = 30;
        if (this.resultHpLabelObj)
            this.resultHpLabelObj.setEnabledInHierarchy(true);
        this.resultHpPercentText.text = "100%";
        this.resultHpPercentObj.setEnabledInHierarchy(true);
        this.resultTargetPercent = Math.max(0, Math.min(100, hpPercent));
        this.resultTweenTimer = 0;
        this.lastChimePercent = 100;
        this.resultTweenActive = true;
        this.setRetryVisible(false);
    }
    onUpdate(dt) {
        if (!this.ready || !this.resultTweenActive)
            return;
        this.resultTweenTimer = Math.min(3, this.resultTweenTimer + Math.max(0, dt));
        const progress = this.resultTweenTimer / 3;
        const eased = progress * progress * (3 - 2 * progress);
        const shownPercent = Math.round(100 + (this.resultTargetPercent - 100) * eased);
        const value = String(shownPercent) + "%";
        if (this.resultHpPercentText.text !== value) {
            this.resultHpPercentText.text = value;
            if (this.lastChimePercent - shownPercent >= UIManager_1.RESULT_CHIME_STEP) {
                this.sound.playResultChime();
                this.lastChimePercent = shownPercent;
            }
        }
        if (progress >= 1) {
            this.resultHpPercentText.text = String(this.resultTargetPercent) + "%";
            if (this.lastChimePercent !== this.resultTargetPercent) {
                this.sound.playResultChime();
                this.lastChimePercent = this.resultTargetPercent;
            }
            this.resultTweenActive = false;
            this.setRetryVisible(true);
            const event = APJS.EventManager.createEvent(this.resultCompleteType);
            APJS.EventManager.getGlobalEmitter().emit(event);
        }
    }
};
UIManager.RESULT_CHIME_STEP = 1;
__decorate([
    serializeSceneObjectFlag,
    header("UI Scene Wiring"),
    serializeProperty,
    tooltip("Sound manager used for result percentage chimes.")
], UIManager.prototype, "soundManagerObj", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty,
    tooltip("Current turn label.")
], UIManager.prototype, "turnObj", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty,
    tooltip("Retry button shown after the result animation.")
], UIManager.prototype, "retryObj", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty,
    tooltip("Button used to start the next turn.")
], UIManager.prototype, "fightNowObj", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty,
    tooltip("Dodge action button.")
], UIManager.prototype, "dodgeObj", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty,
    tooltip("Block action button.")
], UIManager.prototype, "blockObj", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty,
    tooltip("Parry action button.")
], UIManager.prototype, "parryObj", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty,
    tooltip("Overlay that dims the Dodge button and all of its child UI when unavailable.")
], UIManager.prototype, "dodgeDisabledOverlayObj", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty,
    tooltip("Overlay that dims the Block button and all of its child UI when unavailable.")
], UIManager.prototype, "blockDisabledOverlayObj", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty,
    tooltip("Overlay that dims the Parry button and all of its child UI when unavailable.")
], UIManager.prototype, "parryDisabledOverlayObj", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty,
    tooltip("Winner HP label shown in the result state.")
], UIManager.prototype, "resultHpLabelObj", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty,
    tooltip("Animated winner HP percentage label.")
], UIManager.prototype, "resultHpPercentObj", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty,
    tooltip("Text object that displays the player's current stamina.")
], UIManager.prototype, "staminaTextObj", void 0);
UIManager = UIManager_1 = __decorate([
    component()
], UIManager);
exports.UIManager = UIManager;
