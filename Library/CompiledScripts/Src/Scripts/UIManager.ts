@component()
export class UIManager extends APJS.BasicScriptComponent {
  @serializeSceneObjectFlag @header("UI Scene Wiring")
  @serializeProperty
  @tooltip("Sound manager used for result percentage chimes.")
  soundManagerObj!: APJS.SceneObject;


  @serializeSceneObjectFlag @serializeProperty
  @tooltip("Current turn label.")
  turnObj!: APJS.SceneObject;

  @serializeSceneObjectFlag @serializeProperty
  @tooltip("Retry button shown after the result animation.")
  retryObj!: APJS.SceneObject;

  @serializeSceneObjectFlag @serializeProperty
  @tooltip("Button used to start the next turn.")
  fightNowObj!: APJS.SceneObject;

  @serializeSceneObjectFlag @serializeProperty
  @tooltip("Dodge action button.")
  dodgeObj!: APJS.SceneObject;

  @serializeSceneObjectFlag @serializeProperty
  @tooltip("Block action button.")
  blockObj!: APJS.SceneObject;

  @serializeSceneObjectFlag @serializeProperty
  @tooltip("Parry action button.")
  parryObj!: APJS.SceneObject;

  @serializeSceneObjectFlag @serializeProperty
  @tooltip("Overlay that dims the Dodge button and all of its child UI when unavailable.")
  dodgeDisabledOverlayObj!: APJS.SceneObject;

  @serializeSceneObjectFlag @serializeProperty
  @tooltip("Overlay that dims the Block button and all of its child UI when unavailable.")
  blockDisabledOverlayObj!: APJS.SceneObject;

  @serializeSceneObjectFlag @serializeProperty
  @tooltip("Overlay that dims the Parry button and all of its child UI when unavailable.")
  parryDisabledOverlayObj!: APJS.SceneObject;

  @serializeSceneObjectFlag @serializeProperty
  @tooltip("Winner HP label shown in the result state.")
  resultHpLabelObj!: APJS.SceneObject;

  @serializeSceneObjectFlag @serializeProperty
  @tooltip("Animated winner HP percentage label.")
  resultHpPercentObj!: APJS.SceneObject;

  @serializeSceneObjectFlag @serializeProperty
  @tooltip("Text object that displays the player's current stamina.")
  staminaTextObj!: APJS.SceneObject;


  private static readonly RESULT_CHIME_STEP: number = 1;
  private ready: boolean = false;
  private retryVisible: boolean = false;
  private fightNowVisible: boolean = false;
  private resultTweenActive: boolean = false;
  private resultTweenTimer: number = 0;
  private resultTargetPercent: number = 0;
  private lastChimePercent: number = 100;
  private resultCompleteType!: APJS.UserEventType;
  private turnLabel!: APJS.Text;
  private retryImage!: APJS.Image;
  private fightNowImage!: APJS.Image;
  private dodgeImage!: APJS.Image;
  private blockImage!: APJS.Image;
  private parryImage!: APJS.Image;
  private actionButtonsActive: boolean = false;
  private actionStamina: number = 0;
  private resultHpPercentText!: APJS.Text;
  private staminaText!: APJS.Text;
  private sound!: any;

  onStart(): void {
    if (!this.turnObj || !this.retryObj || !this.fightNowObj ||
        !this.dodgeObj || !this.blockObj || !this.parryObj ||
        !this.dodgeDisabledOverlayObj || !this.blockDisabledOverlayObj || !this.parryDisabledOverlayObj ||
        !this.resultHpPercentObj || !this.staminaTextObj || !this.soundManagerObj) {
      console.error("[UIManager] One or more UI references are missing.");
      return;
    }
    this.turnLabel = this.turnObj.getComponent("Text") as APJS.Text;
    this.retryImage = this.retryObj.getComponent("Image") as APJS.Image;
    this.fightNowImage = this.fightNowObj.getComponent("Image") as APJS.Image;
    this.dodgeImage = this.dodgeObj.getComponent("Image") as APJS.Image;
    this.blockImage = this.blockObj.getComponent("Image") as APJS.Image;
    this.parryImage = this.parryObj.getComponent("Image") as APJS.Image;
    this.resultHpPercentText = this.resultHpPercentObj.getComponent("Text") as APJS.Text;
    this.staminaText = this.staminaTextObj.getComponent("Text") as APJS.Text;
    this.sound = this.soundManagerObj.getComponent("SoundManager") as any;
    if (!this.turnLabel || !this.retryImage || !this.fightNowImage ||
        !this.dodgeImage || !this.blockImage || !this.parryImage ||
        !this.resultHpPercentText || !this.staminaText || !this.sound) {
      console.error("[UIManager] A wired UI object is missing its required component.");
      return;
    }
    this.resultCompleteType = APJS.EventManager.defineUserEventType("battle.ui.result_complete");
    this.ready = true;
    this.setActionButtonsState(false, 0);
  }

  public isRetryButtonAt(position: APJS.Vector2f): boolean {
    return this.ready && this.retryVisible && APJS.TouchUtils.isScreenPointOnImage(position, this.retryImage);
  }

  public isFightNowButtonAt(position: APJS.Vector2f): boolean {
    return this.ready && this.fightNowVisible && APJS.TouchUtils.isScreenPointOnImage(position, this.fightNowImage);
  }

  public isDodgeButtonAt(position: APJS.Vector2f): boolean {
    return this.ready && this.actionButtonsActive && this.actionStamina >= 1 &&
      APJS.TouchUtils.isScreenPointOnImage(position, this.dodgeImage);
  }

  public isBlockButtonAt(position: APJS.Vector2f): boolean {
    return this.ready && this.actionButtonsActive && this.actionStamina >= 3 &&
      APJS.TouchUtils.isScreenPointOnImage(position, this.blockImage);
  }

  public isParryButtonAt(position: APJS.Vector2f): boolean {
    return this.ready && this.actionButtonsActive && this.actionStamina >= 2 &&
      APJS.TouchUtils.isScreenPointOnImage(position, this.parryImage);
  }

  public setActionButtonsState(active: boolean, stamina: number): void {
    if (!this.ready) return;
    this.actionButtonsActive = active;
    this.actionStamina = Math.max(0, stamina);
    const dodgeAvailable = active && this.actionStamina >= 1;
    const blockAvailable = active && this.actionStamina >= 3;
    const parryAvailable = active && this.actionStamina >= 2;
    this.dodgeImage.opacity = 1;
    this.blockImage.opacity = 1;
    this.parryImage.opacity = 1;
    this.dodgeDisabledOverlayObj.setEnabledInHierarchy(!dodgeAvailable);
    this.blockDisabledOverlayObj.setEnabledInHierarchy(!blockAvailable);
    this.parryDisabledOverlayObj.setEnabledInHierarchy(!parryAvailable);
  }

  public setStamina(value: number): void {
    if (this.ready) this.staminaText.text = String(value);
  }

  public setTurn(turn: number): void {
    if (!this.ready) return;
    this.turnLabel.text = "Turn " + String(turn);
    this.turnLabel.fontSize = 45.139;
  }

  public setFightNowVisible(visible: boolean): void {
    if (!this.ready) return;
    this.fightNowVisible = visible;
    this.fightNowObj.setEnabledInHierarchy(visible);
  }

  public setRetryVisible(visible: boolean): void {
    if (!this.ready) return;
    this.retryVisible = visible;
    this.retryObj.setEnabledInHierarchy(visible);
  }

  public resetResult(): void {
    if (!this.ready) return;
    this.resultTweenActive = false;
    this.resultTweenTimer = 0;
    this.resultTargetPercent = 0;
    this.lastChimePercent = 100;
    this.resultHpPercentText.text = "100%";
    if (this.resultHpLabelObj) this.resultHpLabelObj.setEnabledInHierarchy(false);
    this.resultHpPercentObj.setEnabledInHierarchy(false);
    this.setRetryVisible(false);
  }

  public showResult(winnerText: string, hpPercent: number): void {
    if (!this.ready) return;
    this.turnLabel.text = winnerText;
    this.turnLabel.fontSize = 30;
    if (this.resultHpLabelObj) this.resultHpLabelObj.setEnabledInHierarchy(true);
    this.resultHpPercentText.text = "100%";
    this.resultHpPercentObj.setEnabledInHierarchy(true);
    this.resultTargetPercent = Math.max(0, Math.min(100, hpPercent));
    this.resultTweenTimer = 0;
    this.lastChimePercent = 100;
    this.resultTweenActive = true;
    this.setRetryVisible(false);
  }

  onUpdate(dt: number): void {
    if (!this.ready || !this.resultTweenActive) return;
    this.resultTweenTimer = Math.min(3, this.resultTweenTimer + Math.max(0, dt));
    const progress = this.resultTweenTimer / 3;
    const eased = progress * progress * (3 - 2 * progress);
    const shownPercent = Math.round(100 + (this.resultTargetPercent - 100) * eased);
    const value = String(shownPercent) + "%";
    if (this.resultHpPercentText.text !== value) {
      this.resultHpPercentText.text = value;
      if (this.lastChimePercent - shownPercent >= UIManager.RESULT_CHIME_STEP) {
        this.sound.playResultChime();
        this.lastChimePercent = shownPercent;
      }
    }
    if (progress >= 1) {
      this.resultHpPercentText.text = String(this.resultTargetPercent) + "%";
      if (this.lastChimePercent !== this.resultTargetPercent) {
        this.sound.playResultChime();
        this.lastChimePercent = this.resultTargetPercent;
      }
      this.resultTweenActive = false;
      this.setRetryVisible(true);
      const event = APJS.EventManager.createEvent(this.resultCompleteType);
      APJS.EventManager.getGlobalEmitter().emit(event);
    }
  }
}
