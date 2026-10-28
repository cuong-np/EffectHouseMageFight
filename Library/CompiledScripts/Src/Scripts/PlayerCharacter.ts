@component()
export class PlayerCharacter extends APJS.BasicScriptComponent {
  @serializeSceneObjectFlag @header("Shared Character")
  @serializeProperty
  @tooltip("Mage_Player scene object containing the shared Character component.")
  characterObj!: APJS.SceneObject;

  private sharedCharacter!: any;
  private characterImage!: APJS.Image;
  private dodgeFadeElapsed: number = -1;
  private static readonly DODGE_FADE_OUT_SEC: number = 0.15;
  private static readonly DODGE_FADE_IN_SEC: number = 0.15;

  onStart(): void {
    this.getSharedCharacter();
    this.getCharacterImage();
  }

  public resetState(maxHp: number): void {
    const character = this.getSharedCharacter();
    if (character) character.resetState(maxHp);
    this.dodgeFadeElapsed = -1;
    const image = this.getCharacterImage();
    if (image) image.opacity = 1;
  }

  public beginDodgeVisual(): void {
    const image = this.getCharacterImage();
    if (!image) return;
    this.dodgeFadeElapsed = 0;
    image.opacity = 1;
  }

  public updateDodgeVisual(deltaTime: number): void {
    const image = this.getCharacterImage();
    if (!image || this.dodgeFadeElapsed < 0) return;

    this.dodgeFadeElapsed += Math.max(0, deltaTime);
    if (this.dodgeFadeElapsed <= PlayerCharacter.DODGE_FADE_OUT_SEC) {
      image.opacity = 1 - this.dodgeFadeElapsed / PlayerCharacter.DODGE_FADE_OUT_SEC;
      return;
    }

    const fadeInElapsed = this.dodgeFadeElapsed - PlayerCharacter.DODGE_FADE_OUT_SEC;
    image.opacity = Math.min(1, fadeInElapsed / PlayerCharacter.DODGE_FADE_IN_SEC);
    if (fadeInElapsed >= PlayerCharacter.DODGE_FADE_IN_SEC) {
      image.opacity = 1;
      this.dodgeFadeElapsed = -1;
    }
  }

  public getHp(): number {
    const character = this.getSharedCharacter();
    return character ? character.getHp() : 0;
  }

  public getDamageMultiplier(): number {
    const character = this.getSharedCharacter();
    return character ? character.getDamageMultiplier() : 1;
  }

  public applyDamage(amount: number): void {
    const character = this.getSharedCharacter();
    if (character) character.applyDamage(amount);
  }

  public refreshBars(): void {
    const character = this.getSharedCharacter();
    if (character) character.refreshBars();
  }

  private getCharacterImage(): APJS.Image | null {
    if (!this.characterImage && this.characterObj) {
      this.characterImage = this.characterObj.getComponent("Image") as APJS.Image;
    }
    return this.characterImage || null;
  }

  private getSharedCharacter(): any {
    if (!this.sharedCharacter && this.characterObj) {
      this.sharedCharacter = this.characterObj.getComponent("Character") as any;
    }
    return this.sharedCharacter;
  }
}