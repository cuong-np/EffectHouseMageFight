@component()
export class MageHitReaction extends APJS.BasicScriptComponent {
  @header("Theme & Assets")
  @serializeProperty
  @tooltip("One-shot animation shown when a Mage takes nonlethal damage.")
  private hitTex: APJS.Texture;


  @serializeProperty
  @tooltip("Idle animation restored after the hit reaction.")
  private idleTex: APJS.Texture;

  @header("Gameplay Tuning")
  @serializeProperty
  @tooltip("Seconds to show the hit reaction before returning to idle.")
  @slider(0.25, 1.5, 0.05)
  private hitDurationSec: number = 0.9;

  @header("Advanced — Scene Wiring")
  @serializeProperty
  @tooltip("Player Mage Image component.")
  private playerImage: APJS.Image;

  @serializeProperty
  @tooltip("Bot Mage Image component.")
  private botImage: APJS.Image;

  @serializeProperty
  @tooltip("Player health-fill Image, configured as Filled.")
  private playerHealthFill: APJS.Image;

  @serializeProperty
  @tooltip("Bot health-fill Image, configured as Filled.")
  private botHealthFill: APJS.Image;

  private ready = false;
  private hitProvider!: APJS.GifTextureProvider;
  private previousPlayerFill = 1;
  private previousBotFill = 1;
  private playerHitRemaining = 0;
  private botHitRemaining = 0;

  onLateUpdate(deltaTime: number): void {
    if (!this.ready) {
      if (!this.hitTex || !this.idleTex || !this.playerImage || !this.botImage ||
          !this.playerHealthFill || !this.botHealthFill) {
        return;
      }

      this.hitProvider = this.hitTex.getControl() as APJS.GifTextureProvider;
      this.previousPlayerFill = this.readHealth(this.playerHealthFill, 1);
      this.previousBotFill = this.readHealth(this.botHealthFill, 1);
      this.ready = true;
    }

    this.updateMage(this.playerImage, this.playerHealthFill, true, deltaTime);
    this.updateMage(this.botImage, this.botHealthFill, false, deltaTime);
  }

  private readHealth(fill: APJS.Image, fallback: number): number {
    const value = fill.getMaterialProperty("_filledRange");
    if (typeof value !== "number") return fallback;
    return Math.max(0, Math.min(1, value));
  }

  private updateMage(sprite: APJS.Image, fill: APJS.Image, isPlayer: boolean, deltaTime: number): void {
    const previous = isPlayer ? this.previousPlayerFill : this.previousBotFill;
    const current = this.readHealth(fill, previous);
    let remaining = isPlayer ? this.playerHitRemaining : this.botHitRemaining;

    if (current < previous - 0.001) {
      if (current > 0) {
        sprite.texture = this.hitTex;
        this.hitProvider.playFromStart();
        remaining = Math.max(0.25, Math.min(1.5, this.hitDurationSec));
      } else if (current <= 0) {
        // The existing BattleManager owns the fatal-hit death animation.
        remaining = 0;
      } else {
        remaining = 0;
      }
    }

    if (remaining > 0) {
      remaining = Math.max(0, remaining - deltaTime);
      if (remaining === 0 && current > 0) {
        const displayed = sprite.texture;
        if (displayed && displayed.name === this.hitTex.name) {
          sprite.texture = this.idleTex;
        }
      }
    }

    if (isPlayer) {
      this.previousPlayerFill = current;
      this.playerHitRemaining = remaining;
    } else {
      this.previousBotFill = current;
      this.botHitRemaining = remaining;
    }
  }
}
