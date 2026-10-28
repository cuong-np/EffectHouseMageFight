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
exports.AnimationManager = void 0;
let AnimationManager = class AnimationManager extends APJS.BasicScriptComponent {
    constructor() {
        super(...arguments);
        this.ready = false;
    }
    onStart() {
        if (!this.idleTex || !this.attackTex || !this.parryTex || !this.deadTex ||
            !this.projectileTex || !this.impactTex || !this.playerObj || !this.botObj ||
            !this.projectileObj || !this.impactObj) {
            console.error("[AnimationManager] One or more animation references are missing.");
            return;
        }
        this.playerImage = this.playerObj.getComponent("Image");
        this.botImage = this.botObj.getComponent("Image");
        this.projectileImage = this.projectileObj.getComponent("Image");
        this.impactImage = this.impactObj.getComponent("Image");
        this.ready = !!this.playerImage && !!this.botImage && !!this.projectileImage && !!this.impactImage;
        if (!this.ready) {
            console.error("[AnimationManager] An animation target is missing its Image component.");
        }
    }
    playIdle(isPlayer) {
        if (this.ready)
            this.playGif(isPlayer ? this.playerImage : this.botImage, this.idleTex);
    }
    playAttack(isPlayer) {
        if (this.ready)
            this.playGif(isPlayer ? this.playerImage : this.botImage, this.attackTex);
    }
    playDefendLoop(isPlayer) {
        if (!this.ready || !this.defendLoopTex)
            return;
        const image = isPlayer ? this.playerImage : this.botImage;
        image.texture = this.defendLoopTex;
        const provider = this.defendLoopTex.getControl();
        provider.loopCount = -1;
        provider.playFromStart();
    }
    playParry() {
        if (!this.ready || !this.parryTex)
            return;
        this.playerImage.texture = this.parryTex;
        const provider = this.parryTex.getControl();
        provider.reset();
    }
    playDead(isPlayer) {
        if (this.ready)
            this.playGif(isPlayer ? this.playerImage : this.botImage, this.deadTex);
    }
    playProjectile() {
        if (this.ready)
            this.playGif(this.projectileImage, this.projectileTex);
    }
    playImpact() {
        if (this.ready)
            this.playGif(this.impactImage, this.impactTex);
    }
    playGif(image, texture) {
        image.texture = texture;
        const provider = texture.getControl();
        provider.playFromStart();
    }
};
__decorate([
    header("Animation Textures"),
    serializeProperty,
    tooltip("Idle loop used by both fighters.")
], AnimationManager.prototype, "idleTex", void 0);
__decorate([
    serializeProperty,
    tooltip("Attack animation used by the active fighter.")
], AnimationManager.prototype, "attackTex", void 0);
__decorate([
    serializeProperty,
    tooltip("Looping defense animation used while the player is blocking.")
], AnimationManager.prototype, "defendLoopTex", void 0);
__decorate([
    serializeProperty,
    tooltip("One-shot frame animation played when the player parries.")
], AnimationManager.prototype, "parryTex", void 0);
__decorate([
    serializeProperty,
    tooltip("One-shot animation used when a fighter is defeated.")
], AnimationManager.prototype, "deadTex", void 0);
__decorate([
    serializeProperty,
    tooltip("WaterBall animation shown during a projectile launch.")
], AnimationManager.prototype, "projectileTex", void 0);
__decorate([
    serializeProperty,
    tooltip("Splash animation shown when a projectile hits.")
], AnimationManager.prototype, "impactTex", void 0);
__decorate([
    serializeSceneObjectFlag,
    header("Animation Targets"),
    serializeProperty
], AnimationManager.prototype, "playerObj", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty
], AnimationManager.prototype, "botObj", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty
], AnimationManager.prototype, "projectileObj", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty
], AnimationManager.prototype, "impactObj", void 0);
AnimationManager = __decorate([
    component()
], AnimationManager);
exports.AnimationManager = AnimationManager;
