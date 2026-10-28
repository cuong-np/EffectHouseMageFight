@component()
export class AnimationManager extends APJS.BasicScriptComponent {
  @header("Animation Textures")
  @serializeProperty
  @tooltip("Idle loop used by both fighters.")
  idleTex!: APJS.Texture;

  @serializeProperty
  @tooltip("Attack animation used by the active fighter.")
  attackTex!: APJS.Texture;

  @serializeProperty
  @tooltip("Looping defense animation used while the player is blocking.")
  defendLoopTex!: APJS.Texture;

  @serializeProperty
  @tooltip("One-shot frame animation played when the player parries.")
  parryTex!: APJS.Texture;

  @serializeProperty
  @tooltip("One-shot animation used when a fighter is defeated.")
  deadTex!: APJS.Texture;


  @serializeProperty
  @tooltip("WaterBall animation shown during a projectile launch.")
  projectileTex!: APJS.Texture;

  @serializeProperty
  @tooltip("Splash animation shown when a projectile hits.")
  impactTex!: APJS.Texture;

  @serializeSceneObjectFlag @header("Animation Targets")
  @serializeProperty
  playerObj!: APJS.SceneObject;

  @serializeSceneObjectFlag @serializeProperty
  botObj!: APJS.SceneObject;

  @serializeSceneObjectFlag @serializeProperty
  projectileObj!: APJS.SceneObject;

  @serializeSceneObjectFlag @serializeProperty
  impactObj!: APJS.SceneObject;

  private ready: boolean = false;
  private playerImage!: APJS.Image;
  private botImage!: APJS.Image;
  private projectileImage!: APJS.Image;
  private impactImage!: APJS.Image;

  onStart(): void {
    if (!this.idleTex || !this.attackTex || !this.parryTex || !this.deadTex ||
        !this.projectileTex || !this.impactTex || !this.playerObj || !this.botObj ||
        !this.projectileObj || !this.impactObj) {
      console.error("[AnimationManager] One or more animation references are missing.");
      return;
    }
    this.playerImage = this.playerObj.getComponent("Image") as APJS.Image;
    this.botImage = this.botObj.getComponent("Image") as APJS.Image;
    this.projectileImage = this.projectileObj.getComponent("Image") as APJS.Image;
    this.impactImage = this.impactObj.getComponent("Image") as APJS.Image;
    this.ready = !!this.playerImage && !!this.botImage && !!this.projectileImage && !!this.impactImage;
    if (!this.ready) {
      console.error("[AnimationManager] An animation target is missing its Image component.");
    }
  }

  public playIdle(isPlayer: boolean): void {
    if (this.ready) this.playGif(isPlayer ? this.playerImage : this.botImage, this.idleTex);
  }

  public playAttack(isPlayer: boolean): void {
    if (this.ready) this.playGif(isPlayer ? this.playerImage : this.botImage, this.attackTex);
  }

  public playDefendLoop(isPlayer: boolean): void {
    if (!this.ready || !this.defendLoopTex) return;
    const image = isPlayer ? this.playerImage : this.botImage;
    image.texture = this.defendLoopTex;
    const provider = this.defendLoopTex.getControl() as APJS.GifTextureProvider;
    provider.loopCount = -1;
    provider.playFromStart();
  }

  public playParry(): void {
    if (!this.ready || !this.parryTex) return;
    this.playerImage.texture = this.parryTex;
    const provider = this.parryTex.getControl() as APJS.AnimatedTextureProvider;
    provider.reset();
  }

  public playDead(isPlayer: boolean): void {
    if (this.ready) this.playGif(isPlayer ? this.playerImage : this.botImage, this.deadTex);
  }

  public playProjectile(): void {
    if (this.ready) this.playGif(this.projectileImage, this.projectileTex);
  }

  public playImpact(): void {
    if (this.ready) this.playGif(this.impactImage, this.impactTex);
  }

  private playGif(image: APJS.Image, texture: APJS.Texture): void {
    image.texture = texture;
    const provider = texture.getControl() as APJS.GifTextureProvider;
    provider.playFromStart();
  }
}
