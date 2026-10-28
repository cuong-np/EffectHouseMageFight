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
exports.ImpactDirectionPresentation = void 0;
let ImpactDirectionPresentation = class ImpactDirectionPresentation extends APJS.BasicScriptComponent {
    constructor() {
        super(...arguments);
        this.behindOffsetPixels = 100;
        this.initialized = false;
        this.projectileWasEnabled = false;
        this.impactWasEnabled = false;
        this.previousX = 0;
        this.travelDirection = 1;
    }
    onLateUpdate(_deltaTime) {
        if (!this.projectileObject || !this.projectileTransform || !this.impactObject ||
            !this.impactTransform || !this.impactImage) {
            return;
        }
        const projectileEnabled = this.projectileObject.isEnabledInHierarchy();
        const impactEnabled = this.impactObject.isEnabledInHierarchy();
        const currentX = this.projectileTransform.anchoredPosition.x;
        if (!this.initialized) {
            this.previousX = currentX;
            this.projectileWasEnabled = projectileEnabled;
            this.impactWasEnabled = impactEnabled;
            this.initialized = true;
            return;
        }
        if (projectileEnabled) {
            if (!this.projectileWasEnabled) {
                this.previousX = currentX;
            }
            else {
                const deltaX = currentX - this.previousX;
                if (deltaX < -0.01) {
                    this.travelDirection = -1;
                }
                else if (deltaX > 0.01) {
                    this.travelDirection = 1;
                }
                this.previousX = currentX;
            }
        }
        if (impactEnabled && !this.impactWasEnabled) {
            this.impactImage.flipX = this.travelDirection < 0;
            const impactPosition = this.impactTransform.anchoredPosition;
            const offset = Math.max(0, Math.min(128, this.behindOffsetPixels));
            this.impactTransform.anchoredPosition = new APJS.Vector2f(impactPosition.x - this.travelDirection * offset, impactPosition.y);
        }
        this.projectileWasEnabled = projectileEnabled;
        this.impactWasEnabled = impactEnabled;
    }
};
__decorate([
    header("Gameplay Tuning"),
    serializeProperty,
    tooltip("Screen-pixel offset behind the projectile when the impact effect appears."),
    slider(0, 128, 1)
], ImpactDirectionPresentation.prototype, "behindOffsetPixels", void 0);
__decorate([
    serializeSceneObjectFlag,
    header("Advanced — Scene Wiring"),
    serializeProperty
], ImpactDirectionPresentation.prototype, "projectileObject", void 0);
__decorate([
    serializeProperty
], ImpactDirectionPresentation.prototype, "projectileTransform", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty
], ImpactDirectionPresentation.prototype, "impactObject", void 0);
__decorate([
    serializeProperty
], ImpactDirectionPresentation.prototype, "impactTransform", void 0);
__decorate([
    serializeProperty
], ImpactDirectionPresentation.prototype, "impactImage", void 0);
ImpactDirectionPresentation = __decorate([
    component()
], ImpactDirectionPresentation);
exports.ImpactDirectionPresentation = ImpactDirectionPresentation;
