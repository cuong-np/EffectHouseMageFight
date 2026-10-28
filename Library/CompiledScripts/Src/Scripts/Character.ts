@component()
export class Character extends APJS.BasicScriptComponent {
  @header("Character Tuning")
  @serializeProperty
  @tooltip("Damage dealt by this character. 1x is normal; raise it for quick tests.")
  @slider(1, 10, 0.5)
  damageMultiplier: number = 1;

  @serializeSceneObjectFlag @header("Character Wiring")
  @serializeProperty
  @tooltip("Health bar fill image for this character.")
  healthFillObj!: APJS.SceneObject;


  private healthFill!: APJS.Image;
  private maxHp: number = 100;
  private hp: number = 100;

  onStart(): void {
    this.damageMultiplier = Math.max(1, Math.min(10, this.damageMultiplier));
    if (this.healthFillObj) this.healthFill = this.healthFillObj.getComponent("Image") as APJS.Image;
    this.updateBars();
  }

  public resetState(maxHp: number): void {
    this.maxHp = Math.max(1, maxHp);
    this.hp = this.maxHp;
    this.updateBars();
  }

  public getHp(): number { return this.hp; }
  public getDamageMultiplier(): number { return this.damageMultiplier; }
  public applyDamage(amount: number): void {
    this.hp = Math.max(0, Math.min(this.maxHp, this.hp - Math.max(0, amount)));
    this.updateBars();
  }

  public refreshBars(): void {
    this.updateBars();
  }

  private updateBars(): void {
    if (this.healthFill) this.healthFill.setMaterialProperty("_filledRange", this.hp / this.maxHp);
  }
}
