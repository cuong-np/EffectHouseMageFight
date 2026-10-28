@component()
export class SoundManager extends APJS.BasicScriptComponent {
  @header("Battle Sound Wiring")
  @serializeProperty
  @tooltip("One-shot sound when the WaterBall launches.")
  projectileSpawnAudio!: APJS.AudioComponent;

  @serializeProperty
  @tooltip("One-shot WaterBall hit sound.")
  waterHitAudio!: APJS.AudioComponent;


  @serializeProperty
  @tooltip("Short chime used while the winner HP percentage counts.")
  resultChimeAudio!: APJS.AudioComponent;

  @serializeProperty
  @tooltip("One-shot sound played when the player regains stamina.")
  staminaGainAudio!: APJS.AudioComponent;

  @serializeProperty
  @tooltip("Looping dark-magic sound played for the duration of the player Block state.")
  blockLoopAudio!: APJS.AudioComponent;

  private ready: boolean = false;
  private blockLoopPlaying: boolean = false;

  onStart(): void {
    this.ready = !!this.projectileSpawnAudio && !!this.waterHitAudio &&
      !!this.resultChimeAudio && !!this.staminaGainAudio && !!this.blockLoopAudio;
    if (!this.ready) {
      console.error("[SoundManager] One or more audio references are missing.");
    }
  }

  public playProjectileSpawn(): void {
    if (this.ready) this.projectileSpawnAudio.play();
  }

  public playWaterHit(): void {
    if (this.ready) this.waterHitAudio.play();
  }

  public playResultChime(): void {
    if (this.ready) this.resultChimeAudio.play();
  }

  public playStaminaGainChime(): void {
    if (this.ready) this.staminaGainAudio.play();
  }

  public startBlockLoop(): void {
    if (!this.ready || this.blockLoopPlaying) return;
    this.blockLoopAudio.play();
    this.blockLoopPlaying = true;
  }

  public stopBlockLoop(): void {
    if (!this.blockLoopPlaying) return;
    this.blockLoopAudio.stop();
    this.blockLoopPlaying = false;
  }

  onDestroy(): void {
    this.stopBlockLoop();
  }
}
