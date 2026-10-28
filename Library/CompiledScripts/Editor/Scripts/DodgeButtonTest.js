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
exports.DodgeButtonTest = void 0;
let DodgeButtonTest = class DodgeButtonTest extends APJS.BasicScriptComponent {
    constructor() {
        super(...arguments);
        this.onTouch = (event) => {
            const touch = event.args[0];
            if (touch.phase !== APJS.TouchPhase.Began || !this.buttonImage)
                return;
            if (APJS.TouchUtils.isScreenPointOnImage(touch.position, this.buttonImage)) {
                console.log("[Dodge] clicked");
            }
        };
    }
    onStart() {
        if (!this.buttonObj)
            return;
        this.buttonImage = this.buttonObj.getComponent("Image");
        this.emitter = APJS.EventManager.getGlobalEmitter();
        this.emitter.on(APJS.EventType.Touch, this.onTouch);
    }
    onDestroy() {
        if (this.emitter)
            this.emitter.off(APJS.EventType.Touch, this.onTouch);
    }
};
__decorate([
    serializeSceneObjectFlag,
    serializeProperty
], DodgeButtonTest.prototype, "buttonObj", void 0);
DodgeButtonTest = __decorate([
    component()
], DodgeButtonTest);
exports.DodgeButtonTest = DodgeButtonTest;
