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
exports.FightNowButtonPulse = void 0;
let FightNowButtonPulse = class FightNowButtonPulse extends APJS.BasicScriptComponent {
    constructor() {
        super(...arguments);
        this.transform = null;
        this.baseScale = null;
        this.elapsed = 0;
        this.cycleDuration = 1.2;
        this.maxScaleIncrease = 0.1;
    }
    onStart() {
        this.transform = this.getSceneObject().getComponent("ScreenTransform");
        if (!this.transform)
            return;
        const scale = this.transform.localScale;
        this.baseScale = new APJS.Vector3f(scale.x, scale.y, scale.z);
    }
    onUpdate(deltaTime) {
        if (!this.transform || !this.baseScale)
            return;
        this.elapsed = (this.elapsed + deltaTime) % this.cycleDuration;
        const progress = this.elapsed / this.cycleDuration;
        const pulse = 0.5 - 0.5 * Math.cos(2 * Math.PI * progress);
        const factor = 1 + this.maxScaleIncrease * pulse;
        this.transform.localScale = new APJS.Vector3f(this.baseScale.x * factor, this.baseScale.y * factor, this.baseScale.z * factor);
    }
    onDisable() {
        this.elapsed = 0;
        if (this.transform && this.baseScale) {
            this.transform.localScale = new APJS.Vector3f(this.baseScale.x, this.baseScale.y, this.baseScale.z);
        }
    }
};
FightNowButtonPulse = __decorate([
    component()
], FightNowButtonPulse);
exports.FightNowButtonPulse = FightNowButtonPulse;
