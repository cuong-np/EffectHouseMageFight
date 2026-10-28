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
exports.ImpactPivotByDirection = void 0;
let ImpactPivotByDirection = class ImpactPivotByDirection extends APJS.BasicScriptComponent {
    constructor() {
        super(...arguments);
        this.wasTracking = false;
        this.lastX = 0;
        this.lastY = 0;
    }
    onLateUpdate(_deltaTime) {
        if (!this.projectileObj || !this.impactTransform) {
            return;
        }
        if (!this.projectileObj.enabled) {
            this.wasTracking = false;
            return;
        }
        const projectileTransform = this.projectileObj.getComponent("ScreenTransform");
        if (!projectileTransform) {
            return;
        }
        const position = projectileTransform.anchoredPosition;
        if (!this.wasTracking) {
            this.lastX = position.x;
            this.lastY = position.y;
            this.wasTracking = true;
            return;
        }
        const dx = position.x - this.lastX;
        if (Math.abs(dx) > 0.5) {
            const currentPivot = this.impactTransform.pivot;
            const pivotX = dx > 0 ? 0.75 : 0.25;
            this.impactTransform.pivot = new APJS.Vector2f(pivotX, currentPivot.y);
        }
        this.lastX = position.x;
        this.lastY = position.y;
    }
};
__decorate([
    serializeSceneObjectFlag,
    serializeProperty
], ImpactPivotByDirection.prototype, "projectileObj", void 0);
__decorate([
    serializeProperty
], ImpactPivotByDirection.prototype, "impactTransform", void 0);
ImpactPivotByDirection = __decorate([
    component()
], ImpactPivotByDirection);
exports.ImpactPivotByDirection = ImpactPivotByDirection;
