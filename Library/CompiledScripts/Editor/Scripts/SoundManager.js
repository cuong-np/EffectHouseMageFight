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
exports.SoundManager = void 0;
let SoundManager = class SoundManager extends APJS.BasicScriptComponent {
    constructor() {
        super(...arguments);
        this.ready = false;
        this.blockLoopPlaying = false;
    }
    onStart() {
        this.ready = !!this.projectileSpawnAudio && !!this.waterHitAudio &&
            !!this.resultChimeAudio && !!this.staminaGainAudio && !!this.blockLoopAudio;
        if (!this.ready) {
            console.error("[SoundManager] One or more audio references are missing.");
        }
    }
    playProjectileSpawn() {
        if (this.ready)
            this.projectileSpawnAudio.play();
    }
    playWaterHit() {
        if (this.ready)
            this.waterHitAudio.play();
    }
    playResultChime() {
        if (this.ready)
            this.resultChimeAudio.play();
    }
    playStaminaGainChime() {
        if (this.ready)
            this.staminaGainAudio.play();
    }
    startBlockLoop() {
        if (!this.ready || this.blockLoopPlaying)
            return;
        this.blockLoopAudio.play();
        this.blockLoopPlaying = true;
    }
    stopBlockLoop() {
        if (!this.blockLoopPlaying)
            return;
        this.blockLoopAudio.stop();
        this.blockLoopPlaying = false;
    }
    onDestroy() {
        this.stopBlockLoop();
    }
};
__decorate([
    header("Battle Sound Wiring"),
    serializeProperty,
    tooltip("One-shot sound when the WaterBall launches.")
], SoundManager.prototype, "projectileSpawnAudio", void 0);
__decorate([
    serializeProperty,
    tooltip("One-shot WaterBall hit sound.")
], SoundManager.prototype, "waterHitAudio", void 0);
__decorate([
    serializeProperty,
    tooltip("Short chime used while the winner HP percentage counts.")
], SoundManager.prototype, "resultChimeAudio", void 0);
__decorate([
    serializeProperty,
    tooltip("One-shot sound played when the player regains stamina.")
], SoundManager.prototype, "staminaGainAudio", void 0);
__decorate([
    serializeProperty,
    tooltip("Looping dark-magic sound played for the duration of the player Block state.")
], SoundManager.prototype, "blockLoopAudio", void 0);
SoundManager = __decorate([
    component()
], SoundManager);
exports.SoundManager = SoundManager;
