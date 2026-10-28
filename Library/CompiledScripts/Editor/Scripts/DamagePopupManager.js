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
var DamagePopupManager_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DamagePopupManager = void 0;
let DamagePopupManager = DamagePopupManager_1 = class DamagePopupManager extends APJS.BasicScriptComponent {
    constructor() {
        super(...arguments);
        this.pendingPlayerCrit = false;
        this.pendingBotCrit = false;
        this.playerPreviousFill = 1;
        this.botPreviousFill = 1;
        this.playerBaseX = 0;
        this.playerBaseY = 155;
        this.botBaseX = 0;
        this.botBaseY = 155;
        this.playerPopupElapsed = -1;
        this.botPopupElapsed = -1;
        this.staminaPopupElapsed = -1;
        this.staminaBaseX = 0;
        this.staminaBaseY = 0;
        this.onDamageApplied = (event) => {
            const hit = event.args[0];
            if (hit.target === "player" && hit.staminaGain && hit.staminaGain > 0) {
                this.showStaminaGainPopup(hit.staminaGain);
                return;
            }
            if (hit.target === "player" && hit.fullCounter) {
                this.pendingPlayerCrit = false;
                this.showFullCounterPopup();
                return;
            }
            if (hit.target === "player" && hit.miss) {
                this.pendingPlayerCrit = false;
                this.showMissPopup();
                return;
            }
            if (hit.target === "player" && hit.blocked) {
                this.pendingPlayerCrit = false;
                this.showBlockedPopup();
                return;
            }
            if (hit.target === "player") {
                this.pendingPlayerCrit = hit.critical;
            }
            else if (hit.target === "bot") {
                this.pendingBotCrit = hit.critical;
            }
        };
    }
    onStart() {
        if (!this.staminaGainPopup || !this.staminaGainPopupText || !this.staminaGainPopupTransform || !this.soundManagerObj) {
            console.error("[DamagePopupManager] Stamina popup or SoundManager references are missing.");
            return;
        }
        this.soundManager = this.soundManagerObj.getComponent("SoundManager");
        if (!this.soundManager) {
            console.error("[DamagePopupManager] SoundManager component is missing.");
            return;
        }
        this.playerPreviousFill = this.readFill(this.playerHealthFill);
        this.botPreviousFill = this.readFill(this.botHealthFill);
        const playerPosition = this.playerPopupTransform.anchoredPosition;
        this.playerBaseX = playerPosition.x;
        this.playerBaseY = playerPosition.y;
        const botPosition = this.botPopupTransform.anchoredPosition;
        this.botBaseX = botPosition.x;
        this.botBaseY = botPosition.y;
        const staminaPosition = this.staminaGainPopupTransform.anchoredPosition;
        this.staminaBaseX = staminaPosition.x;
        this.staminaBaseY = staminaPosition.y;
        this.playerPopup.setEnabledInHierarchy(false);
        this.botPopup.setEnabledInHierarchy(false);
        this.staminaGainPopup.setEnabledInHierarchy(false);
        this.playerText.text = "";
        this.staminaGainPopupText.text = "";
        this.botText.text = "";
        this.damageEventType = APJS.EventManager.defineUserEventType("battle.damage_popup");
        APJS.EventManager.getGlobalEmitter().on(this.damageEventType, this.onDamageApplied, this);
    }
    onDestroy() {
        APJS.EventManager.getGlobalEmitter().off(this.damageEventType, this.onDamageApplied, this);
    }
    onLateUpdate(deltaTime) {
        const playerFill = this.readFill(this.playerHealthFill);
        const botFill = this.readFill(this.botHealthFill);
        const playerDamage = Math.round((this.playerPreviousFill - playerFill) * DamagePopupManager_1.MAX_HP);
        if (playerDamage > 0) {
            this.showPopup(playerDamage, this.playerPopup, this.playerText, this.playerPopupTransform, this.playerBaseX, this.playerBaseY, this.pendingPlayerCrit);
            this.pendingPlayerCrit = false;
        }
        const botDamage = Math.round((this.botPreviousFill - botFill) * DamagePopupManager_1.MAX_HP);
        if (botDamage > 0) {
            this.showPopup(botDamage, this.botPopup, this.botText, this.botPopupTransform, this.botBaseX, this.botBaseY, this.pendingBotCrit);
            this.pendingBotCrit = false;
        }
        this.playerPreviousFill = playerFill;
        this.botPreviousFill = botFill;
        this.playerPopupElapsed = this.advancePopup(deltaTime, this.playerPopupElapsed, this.playerPopup, this.playerPopupTransform, this.playerBaseX, this.playerBaseY);
        this.botPopupElapsed = this.advancePopup(deltaTime, this.botPopupElapsed, this.botPopup, this.botPopupTransform, this.botBaseX, this.botBaseY);
        this.staminaPopupElapsed = this.advancePopup(deltaTime, this.staminaPopupElapsed, this.staminaGainPopup, this.staminaGainPopupTransform, this.staminaBaseX, this.staminaBaseY);
    }
    readFill(image) {
        const value = image.getMaterialProperty("_filledRange");
        return typeof value === "number" ? value : 1;
    }
    showPopup(damage, popup, text, transform, baseX, baseY, isCrit) {
        text.text = "-" + damage.toString();
        text.color = isCrit
            ? new APJS.Color(1, 0.52, 0.02, 1)
            : new APJS.Color(1, 1, 1, 1);
        text.fontSize = isCrit
            ? DamagePopupManager_1.CRIT_FONT_SIZE
            : DamagePopupManager_1.NORMAL_FONT_SIZE;
        text.opacity = 1;
        transform.anchoredPosition = new APJS.Vector2f(baseX, baseY);
        popup.setEnabledInHierarchy(true);
        if (popup === this.playerPopup) {
            this.playerPopupElapsed = 0;
        }
        else {
            this.botPopupElapsed = 0;
        }
    }
    showStaminaGainPopup(amount) {
        this.staminaGainPopupText.text = "+" + String(amount);
        this.staminaGainPopupText.color = new APJS.Color(0.35, 1, 0.4, 1);
        this.staminaGainPopupText.fontSize = DamagePopupManager_1.NORMAL_FONT_SIZE;
        this.staminaGainPopupText.opacity = 1;
        this.staminaGainPopupTransform.anchoredPosition = new APJS.Vector2f(this.staminaBaseX, this.staminaBaseY);
        this.staminaGainPopup.setEnabledInHierarchy(true);
        this.soundManager.playStaminaGainChime();
        this.staminaPopupElapsed = 0;
    }
    showFullCounterPopup() {
        this.playerText.text = "FULL COUNTER";
        this.playerText.color = new APJS.Color(1, 0.78, 0.15, 1);
        this.playerText.fontSize = 32;
        this.playerText.opacity = 1;
        this.playerPopupTransform.anchoredPosition = new APJS.Vector2f(this.playerBaseX, this.playerBaseY);
        this.playerPopup.setEnabledInHierarchy(true);
        this.playerPopupElapsed = 0;
    }
    showMissPopup() {
        this.playerText.text = "MISS";
        this.playerText.color = new APJS.Color(0.55, 0.9, 1, 1);
        this.playerText.fontSize = DamagePopupManager_1.NORMAL_FONT_SIZE;
        this.playerText.opacity = 1;
        this.playerPopupTransform.anchoredPosition = new APJS.Vector2f(this.playerBaseX, this.playerBaseY);
        this.playerPopup.setEnabledInHierarchy(true);
        this.playerPopupElapsed = 0;
    }
    showBlockedPopup() {
        this.playerText.text = "BLOCKED";
        this.playerText.color = new APJS.Color(0.35, 0.9, 1, 1);
        this.playerText.fontSize = DamagePopupManager_1.NORMAL_FONT_SIZE;
        this.playerText.opacity = 1;
        this.playerPopupTransform.anchoredPosition = new APJS.Vector2f(this.playerBaseX, this.playerBaseY);
        this.playerPopup.setEnabledInHierarchy(true);
        this.playerPopupElapsed = 0;
    }
    advancePopup(deltaTime, elapsed, popup, transform, baseX, baseY) {
        if (elapsed < 0) {
            return -1;
        }
        elapsed += deltaTime;
        const progress = Math.min(elapsed / DamagePopupManager_1.POPUP_DURATION_SEC, 1);
        const eased = 1 - (1 - progress) * (1 - progress);
        transform.anchoredPosition = new APJS.Vector2f(baseX, baseY + DamagePopupManager_1.RISE_DISTANCE_PX * eased);
        if (elapsed >= DamagePopupManager_1.POPUP_DURATION_SEC) {
            popup.setEnabledInHierarchy(false);
            transform.anchoredPosition = new APJS.Vector2f(baseX, baseY);
            return -1;
        }
        return elapsed;
    }
};
DamagePopupManager.MAX_HP = 100;
DamagePopupManager.POPUP_DURATION_SEC = 1;
DamagePopupManager.RISE_DISTANCE_PX = 44;
DamagePopupManager.NORMAL_FONT_SIZE = 46;
DamagePopupManager.CRIT_FONT_SIZE = 64;
__decorate([
    header("Advanced — Scene Wiring"),
    serializeProperty,
    tooltip("Player health fill; a decrease triggers the player's damage popup.")
], DamagePopupManager.prototype, "playerHealthFill", void 0);
__decorate([
    serializeProperty,
    tooltip("Bot health fill; a decrease triggers the bot's damage popup.")
], DamagePopupManager.prototype, "botHealthFill", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty,
    tooltip("Hidden Text object positioned above the player.")
], DamagePopupManager.prototype, "playerPopup", void 0);
__decorate([
    serializeProperty,
    tooltip("Text component used for the player's damage number.")
], DamagePopupManager.prototype, "playerText", void 0);
__decorate([
    serializeProperty,
    tooltip("ScreenTransform used to animate the player's damage number.")
], DamagePopupManager.prototype, "playerPopupTransform", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty,
    tooltip("Hidden Text object positioned above the bot.")
], DamagePopupManager.prototype, "botPopup", void 0);
__decorate([
    serializeProperty,
    tooltip("Text component used for the bot's damage number.")
], DamagePopupManager.prototype, "botText", void 0);
__decorate([
    serializeProperty,
    tooltip("ScreenTransform used to animate the bot's damage number.")
], DamagePopupManager.prototype, "botPopupTransform", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty,
    tooltip("Hidden +stamina popup above the stamina HUD.")
], DamagePopupManager.prototype, "staminaGainPopup", void 0);
__decorate([
    serializeProperty,
    tooltip("Text component for the stamina gain popup.")
], DamagePopupManager.prototype, "staminaGainPopupText", void 0);
__decorate([
    serializeProperty,
    tooltip("ScreenTransform used to animate the stamina gain popup.")
], DamagePopupManager.prototype, "staminaGainPopupTransform", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty,
    tooltip("Sound manager that plays the stamina gain chime.")
], DamagePopupManager.prototype, "soundManagerObj", void 0);
DamagePopupManager = DamagePopupManager_1 = __decorate([
    component()
], DamagePopupManager);
exports.DamagePopupManager = DamagePopupManager;
