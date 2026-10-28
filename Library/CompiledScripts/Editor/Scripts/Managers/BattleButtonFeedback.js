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
exports.BattleButtonFeedback = void 0;
let BattleButtonFeedback = class BattleButtonFeedback extends APJS.BasicScriptComponent {
    constructor() {
        super(...arguments);
        this.initialized = false;
        this.pressedButton = null;
        this.onTouch = (event) => {
            if (!this.initialized) {
                return;
            }
            const touchInfo = event.args[0];
            if (touchInfo.phase === APJS.TouchPhase.Began) {
                if (this.pressedButton !== null) {
                    return;
                }
                if (this.defenseImage.opacity >= 0.99 &&
                    APJS.TouchUtils.isScreenPointOnImage(touchInfo.position, this.defenseImage)) {
                    this.pressedButton = "defense";
                    this.setButtonVisual("defense", true);
                }
                else if (this.attackImage.opacity >= 0.99 &&
                    APJS.TouchUtils.isScreenPointOnImage(touchInfo.position, this.attackImage)) {
                    this.pressedButton = "attack";
                    this.setButtonVisual("attack", true);
                }
                return;
            }
            if (this.pressedButton === null) {
                return;
            }
            if (touchInfo.phase === APJS.TouchPhase.Moved) {
                const inside = this.isInsidePressedButton(touchInfo.position);
                this.setButtonVisual(this.pressedButton, inside);
                return;
            }
            if (touchInfo.phase === APJS.TouchPhase.Ended) {
                const button = this.pressedButton;
                const clickedInside = this.isInsidePressedButton(touchInfo.position);
                this.setButtonVisual(button, false);
                this.pressedButton = null;
                if (clickedInside && button === "attack") {
                    console.log("[Battle UI] Attack_Button clicked");
                }
                else if (clickedInside && button === "defense") {
                    console.log("[Battle UI] Defense_Button clicked");
                }
                return;
            }
            if (touchInfo.phase === APJS.TouchPhase.Canceled) {
                this.setButtonVisual(this.pressedButton, false);
                this.pressedButton = null;
            }
        };
    }
    onUpdate(_deltaTime) {
        if (this.initialized || !this.attackButtonObj || !this.defenseButtonObj) {
            return;
        }
        const attackImage = this.attackButtonObj.getComponent("Image");
        const defenseImage = this.defenseButtonObj.getComponent("Image");
        const attackTransform = this.attackButtonObj.getComponent("ScreenTransform");
        const defenseTransform = this.defenseButtonObj.getComponent("ScreenTransform");
        if (!attackImage || !defenseImage || !attackTransform || !defenseTransform) {
            console.error("[Battle UI] Button image or transform is missing");
            return;
        }
        this.attackImage = attackImage;
        this.defenseImage = defenseImage;
        this.attackTransform = attackTransform;
        this.defenseTransform = defenseTransform;
        const attackScale = attackTransform.scale;
        const defenseScale = defenseTransform.scale;
        this.attackBaseScale = new APJS.Vector2f(attackScale.x, attackScale.y);
        this.defenseBaseScale = new APJS.Vector2f(defenseScale.x, defenseScale.y);
        APJS.EventManager.getGlobalEmitter().on(APJS.EventType.Touch, this.onTouch);
        this.initialized = true;
        console.log("[Battle UI] Attack_Button and Defense_Button input ready");
    }
    isInsidePressedButton(position) {
        if (this.pressedButton === "attack") {
            return APJS.TouchUtils.isScreenPointOnImage(position, this.attackImage);
        }
        if (this.pressedButton === "defense") {
            return APJS.TouchUtils.isScreenPointOnImage(position, this.defenseImage);
        }
        return false;
    }
    setButtonVisual(button, pressed) {
        const tint = pressed
            ? new APJS.Color(0.68, 0.68, 0.68, 1)
            : new APJS.Color(1, 1, 1, 1);
        const factor = pressed ? 0.9 : 1;
        if (button === "attack") {
            this.attackImage.color = tint;
            this.attackTransform.scale = new APJS.Vector2f(this.attackBaseScale.x * factor, this.attackBaseScale.y * factor);
        }
        else {
            this.defenseImage.color = tint;
            this.defenseTransform.scale = new APJS.Vector2f(this.defenseBaseScale.x * factor, this.defenseBaseScale.y * factor);
        }
    }
    onDestroy() {
        if (this.initialized) {
            APJS.EventManager.getGlobalEmitter().off(APJS.EventType.Touch, this.onTouch);
        }
    }
};
__decorate([
    serializeSceneObjectFlag,
    serializeProperty
], BattleButtonFeedback.prototype, "attackButtonObj", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty
], BattleButtonFeedback.prototype, "defenseButtonObj", void 0);
BattleButtonFeedback = __decorate([
    component()
], BattleButtonFeedback);
exports.BattleButtonFeedback = BattleButtonFeedback;
