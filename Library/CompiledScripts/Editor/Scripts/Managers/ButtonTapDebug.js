const APJS = globalThis.orion['@orion/orion-sdk/EditorFramework'].APJS;

const {BasicScriptNode} = require('../../BasicScriptNode');
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
} = require('../../OrionDecorators');

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ButtonTapDebug = void 0;
let ButtonTapDebug = class ButtonTapDebug extends APJS.BasicScriptComponent {
    constructor() {
        super(...arguments);
        this.attackEnabled = true;
        this.defenseEnabled = true;
        this.turnCount = 1;
        this.countdownValue = 10;
        this.countdownElapsed = 0;
        this.fightVisibleTime = 0;
        this.countdownActive = false;
        this.fightVisible = false;
        this.activeButton = 0;
        this.attackPressed = false;
        this.defensePressed = false;
        this.attackPulse = -1;
        this.defensePulse = -1;
        this.attackCurrentScale = 1;
        this.defenseCurrentScale = 1;
        this.lastAttackEnabled = true;
        this.lastDefenseEnabled = true;
        this.initialized = false;
        this.touchCallback = (event) => {
            if (!this.initialized)
                return;
            const touchInfo = event.args[0];
            if (touchInfo.phase === APJS.TouchPhase.Began) {
                if (this.countdownActive || this.fightVisible)
                    return;
                if (this.attackEnabled && APJS.TouchUtils.isScreenPointOnImage(touchInfo.position, this.attackImage)) {
                    this.activeButton = 1;
                    this.attackPressed = true;
                    this.attackPulse = -1;
                    this.applyButtonColors();
                    console.log("[Button Debug] ATTACK tapped");
                    this.advanceTurn();
                    this.startPreparationCountdown();
                }
                else if (this.defenseEnabled && APJS.TouchUtils.isScreenPointOnImage(touchInfo.position, this.defenseImage)) {
                    this.activeButton = 2;
                    this.defensePressed = true;
                    this.defensePulse = -1;
                    this.applyButtonColors();
                    console.log("[Button Debug] DEFENSE tapped");
                    this.advanceTurn();
                    this.startPreparationCountdown();
                }
                return;
            }
            if (touchInfo.phase === APJS.TouchPhase.Ended || touchInfo.phase === APJS.TouchPhase.Canceled) {
                if (this.activeButton === 1) {
                    this.attackPressed = false;
                    this.attackPulse = 0;
                }
                else if (this.activeButton === 2) {
                    this.defensePressed = false;
                    this.defensePulse = 0;
                }
                this.applyButtonColors();
                this.activeButton = 0;
            }
        };
    }
    onUpdate(dt) {
        if (!this.initialized) {
            if (!this.attackButton || !this.defenseButton || !this.turnText || !this.countdownText)
                return;
            const attack = this.attackButton.getComponent("Image");
            const defense = this.defenseButton.getComponent("Image");
            const attackTransform = this.attackButton.getComponent("ScreenTransform");
            const defenseTransform = this.defenseButton.getComponent("ScreenTransform");
            const turnText = this.turnText.getComponent("Text");
            const countdownText = this.countdownText.getComponent("Text");
            if (!attack || !defense || !attackTransform || !defenseTransform || !turnText || !countdownText)
                return;
            this.attackImage = attack;
            this.defenseImage = defense;
            this.attackTransform = attackTransform;
            this.defenseTransform = defenseTransform;
            this.turnLabel = turnText;
            this.countdownLabel = countdownText;
            this.attackBaseScale = this.attackTransform.scale.clone();
            this.defenseBaseScale = this.defenseTransform.scale.clone();
            this.attackBaseColor = this.attackImage.color.clone();
            this.defenseBaseColor = this.defenseImage.color.clone();
            this.lastAttackEnabled = this.attackEnabled;
            this.lastDefenseEnabled = this.defenseEnabled;
            this.turnLabel.text = "Turn " + this.turnCount;
            this.countdownLabel.text = "10";
            this.countdownText.setEnabledInHierarchy(false);
            APJS.EventManager.getGlobalEmitter().on(APJS.EventType.Touch, this.touchCallback, this);
            this.initialized = true;
            this.applyButtonColors();
            console.log("[Button Debug] Ready");
        }
        if (this.attackEnabled !== this.lastAttackEnabled || this.defenseEnabled !== this.lastDefenseEnabled) {
            this.lastAttackEnabled = this.attackEnabled;
            this.lastDefenseEnabled = this.defenseEnabled;
            if (!this.attackEnabled) {
                this.attackPressed = false;
                this.attackPulse = -1;
                if (this.activeButton === 1)
                    this.activeButton = 0;
            }
            if (!this.defenseEnabled) {
                this.defensePressed = false;
                this.defensePulse = -1;
                if (this.activeButton === 2)
                    this.activeButton = 0;
            }
            this.applyButtonColors();
        }
        const blend = Math.min(1, dt * 22);
        if (this.attackPulse >= 0)
            this.attackPulse += dt;
        if (this.defensePulse >= 0)
            this.defensePulse += dt;
        const attackTarget = this.getScaleTarget(this.attackPressed, this.attackPulse);
        const defenseTarget = this.getScaleTarget(this.defensePressed, this.defensePulse);
        this.attackCurrentScale += (attackTarget - this.attackCurrentScale) * blend;
        this.defenseCurrentScale += (defenseTarget - this.defenseCurrentScale) * blend;
        this.attackTransform.scale = new APJS.Vector2f(this.attackBaseScale.x * this.attackCurrentScale, this.attackBaseScale.y * this.attackCurrentScale);
        this.defenseTransform.scale = new APJS.Vector2f(this.defenseBaseScale.x * this.defenseCurrentScale, this.defenseBaseScale.y * this.defenseCurrentScale);
        this.updatePreparationCountdown(dt);
    }
    getScaleTarget(pressed, pulseTime) {
        if (pressed)
            return 0.88;
        if (pulseTime < 0)
            return 1;
        if (pulseTime >= 0.22)
            return 1;
        return 1 + 0.12 * Math.sin((pulseTime / 0.22) * Math.PI);
    }
    applyButtonColors() {
        this.attackImage.color = this.getButtonColor(this.attackBaseColor, this.attackEnabled, this.attackPressed);
        this.defenseImage.color = this.getButtonColor(this.defenseBaseColor, this.defenseEnabled, this.defensePressed);
    }
    getButtonColor(base, enabled, pressed) {
        const intensity = !enabled ? 0.38 : (pressed ? 0.72 : 1);
        const alpha = !enabled ? base.a * 0.68 : base.a;
        return new APJS.Color(base.r * intensity, base.g * intensity, base.b * intensity, alpha);
    }
    advanceTurn() {
        this.turnCount += 1;
        this.turnLabel.text = "Turn " + this.turnCount;
    }
    startPreparationCountdown() {
        this.countdownValue = 10;
        this.countdownElapsed = 0;
        this.fightVisibleTime = 0;
        this.countdownActive = true;
        this.fightVisible = false;
        this.countdownLabel.text = "10";
        this.countdownText.setEnabledInHierarchy(true);
    }
    updatePreparationCountdown(dt) {
        if (this.countdownActive) {
            this.countdownElapsed += dt;
            while (this.countdownElapsed >= 1 && this.countdownActive) {
                this.countdownElapsed -= 1;
                if (this.countdownValue > 1) {
                    this.countdownValue -= 1;
                    this.countdownLabel.text = String(this.countdownValue);
                }
                else {
                    this.countdownActive = false;
                    this.fightVisible = true;
                    this.fightVisibleTime = 1;
                    this.countdownLabel.text = "Fight";
                }
            }
            return;
        }
        if (this.fightVisible) {
            this.fightVisibleTime -= dt;
            if (this.fightVisibleTime <= 0) {
                this.fightVisible = false;
                this.countdownText.setEnabledInHierarchy(false);
            }
        }
    }
    onDestroy() {
        if (this.initialized) {
            APJS.EventManager.getGlobalEmitter().off(APJS.EventType.Touch, this.touchCallback, this);
        }
    }
};
__decorate([
    serializeSceneObjectFlag,
    serializeProperty
], ButtonTapDebug.prototype, "attackButton", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty
], ButtonTapDebug.prototype, "defenseButton", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty
], ButtonTapDebug.prototype, "turnText", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty
], ButtonTapDebug.prototype, "countdownText", void 0);
__decorate([
    serializeProperty
], ButtonTapDebug.prototype, "attackEnabled", void 0);
__decorate([
    serializeProperty
], ButtonTapDebug.prototype, "defenseEnabled", void 0);
ButtonTapDebug = __decorate([
    component()
], ButtonTapDebug);
exports.ButtonTapDebug = ButtonTapDebug;
