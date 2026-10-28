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
var PlayerCharacter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerCharacter = void 0;
let PlayerCharacter = PlayerCharacter_1 = class PlayerCharacter extends APJS.BasicScriptComponent {
    constructor() {
        super(...arguments);
        this.dodgeFadeElapsed = -1;
    }
    onStart() {
        this.getSharedCharacter();
        this.getCharacterImage();
    }
    resetState(maxHp) {
        const character = this.getSharedCharacter();
        if (character)
            character.resetState(maxHp);
        this.dodgeFadeElapsed = -1;
        const image = this.getCharacterImage();
        if (image)
            image.opacity = 1;
    }
    beginDodgeVisual() {
        const image = this.getCharacterImage();
        if (!image)
            return;
        this.dodgeFadeElapsed = 0;
        image.opacity = 1;
    }
    updateDodgeVisual(deltaTime) {
        const image = this.getCharacterImage();
        if (!image || this.dodgeFadeElapsed < 0)
            return;
        this.dodgeFadeElapsed += Math.max(0, deltaTime);
        if (this.dodgeFadeElapsed <= PlayerCharacter_1.DODGE_FADE_OUT_SEC) {
            image.opacity = 1 - this.dodgeFadeElapsed / PlayerCharacter_1.DODGE_FADE_OUT_SEC;
            return;
        }
        const fadeInElapsed = this.dodgeFadeElapsed - PlayerCharacter_1.DODGE_FADE_OUT_SEC;
        image.opacity = Math.min(1, fadeInElapsed / PlayerCharacter_1.DODGE_FADE_IN_SEC);
        if (fadeInElapsed >= PlayerCharacter_1.DODGE_FADE_IN_SEC) {
            image.opacity = 1;
            this.dodgeFadeElapsed = -1;
        }
    }
    getHp() {
        const character = this.getSharedCharacter();
        return character ? character.getHp() : 0;
    }
    getDamageMultiplier() {
        const character = this.getSharedCharacter();
        return character ? character.getDamageMultiplier() : 1;
    }
    applyDamage(amount) {
        const character = this.getSharedCharacter();
        if (character)
            character.applyDamage(amount);
    }
    refreshBars() {
        const character = this.getSharedCharacter();
        if (character)
            character.refreshBars();
    }
    getCharacterImage() {
        if (!this.characterImage && this.characterObj) {
            this.characterImage = this.characterObj.getComponent("Image");
        }
        return this.characterImage || null;
    }
    getSharedCharacter() {
        if (!this.sharedCharacter && this.characterObj) {
            this.sharedCharacter = this.characterObj.getComponent("Character");
        }
        return this.sharedCharacter;
    }
};
PlayerCharacter.DODGE_FADE_OUT_SEC = 0.15;
PlayerCharacter.DODGE_FADE_IN_SEC = 0.15;
__decorate([
    serializeSceneObjectFlag,
    header("Shared Character"),
    serializeProperty,
    tooltip("Mage_Player scene object containing the shared Character component.")
], PlayerCharacter.prototype, "characterObj", void 0);
PlayerCharacter = PlayerCharacter_1 = __decorate([
    component()
], PlayerCharacter);
exports.PlayerCharacter = PlayerCharacter;
