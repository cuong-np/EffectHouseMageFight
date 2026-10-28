@component()
export class BattleManager extends APJS.BasicScriptComponent {
  @serializeSceneObjectFlag @header("Advanced — Scene Wiring")
  @serializeProperty
  @tooltip("Game configuration containing health, damage, critical-hit and timing values.")
  gameConfigObj!: APJS.SceneObject;

  @serializeSceneObjectFlag @serializeProperty
  @tooltip("Player A character object.")
  playerObj!: APJS.SceneObject;

  @serializeSceneObjectFlag @serializeProperty
  @tooltip("Bot B character object.")
  botObj!: APJS.SceneObject;

  @serializeSceneObjectFlag @serializeProperty
  @tooltip("UI manager that owns battle UI references and presentation.")
  uiManagerObj!: APJS.SceneObject;

  @serializeSceneObjectFlag @serializeProperty
  @tooltip("Sound manager that owns battle audio players.")
  soundManagerObj!: APJS.SceneObject;

  @serializeSceneObjectFlag @serializeProperty
  @tooltip("Animation manager that owns fighter and effect textures.")
  animationManagerObj!: APJS.SceneObject;


  @serializeSceneObjectFlag @serializeProperty
  @tooltip("WaterBall projectile scene object.")
  projectileObj!: APJS.SceneObject;


  @serializeSceneObjectFlag @serializeProperty
  @tooltip("WaterBall impact scene object.")
  impactObj!: APJS.SceneObject;


  private readonly ATTACK_WINDUP_SEC: number = 0.5;
  private readonly PROJECTILE_GROW_SEC: number = 0.5;
  private readonly CAST_HOLD_SEC: number = 0.5;
  private readonly DEAD_ANIMATION_SEC: number = 1.17;
  private readonly BOT_ATTACK_DELAY_SEC: number = 1;
  private readonly BLOCK_WINDOW_SEC: number = 0.6;
  private readonly DODGE_WINDOW_SEC: number = 0.4;
  private readonly PARRY_WINDOW_SEC: number = 0.2;
  private readonly TURN_END_DELAY_SEC: number = 2;
  private readonly PROJECTILE_SPEED_MULTIPLIER: number = 0.65;
  private readonly HIT_SOUND_LEAD_SEC: number = 0.12;

  private ready: boolean = false;
  private eventsBound: boolean = false;
  private actionButtonsActive: boolean = false;
  private damageEventType!: APJS.UserEventType;
  private resultCompleteType!: APJS.UserEventType;
  private phase: string = "waiting";
  private timer: number = 0;
  private turn: number = 1;
  private resultText: string = "";
  private resultHpTargetPercent: number = 0;
  private impactVisible: boolean = false;
  private hitSoundPlayed: boolean = false;
  private blockActive: boolean = false;
  private blockTimer: number = 0;
  private actionUsedThisTurn: boolean = false;
  private dodgeActive: boolean = false;
  private dodgeTimer: number = 0;
  private dodgeSuccessful: boolean = false;
  private parryActive: boolean = false;
  private parryTimer: number = 0;
  private reflectedDamage: number = -1;
  private reflectedCritical: boolean = false;
  private attackFromPlayer: boolean = false;
  private playerCounterDamageMultiplier: number = 1;
  private staminaRecoveryAmount: number = 0;
  private counterAttackPending: boolean = false;

  private playerCharacter!: any;
  private playerStamina!: any;
  private botCharacter!: any;
  private ui!: any;
  private sound!: any;
  private animation!: any;
  private config!: any;
  private playerTransform!: APJS.ScreenTransform;
  private botTransform!: APJS.ScreenTransform;
  private projectileTransform!: APJS.ScreenTransform;
  private projectileBody!: APJS.RigidBody2D;
  private projectileTrail!: APJS.Component;
  private projectileCollider!: APJS.BoxCollider2D;
  private playerCollider!: APJS.BoxCollider2D;
  private botCollider!: APJS.BoxCollider2D;
  private projectileHitPoint!: APJS.Vector2f;
  private impactTransform!: APJS.ScreenTransform;
  private attackerStart!: APJS.Vector2f;
  private victimEnd!: APJS.Vector2f;

  private onProjectileCollision = (event: APJS.IEvent): void => {
    if (this.phase !== "fly") return;
    const contacts = event.args[0] as APJS.CollisionInfo2D[];
    const attackerObj = this.attackFromPlayer ? this.playerObj : this.botObj;
    for (const contact of contacts) {
      if (!contact.otherObject || contact.otherObject === attackerObj) continue;
      const hitPlayer = contact.otherObject === this.playerObj;
      if (hitPlayer && !this.attackFromPlayer && this.parryActive) {
        this.reflectProjectile();
        return;
      }
      if (hitPlayer && !this.attackFromPlayer && this.dodgeActive && !this.dodgeSuccessful) {
        this.dodgeSuccessful = true;
        const missEvent = APJS.EventManager.createEvent(this.damageEventType);
        missEvent.args = [{target: "player", critical: false, miss: true}];
        APJS.EventManager.getGlobalEmitter().emit(missEvent);
        console.log("[Dodge] MISS — projectile passed through player.");
        return;
      }
      const screenPosition = this.projectileTransform.anchoredPosition;
      this.projectileHitPoint = new APJS.Vector2f(
        screenPosition.x,
        screenPosition.y,
      );
      this.applyImpact(contact.otherObject);
      return;
    }
  };

  private onTouch = (event: APJS.IEvent): void => {
    const touch = event.args[0] as APJS.TouchData;
    if (touch.phase !== APJS.TouchPhase.Began) return;

    if (
      this.phase === "result" &&
      this.ui.isRetryButtonAt(touch.position)
    ) {
      this.resetBattle();
      return;
    }

    if (
      this.phase === "prepare" &&
      this.ui.isFightNowButtonAt(touch.position)
    ) {
      this.startFightNow();
      return;
    }

    if (!this.actionButtonsActive) return;
    if (this.ui.isDodgeButtonAt(touch.position)) {
      this.spendStaminaForAction(1, "Dodge");
      return;
    }
    if (this.ui.isParryButtonAt(touch.position)) {
      this.spendStaminaForAction(2, "Parry");
      return;
    }
    if (this.ui.isBlockButtonAt(touch.position)) {
      this.spendStaminaForAction(3, "Block");
    }
  };

  private onResultComplete = (_event: APJS.IEvent): void => {
    if (this.phase !== "resultTween") return;
    this.phase = "result";
  };

  private onRecordStart = (_event: APJS.IEvent): void => {
    if (this.ready) {
      this.resetBattle();
    }
  };

  onUpdate(dt: number): void {
    if (!this.ready) {
      this.initialize();
      return;
    }

    const delta = Math.max(0, dt);
    if (this.dodgeActive) {
      this.playerCharacter.updateDodgeVisual(delta);
      this.dodgeTimer += delta;
      if (this.dodgeTimer >= this.DODGE_WINDOW_SEC) {
        this.dodgeActive = false;
        this.dodgeTimer = 0;
        if (this.dodgeSuccessful) {
          this.dodgeSuccessful = false;
          this.projectileBody.velocity = new APJS.Vector2f(0, 0);
          this.setProjectileTrail(false);
          this.projectileObj.setEnabledInHierarchy(false);
          this.beginPlayerCounterAttack(1.25);
          return;
        }
      }
    }
    if (this.parryActive) {
      this.parryTimer += delta;
      if (this.parryTimer >= this.PARRY_WINDOW_SEC) {
        this.parryActive = false;
        this.parryTimer = 0;
        this.animation.playIdle(true);
      }
    }
    if (this.blockActive) {
      this.blockTimer += delta;
      if (this.blockTimer >= this.BLOCK_WINDOW_SEC) {
        this.blockActive = false;
        this.blockTimer = 0;
        this.sound.stopBlockLoop();
        if (this.counterAttackPending) {
          this.counterAttackPending = false;
          this.beginPlayerCounterAttack();
        } else {
          this.animation.playIdle(true);
          if (!this.attackFromPlayer &&
              (this.phase === "botWait" || this.phase === "windup" || this.phase === "grow" ||
               this.phase === "castHold" || this.phase === "fly")) {
            this.actionButtonsActive = false;
          }
        }
      }
    }
    switch (this.phase) {
      case "botWait":
        this.timer += delta;
        if (this.timer >= this.BOT_ATTACK_DELAY_SEC) {
          this.beginBotAttack();
        }
        break;
      case "windup":
        this.timer += delta;
        if (this.timer >= this.ATTACK_WINDUP_SEC) {
          this.spawnProjectile();
        }
        break;
      case "grow":
        this.tickProjectileGrowth(delta);
        break;
      case "castHold":
        this.timer += delta;
        if (this.timer >= this.CAST_HOLD_SEC) {
          const duration = Math.max(0.1, this.config.flightSec);
          const horizontalDelta = (this.victimEnd.x - this.attackerStart.x) / 32;
          const directionX = horizontalDelta >= 0 ? 1 : -1;
          const horizontalSpeed = Math.abs(horizontalDelta / duration) * this.PROJECTILE_SPEED_MULTIPLIER;
          this.projectileBody.velocity = new APJS.Vector2f(directionX * horizontalSpeed, 0);
          this.setProjectileTrail(true);
          this.phase = "fly";
          this.timer = 0;
        }
        break;
      case "fly":
        this.tickProjectileFlight();
        break;
      case "impact":
        this.timer += delta;
        if (this.timer >= this.TURN_END_DELAY_SEC) {
          this.finishImpact();
        }
        break;
      case "death":
        this.tickDeath(delta);
        break;
    }
  }

  onDestroy(): void {
    if (!this.eventsBound) {
      return;
    }
    const emitter = APJS.EventManager.getGlobalEmitter();
    emitter.off(APJS.EventType.Touch, this.onTouch, this);
    if (this.resultCompleteType) emitter.off(this.resultCompleteType, this.onResultComplete, this);
    emitter.off(APJS.EventType.RecordStart, this.onRecordStart, this);
    if (this.projectileCollider) {
      APJS.EventManager.getObjectEmitter(this.projectileCollider).off(
        APJS.CollisionEvent2D.Enter, this.onProjectileCollision, this,
      );
    }
  }

  private initialize(): void {
    if (
      !this.gameConfigObj || !this.playerObj || !this.botObj || !this.uiManagerObj || !this.soundManagerObj ||
      !this.animationManagerObj || !this.projectileObj ||
      !this.impactObj
    ) {
      return;
    }

    this.playerTransform = this.playerObj.getComponent("ScreenTransform") as APJS.ScreenTransform;
    this.botTransform = this.botObj.getComponent("ScreenTransform") as APJS.ScreenTransform;
    this.playerCharacter = this.playerObj.getComponent("PlayerCharacter") as any;
    this.playerStamina = this.playerObj.getComponent("PlayerStamina") as any;
    this.botCharacter = this.botObj.getComponent("Character") as any;
    this.ui = this.uiManagerObj.getComponent("UIManager") as any;
    this.sound = this.soundManagerObj.getComponent("SoundManager") as any;
    this.animation = this.animationManagerObj.getComponent("AnimationManager") as any;
    this.config = this.gameConfigObj.getComponent("GameConfig") as any;
    this.projectileTransform = this.projectileObj.getComponent("ScreenTransform") as APJS.ScreenTransform;
    this.projectileTrail = this.projectileObj.getComponent("ParticleEmitter2D") as APJS.Component;
    this.projectileBody = this.projectileObj.getComponent("RigidBody2D") as APJS.RigidBody2D;
    this.projectileCollider = this.projectileObj.getComponent("BoxCollider2D") as APJS.BoxCollider2D;
    this.playerCollider = this.playerObj.getComponent("BoxCollider2D") as APJS.BoxCollider2D;
    this.botCollider = this.botObj.getComponent("BoxCollider2D") as APJS.BoxCollider2D;
    this.impactTransform = this.impactObj.getComponent("ScreenTransform") as APJS.ScreenTransform;

    if (
      !this.playerTransform ||
      !this.botTransform || !this.playerCharacter || !this.playerStamina || !this.botCharacter ||
      !this.ui || !this.sound || !this.animation || !this.config ||
      !this.projectileTransform || !this.projectileTrail || !this.projectileBody || !this.projectileCollider ||
      !this.playerCollider || !this.botCollider || !this.impactTransform
    ) {
      return;
    }

    this.damageEventType = APJS.EventManager.defineUserEventType("battle.damage_popup");
    this.resultCompleteType = APJS.EventManager.defineUserEventType("battle.ui.result_complete");
    this.projectileCollider.emitCollisionEvent = true;
    APJS.EventManager.getObjectEmitter(this.projectileCollider).on(
      APJS.CollisionEvent2D.Enter, this.onProjectileCollision, this,
    );
    this.ready = true;
    const emitter = APJS.EventManager.getGlobalEmitter();
    emitter.on(APJS.EventType.Touch, this.onTouch, this);
    emitter.on(this.resultCompleteType, this.onResultComplete, this);
    emitter.on(APJS.EventType.RecordStart, this.onRecordStart, this);
    this.eventsBound = true;
    this.resetBattle();
  }

  private resetBattle(): void {
    APJS.Physics2D.timeSpeed = 1;
    this.setProjectileTrail(false);
    this.sound.stopBlockLoop();
    this.playerCharacter.resetState(this.config.maxHp);
    this.botCharacter.resetState(this.config.maxHp);
    this.ui.setStamina(this.playerStamina.resetForBattle());

    this.turn = 1;
    this.blockActive = false;
    this.blockTimer = 0;
    this.actionUsedThisTurn = false;
    this.dodgeActive = false;
    this.dodgeTimer = 0;
    this.dodgeSuccessful = false;
    this.parryActive = false;
    this.parryTimer = 0;
    this.reflectedDamage = -1;
    this.reflectedCritical = false;
    this.attackFromPlayer = false;
    this.playerCounterDamageMultiplier = 1;
    this.counterAttackPending = false;
    this.staminaRecoveryAmount = 0;
    this.resultText = "";
    this.ui.resetResult();
    this.impactVisible = false;
    this.timer = 0;
    this.ui.setTurn(this.turn);
    this.animation.playIdle(true);
    this.animation.playIdle(false);
    this.setProjectileTrail(false);
    this.projectileObj.setEnabledInHierarchy(false);
    this.impactObj.setEnabledInHierarchy(false);
    this.ui.setRetryVisible(false);
    this.projectileTransform.scale = new APJS.Vector2f(1, 1);
    this.projectileBody.velocity = new APJS.Vector2f(0, 0);
    this.projectileBody.angularVelocity = 0;
    this.projectileBody.position = new APJS.Vector2f(0, -240 / 32);
    this.startPreparation();
  }

  private setProjectileTrail(active: boolean): void {
    if (this.projectileTrail) this.projectileTrail.enabled = active;
  }

  private startPreparation(): void {
    this.phase = "prepare";
    this.timer = 0;
    this.actionButtonsActive = false;
    this.ui.setTurn(this.turn);
    this.ui.setActionButtonsState(false, this.playerStamina.getCurrentStamina());
    this.ui.setFightNowVisible(true);
  }

  private startFightNow(): void {
    if (this.phase !== "prepare") {
      return;
    }
    this.ui.setFightNowVisible(false);
    this.actionUsedThisTurn = false;
    this.staminaRecoveryAmount = 0;
    this.actionButtonsActive = true;
    this.ui.setActionButtonsState(true, this.playerStamina.getCurrentStamina());
    this.phase = "botWait";
    this.timer = 0;
  }

  private spendStaminaForAction(cost: number, action: string): void {
    if (!this.actionButtonsActive || this.actionUsedThisTurn || !this.playerStamina.trySpend(cost)) return;
    this.actionUsedThisTurn = true;
    this.actionButtonsActive = false;
    const stamina = this.playerStamina.getCurrentStamina();
    this.ui.setStamina(stamina);
    console.log("[" + action + "] spent " + String(cost) + " stamina; " + String(stamina) + " remaining.");
    this.ui.setActionButtonsState(false, stamina);
    if (action === "Block") {
      this.blockActive = true;
      this.blockTimer = 0;
      this.animation.playDefendLoop(true);
      this.sound.startBlockLoop();
    } else if (action === "Dodge") {
      this.dodgeActive = true;
      this.dodgeTimer = 0;
      this.dodgeSuccessful = false;
      this.playerCharacter.beginDodgeVisual();
    } else if (action === "Parry") {
      this.parryActive = true;
      this.parryTimer = 0;
      this.reflectedDamage = -1;
      this.reflectedCritical = false;
      this.animation.playParry();
    }
  }

  private beginBotAttack(): void {
    this.attackFromPlayer = false;
    this.hitSoundPlayed = false;
    const attackerCenter = this.screenCenter(this.botTransform);
    const attackerSize = this.botTransform.sizeDelta;
    this.attackerStart = new APJS.Vector2f(
      attackerCenter.x - Math.max(0, attackerSize.x * 0.5 - 30),
      attackerCenter.y + attackerSize.y * 0.2,
    );
    this.victimEnd = this.screenCenter(this.playerTransform);
    this.animation.playAttack(false);
    this.projectileObj.setEnabledInHierarchy(false);
    this.phase = "windup";
    this.timer = 0;
  }

  private spawnProjectile(): void {
    if (this.attackFromPlayer && this.impactVisible) {
      this.impactObj.setEnabledInHierarchy(false);
      this.impactVisible = false;
    }
    this.setProjectileTrail(false);
    this.projectileObj.setEnabledInHierarchy(true);
    this.projectileBody.position = new APJS.Vector2f(
      this.attackerStart.x / 32,
      this.attackerStart.y / 32,
    );
    this.projectileBody.velocity = new APJS.Vector2f(0, 0);
    this.projectileBody.angularVelocity = 0;
    this.projectileTransform.scale = new APJS.Vector2f(0, 0);
    this.sound.playProjectileSpawn();
    this.animation.playProjectile();
    this.phase = "grow";
    this.timer = 0;
  }

  private tickProjectileGrowth(dt: number): void {
    this.timer += dt;
    const amount = this.clamp(this.timer / this.PROJECTILE_GROW_SEC, 0, 1);
    const projectileScale = amount;
    this.projectileTransform.scale = new APJS.Vector2f(projectileScale, projectileScale);
    if (amount >= 1) {
      this.phase = "castHold";
      this.timer = 0;
    }
  }

  private tickProjectileFlight(): void {
    const position = this.projectileBody.position;
    const positionX = position.x * 32;
    const positionY = position.y * 32;
    if (positionX < -360 || positionX > 360 || positionY < -640 || positionY > 640) {
      const halfImpactWidth = this.impactTransform.sizeDelta.x * 0.5;
      const halfImpactHeight = this.impactTransform.sizeDelta.y * 0.5;
      this.projectileHitPoint = new APJS.Vector2f(
        this.clamp(positionX, -360 + halfImpactWidth, 360 - halfImpactWidth),
        this.clamp(positionY, -640 + halfImpactHeight, 640 - halfImpactHeight),
      );
      this.applyImpact(null);
      return;
    }
    const velocity = this.projectileBody.velocity;
    const remainingX = this.victimEnd.x - position.x * 32;
    const remainingY = this.victimEnd.y - position.y * 32;
    const remainingDistance = Math.sqrt(remainingX * remainingX + remainingY * remainingY);
    const speedPixelsPerSec = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y) * 32;
    const leadSec = Math.min(this.HIT_SOUND_LEAD_SEC, Math.max(0.01, this.config.flightSec * 0.25));
    const nearImpactDistance = speedPixelsPerSec * leadSec;
    if (!this.hitSoundPlayed && remainingDistance <= nearImpactDistance) {
      this.sound.playWaterHit();
      this.hitSoundPlayed = true;
    }
  }

  private reflectProjectile(): void {
    const base = this.randomInt(this.config.minDamage, this.config.maxDamage);
    const critical = true;
    const criticalDamage = base * this.config.critMultiplier;
    this.reflectedDamage = Math.round(criticalDamage * this.botCharacter.getDamageMultiplier());
    this.reflectedCritical = true;
    this.attackFromPlayer = true;
    this.victimEnd = this.screenCenter(this.botTransform);
    const incomingVelocity = this.projectileBody.velocity;
    this.projectileBody.velocity = new APJS.Vector2f(-incomingVelocity.x, -incomingVelocity.y);
    this.hitSoundPlayed = false;
    const counterEvent = APJS.EventManager.createEvent(this.damageEventType);
    counterEvent.args = [{target: "player", critical: false, fullCounter: true}];
    APJS.EventManager.getGlobalEmitter().emit(counterEvent);
    console.log("[Parry] Reflected waterball; return damage " + String(this.reflectedDamage) + ".");
  }

  private applyImpact(target: APJS.SceneObject | null): void {
    if (this.phase !== "fly") return;
    this.projectileBody.velocity = new APJS.Vector2f(0, 0);
    this.projectileBody.angularVelocity = 0;
    this.setProjectileTrail(false);
    this.projectileObj.setEnabledInHierarchy(false);
    if (!this.hitSoundPlayed) {
      this.sound.playWaterHit();
      this.hitSoundPlayed = true;
    }
    this.impactTransform.anchoredPosition = new APJS.Vector2f(
      this.projectileHitPoint.x,
      this.projectileHitPoint.y,
    );
    this.impactTransform.scale = new APJS.Vector2f(1, 1);
    this.impactObj.setEnabledInHierarchy(true);
    this.impactVisible = true;
    this.animation.playImpact();
    this.animation.playIdle(this.attackFromPlayer);

    const hitPlayer = target === this.playerObj;
    const hitBot = target === this.botObj;
    if (hitPlayer && this.blockActive && !this.attackFromPlayer) {
      const blockedEvent = APJS.EventManager.createEvent(this.damageEventType);
      blockedEvent.args = [{target: "player", critical: false, blocked: true}];
      APJS.EventManager.getGlobalEmitter().emit(blockedEvent);
      this.counterAttackPending = true;
      this.phase = "blockedHold";
      return;
    }

    let targetHp = 0;
    if (hitPlayer || hitBot) {
      const reflected = hitBot && this.reflectedDamage >= 0;
      const base = reflected ? 0 : this.randomInt(this.config.minDamage, this.config.maxDamage);
      const critical = reflected ? this.reflectedCritical : Math.random() < this.config.critRate;
      const criticalDamage = critical ? base * this.config.critMultiplier : base;
      const attackerMultiplier = this.attackFromPlayer
        ? this.playerCharacter.getDamageMultiplier() * this.playerCounterDamageMultiplier
        : this.botCharacter.getDamageMultiplier();
      const damage = reflected ? this.reflectedDamage : Math.round(criticalDamage * attackerMultiplier);
      if (this.attackFromPlayer) this.playerCounterDamageMultiplier = 1;
      if (reflected) this.reflectedDamage = -1;
      const damageEvent = APJS.EventManager.createEvent(this.damageEventType);
      damageEvent.args = [{target: hitPlayer ? "player" : "bot", critical: critical}];
      APJS.EventManager.getGlobalEmitter().emit(damageEvent);
      if (damage > 0 && hitBot && this.attackFromPlayer) {
        this.staminaRecoveryAmount = 1;
      } else if (damage > 0 && hitPlayer && !this.attackFromPlayer) {
        this.staminaRecoveryAmount = 2;
      }
      if (hitPlayer) {
        this.playerCharacter.applyDamage(damage);
        targetHp = this.playerCharacter.getHp();
      } else {
        this.botCharacter.applyDamage(damage);
        targetHp = this.botCharacter.getHp();
      }
    }

    this.timer = 0;
    if ((hitPlayer && targetHp <= 0) || (hitBot && targetHp <= 0)) {
      this.actionButtonsActive = false;
      this.ui.setActionButtonsState(false, this.playerStamina.getCurrentStamina());
      this.sound.stopBlockLoop();
      const playerWon = hitBot;
      this.blockActive = false;
      this.animation.playDead(!playerWon);
      const winnerHp = playerWon ? this.playerCharacter.getHp() : this.botCharacter.getHp();
      const winnerHpPercent = Math.round((winnerHp / this.config.maxHp) * 100);
      this.resultText = playerWon
        ? "PLAYER WINS!\nTURN " + String(this.turn)
        : "BOT WINS!\nTURN " + String(this.turn);
      this.resultHpTargetPercent = winnerHpPercent;
      this.ui.setRetryVisible(false);
      this.phase = "death";

      return;
    }
    this.actionButtonsActive = false;
    this.blockActive = false;
    this.blockTimer = 0;
    this.sound.stopBlockLoop();
    this.ui.setActionButtonsState(false, this.playerStamina.getCurrentStamina());
    this.phase = "impact";
  }

  private beginPlayerCounterAttack(damageMultiplier: number = 1): void {
    if (this.impactVisible) {
      this.impactObj.setEnabledInHierarchy(false);
      this.impactVisible = false;
    }
    this.actionButtonsActive = false;
    this.ui.setActionButtonsState(false, this.playerStamina.getCurrentStamina());
    this.attackFromPlayer = true;
    this.playerCounterDamageMultiplier = damageMultiplier;
    this.hitSoundPlayed = false;
    this.animation.playIdle(false);
    const attackerCenter = this.screenCenter(this.playerTransform);
    const attackerSize = this.playerTransform.sizeDelta;
    this.attackerStart = new APJS.Vector2f(
      attackerCenter.x + Math.max(0, attackerSize.x * 0.5 - 30),
      attackerCenter.y + attackerSize.y * 0.2,
    );
    this.victimEnd = this.screenCenter(this.botTransform);
    this.animation.playAttack(true);
    this.phase = "windup";
    this.timer = 0;
  }

  private finishImpact(): void {
    this.attackFromPlayer = false;
    this.playerCounterDamageMultiplier = 1;
    this.impactObj.setEnabledInHierarchy(false);
    this.impactVisible = false;
    this.turn += 1;
    const staminaBeforeRecovery = this.playerStamina.getCurrentStamina();
    const staminaRecoveryAmount = this.staminaRecoveryAmount;
    this.staminaRecoveryAmount = 0;
    const staminaAfterRecovery = this.playerStamina.recoverForTurn(staminaRecoveryAmount);
    const staminaGained = staminaAfterRecovery - staminaBeforeRecovery;
    this.ui.setStamina(staminaAfterRecovery);
    if (staminaGained > 0) {
      const staminaEvent = APJS.EventManager.createEvent(this.damageEventType);
      staminaEvent.args = [{target: "player", critical: false, staminaGain: staminaGained}];
      APJS.EventManager.getGlobalEmitter().emit(staminaEvent);
    }
    this.startPreparation();
  }

  private tickDeath(dt: number): void {
    this.timer += dt;
    if (this.impactVisible && this.timer >= this.TURN_END_DELAY_SEC) {
      this.impactObj.setEnabledInHierarchy(false);
      this.impactVisible = false;
    }
    const resultDelay = Math.max(this.DEAD_ANIMATION_SEC, this.TURN_END_DELAY_SEC);
    if (this.timer >= resultDelay) {
      this.ui.showResult(this.resultText, this.resultHpTargetPercent);
      this.phase = "resultTween";

    }
  }

  private screenCenter(transform: APJS.ScreenTransform): APJS.Vector2f {
    const pos = transform.anchoredPosition;
    const size = transform.sizeDelta;
    const pivot = transform.pivot;
    return new APJS.Vector2f(
      pos.x + size.x * (0.5 - pivot.x),
      pos.y + size.y * (0.5 - pivot.y),
    );
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }
}
