@component()
export class DamagePopupManager extends APJS.BasicScriptComponent {
  @header("Advanced — Scene Wiring")
  @serializeProperty
  @tooltip("Player health fill; a decrease triggers the player's damage popup.")
  private playerHealthFill!: APJS.Image;

  @serializeProperty
  @tooltip("Bot health fill; a decrease triggers the bot's damage popup.")
  private botHealthFill!: APJS.Image;

  @serializeSceneObjectFlag @serializeProperty
  @tooltip("Hidden Text object positioned above the player.")
  private playerPopup!: APJS.SceneObject;

  @serializeProperty
  @tooltip("Text component used for the player's damage number.")
  private playerText!: APJS.Text;

  @serializeProperty
  @tooltip("ScreenTransform used to animate the player's damage number.")
  private playerPopupTransform!: APJS.ScreenTransform;

  @serializeSceneObjectFlag @serializeProperty
  @tooltip("Hidden Text object positioned above the bot.")
  private botPopup!: APJS.SceneObject;

  @serializeProperty
  @tooltip("Text component used for the bot's damage number.")
  private botText!: APJS.Text;

  @serializeProperty
  @tooltip("ScreenTransform used to animate the bot's damage number.")
  private botPopupTransform!: APJS.ScreenTransform;

  @serializeSceneObjectFlag @serializeProperty
  @tooltip("Hidden +stamina popup above the stamina HUD.")
  private staminaGainPopup!: APJS.SceneObject;

  @serializeProperty
  @tooltip("Text component for the stamina gain popup.")
  private staminaGainPopupText!: APJS.Text;

  @serializeProperty
  @tooltip("ScreenTransform used to animate the stamina gain popup.")
  private staminaGainPopupTransform!: APJS.ScreenTransform;

  @serializeSceneObjectFlag @serializeProperty
  @tooltip("Sound manager that plays the stamina gain chime.")
  private soundManagerObj!: APJS.SceneObject;

  private static readonly MAX_HP: number = 100;
  private static readonly POPUP_DURATION_SEC: number = 1;
  private static readonly RISE_DISTANCE_PX: number = 44;
  private static readonly NORMAL_FONT_SIZE: number = 46;
  private static readonly CRIT_FONT_SIZE: number = 64;

  private soundManager!: any;
  private damageEventType!: APJS.UserEventType;
  private pendingPlayerCrit: boolean = false;
  private pendingBotCrit: boolean = false;

  private playerPreviousFill: number = 1;
  private botPreviousFill: number = 1;
  private playerBaseX: number = 0;
  private playerBaseY: number = 155;
  private botBaseX: number = 0;
  private botBaseY: number = 155;
  private playerPopupElapsed: number = -1;
  private botPopupElapsed: number = -1;
  private staminaPopupElapsed: number = -1;
  private staminaBaseX: number = 0;
  private staminaBaseY: number = 0;

  private onDamageApplied = (event: APJS.IEvent): void => {
    const hit = event.args[0] as {target: string; critical: boolean; blocked?: boolean; miss?: boolean; fullCounter?: boolean; staminaGain?: number};
    if (hit.target === "player" && hit.staminaGain && hit.staminaGain > 0) {
      this.showStaminaGainPopup(hit.staminaGain);
      return;
    }
    if (hit.target === "player" && hit.fullCounter) {
      this.pendingPlayerCrit = false;
      this.showFullCounterPopup();
      return;
    }
    if (hit.target === "player" && hit.miss) {
      this.pendingPlayerCrit = false;
      this.showMissPopup();
      return;
    }
    if (hit.target === "player" && hit.blocked) {
      this.pendingPlayerCrit = false;
      this.showBlockedPopup();
      return;
    }
    if (hit.target === "player") {
      this.pendingPlayerCrit = hit.critical;
    } else if (hit.target === "bot") {
      this.pendingBotCrit = hit.critical;
    }
  };

  onStart(): void {
    if (!this.staminaGainPopup || !this.staminaGainPopupText || !this.staminaGainPopupTransform || !this.soundManagerObj) {
      console.error("[DamagePopupManager] Stamina popup or SoundManager references are missing.");
      return;
    }
    this.soundManager = this.soundManagerObj.getComponent("SoundManager") as any;
    if (!this.soundManager) {
      console.error("[DamagePopupManager] SoundManager component is missing.");
      return;
    }
    this.playerPreviousFill = this.readFill(this.playerHealthFill);
    this.botPreviousFill = this.readFill(this.botHealthFill);

    const playerPosition = this.playerPopupTransform.anchoredPosition;
    this.playerBaseX = playerPosition.x;
    this.playerBaseY = playerPosition.y;
    const botPosition = this.botPopupTransform.anchoredPosition;
    this.botBaseX = botPosition.x;
    this.botBaseY = botPosition.y;
    const staminaPosition = this.staminaGainPopupTransform.anchoredPosition;
    this.staminaBaseX = staminaPosition.x;
    this.staminaBaseY = staminaPosition.y;

    this.playerPopup.setEnabledInHierarchy(false);
    this.botPopup.setEnabledInHierarchy(false);
    this.staminaGainPopup.setEnabledInHierarchy(false);
    this.playerText.text = "";
    this.staminaGainPopupText.text = "";
    this.botText.text = "";
    this.damageEventType = APJS.EventManager.defineUserEventType("battle.damage_popup");
    APJS.EventManager.getGlobalEmitter().on(this.damageEventType, this.onDamageApplied, this);
  }

  onDestroy(): void {
    APJS.EventManager.getGlobalEmitter().off(this.damageEventType, this.onDamageApplied, this);
  }

  onLateUpdate(deltaTime: number): void {
    const playerFill = this.readFill(this.playerHealthFill);
    const botFill = this.readFill(this.botHealthFill);

    const playerDamage = Math.round((this.playerPreviousFill - playerFill) * DamagePopupManager.MAX_HP);
    if (playerDamage > 0) {
      this.showPopup(playerDamage, this.playerPopup, this.playerText, this.playerPopupTransform, this.playerBaseX, this.playerBaseY, this.pendingPlayerCrit);
      this.pendingPlayerCrit = false;
    }

    const botDamage = Math.round((this.botPreviousFill - botFill) * DamagePopupManager.MAX_HP);
    if (botDamage > 0) {
      this.showPopup(botDamage, this.botPopup, this.botText, this.botPopupTransform, this.botBaseX, this.botBaseY, this.pendingBotCrit);
      this.pendingBotCrit = false;
    }

    this.playerPreviousFill = playerFill;
    this.botPreviousFill = botFill;

    this.playerPopupElapsed = this.advancePopup(
      deltaTime, this.playerPopupElapsed, this.playerPopup, this.playerPopupTransform, this.playerBaseX, this.playerBaseY
    );
    this.botPopupElapsed = this.advancePopup(
      deltaTime, this.botPopupElapsed, this.botPopup, this.botPopupTransform, this.botBaseX, this.botBaseY
    );
    this.staminaPopupElapsed = this.advancePopup(
      deltaTime, this.staminaPopupElapsed, this.staminaGainPopup, this.staminaGainPopupTransform,
      this.staminaBaseX, this.staminaBaseY
    );
  }

  private readFill(image: APJS.Image): number {
    const value = image.getMaterialProperty("_filledRange");
    return typeof value === "number" ? value : 1;
  }

  private showPopup(
    damage: number,
    popup: APJS.SceneObject,
    text: APJS.Text,
    transform: APJS.ScreenTransform,
    baseX: number,
    baseY: number,
    isCrit: boolean
  ): void {
    text.text = "-" + damage.toString();
    text.color = isCrit
      ? new APJS.Color(1, 0.52, 0.02, 1)
      : new APJS.Color(1, 1, 1, 1);
    text.fontSize = isCrit
      ? DamagePopupManager.CRIT_FONT_SIZE
      : DamagePopupManager.NORMAL_FONT_SIZE;
    text.opacity = 1;
    transform.anchoredPosition = new APJS.Vector2f(baseX, baseY);
    popup.setEnabledInHierarchy(true);

    if (popup === this.playerPopup) {
      this.playerPopupElapsed = 0;
    } else {
      this.botPopupElapsed = 0;
    }
  }

  private showStaminaGainPopup(amount: number): void {
    this.staminaGainPopupText.text = "+" + String(amount);
    this.staminaGainPopupText.color = new APJS.Color(0.35, 1, 0.4, 1);
    this.staminaGainPopupText.fontSize = DamagePopupManager.NORMAL_FONT_SIZE;
    this.staminaGainPopupText.opacity = 1;
    this.staminaGainPopupTransform.anchoredPosition = new APJS.Vector2f(this.staminaBaseX, this.staminaBaseY);
    this.staminaGainPopup.setEnabledInHierarchy(true);
    this.soundManager.playStaminaGainChime();
    this.staminaPopupElapsed = 0;
  }

  private showFullCounterPopup(): void {
    this.playerText.text = "FULL COUNTER";
    this.playerText.color = new APJS.Color(1, 0.78, 0.15, 1);
    this.playerText.fontSize = 32;
    this.playerText.opacity = 1;
    this.playerPopupTransform.anchoredPosition = new APJS.Vector2f(this.playerBaseX, this.playerBaseY);
    this.playerPopup.setEnabledInHierarchy(true);
    this.playerPopupElapsed = 0;
  }

  private showMissPopup(): void {
    this.playerText.text = "MISS";
    this.playerText.color = new APJS.Color(0.55, 0.9, 1, 1);
    this.playerText.fontSize = DamagePopupManager.NORMAL_FONT_SIZE;
    this.playerText.opacity = 1;
    this.playerPopupTransform.anchoredPosition = new APJS.Vector2f(this.playerBaseX, this.playerBaseY);
    this.playerPopup.setEnabledInHierarchy(true);
    this.playerPopupElapsed = 0;
  }

  private showBlockedPopup(): void {
    this.playerText.text = "BLOCKED";
    this.playerText.color = new APJS.Color(0.35, 0.9, 1, 1);
    this.playerText.fontSize = DamagePopupManager.NORMAL_FONT_SIZE;
    this.playerText.opacity = 1;
    this.playerPopupTransform.anchoredPosition = new APJS.Vector2f(this.playerBaseX, this.playerBaseY);
    this.playerPopup.setEnabledInHierarchy(true);
    this.playerPopupElapsed = 0;
  }

  private advancePopup(
    deltaTime: number,
    elapsed: number,
    popup: APJS.SceneObject,
    transform: APJS.ScreenTransform,
    baseX: number,
    baseY: number
  ): number {
    if (elapsed < 0) {
      return -1;
    }

    elapsed += deltaTime;
    const progress = Math.min(elapsed / DamagePopupManager.POPUP_DURATION_SEC, 1);
    const eased = 1 - (1 - progress) * (1 - progress);
    transform.anchoredPosition = new APJS.Vector2f(
      baseX,
      baseY + DamagePopupManager.RISE_DISTANCE_PX * eased
    );

    if (elapsed >= DamagePopupManager.POPUP_DURATION_SEC) {
      popup.setEnabledInHierarchy(false);
      transform.anchoredPosition = new APJS.Vector2f(baseX, baseY);
      return -1;
    }

    return elapsed;
  }
}