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
exports.ProjectileSpawnOffset = void 0;
let ProjectileSpawnOffset = class ProjectileSpawnOffset extends APJS.BasicScriptComponent {
    // Projectile positioning and flight are owned by BattleManager now.
    // Keep the attached component/resource stable, but do not write transforms here.
    onLateUpdate(_deltaTime) { }
};
__decorate([
    serializeSceneObjectFlag,
    serializeProperty
], ProjectileSpawnOffset.prototype, "projectileObj", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty
], ProjectileSpawnOffset.prototype, "playerObj", void 0);
__decorate([
    serializeSceneObjectFlag,
    serializeProperty
], ProjectileSpawnOffset.prototype, "botObj", void 0);
ProjectileSpawnOffset = __decorate([
    component()
], ProjectileSpawnOffset);
exports.ProjectileSpawnOffset = ProjectileSpawnOffset;
