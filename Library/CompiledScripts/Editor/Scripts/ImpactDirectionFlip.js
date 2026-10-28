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
exports.ImpactDirectionFlip = void 0;
let ImpactDirectionFlip = class ImpactDirectionFlip extends APJS.BasicScriptComponent {
    constructor() {
        super(...arguments);
        this.initialized = false;
        this.projectileWasEnabled = false;
        this.impactWasEnabled = false;
        this.previousX = 0;
        this.travelDirection = 1;
    }
    onLateUpdate(_deltaTime) {
        if (!this.projectileObject || !this.projectileTransform || !this.impactObject || !this.impactImage) {
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
                // A newly enabled projectile may have teleported to its launch point.
                // Treat this as the baseline, then infer direction from later frames.
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
            // The art is authored left-to-right; mirror it only for a leftward shot.
            this.impactImage.flipX = this.travelDirection < 0;
        }
        this.projectileWasEnabled = projectileEnabled;
        this.impactWasEnabled = impactEnabled;
    }
};
__decorate([
    serializeSceneObjectFlag,
    header("Advanced — Scene Wiring"),
    serializeProperty,
    tooltip("Projectile whose horizontal movement determines the impact direction.")
], ImpactDirectionFlip.prototype, "projectileObject", void 0);
__decorate([
    serializeProperty,
    tooltip("Screen transform used to sample the projectile's position.")
], ImpactDirectionFlip.prototype, "projectileTransform", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty,
    tooltip("Impact effect object whose show event is detected.")
], ImpactDirectionFlip.prototype, "impactObject", void 0);
__decorate([
    serializeProperty,
    tooltip("Impact image mirrored when the projectile traveled left.")
], ImpactDirectionFlip.prototype, "impactImage", void 0);
ImpactDirectionFlip = __decorate([
    component()
], ImpactDirectionFlip);
exports.ImpactDirectionFlip = ImpactDirectionFlip;
