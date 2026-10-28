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
var BotCharacter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotCharacter = void 0;
let BotCharacter = BotCharacter_1 = class BotCharacter extends APJS.BasicScriptComponent {
    chooseSkills(playerHp, botHp, botMana, maxHp, attackCost, defenseCost) {
        const botHpIsLow = botHp <= maxHp * 0.75;
        if (botMana <= 5 && (!botHpIsLow || botMana < attackCost)) {
            return BotCharacter_1.NO_SKILL;
        }
        let skillChance = 1;
        if (!botHpIsLow) {
            if (botMana === 6)
                skillChance = 0.25;
            else if (botMana === 7)
                skillChance = 0.45;
            else if (botMana === 8)
                skillChance = 0.65;
            else if (botMana === 9)
                skillChance = 0.85;
        }
        if (Math.random() >= skillChance)
            return BotCharacter_1.NO_SKILL;
        if (botMana >= attackCost + defenseCost && Math.random() < 0.35) {
            return BotCharacter_1.BOTH_SKILLS;
        }
        let chooseDefense = false;
        if (botHpIsLow) {
            if (playerHp > botHp)
                chooseDefense = Math.random() < 0.65;
            else if (botHp > playerHp)
                chooseDefense = Math.random() < 0.35;
            else
                chooseDefense = Math.random() < 0.5;
        }
        else {
            chooseDefense = botHp < playerHp;
        }
        if (chooseDefense && botMana >= defenseCost)
            return BotCharacter_1.DEFENSE_SKILL;
        if (botMana >= attackCost)
            return BotCharacter_1.ATTACK_SKILL;
        return BotCharacter_1.NO_SKILL;
    }
};
BotCharacter.NO_SKILL = 0;
BotCharacter.ATTACK_SKILL = 1;
BotCharacter.DEFENSE_SKILL = 2;
BotCharacter.BOTH_SKILLS = 3;
BotCharacter = BotCharacter_1 = __decorate([
    component()
], BotCharacter);
exports.BotCharacter = BotCharacter;
