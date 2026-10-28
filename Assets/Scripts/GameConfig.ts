@component()
export class GameConfig extends APJS.BasicScriptComponent {
  @header("Gameplay Tuning")
  @serializeProperty
  @tooltip("Starting health for both fighters.")
  @spinBox(1, 500, 1)
  maxHp: number = 100;

  @serializeProperty
  @tooltip("Minimum normal damage dealt by one hit.")
  @spinBox(1, 50, 1)
  minDamage: number = 10;

  @serializeProperty
  @tooltip("Maximum normal damage dealt by one hit.")
  @spinBox(1, 50, 1)
  maxDamage: number = 15;

  @serializeProperty
  @tooltip("Chance for an attack to deal critical damage.")
  @slider(0, 0.5, 0.01)
  critRate: number = 0.15;

  @serializeProperty
  @tooltip("Critical damage multiplier.")
  @slider(1, 3, 0.1)
  critMultiplier: number = 2;

  @header("Turn Timing")
  @serializeProperty
  @tooltip("How long the WaterBall takes to fly to the other fighter at normal physics speed.")
  @slider(0.1, 2, 0.1)
  flightSec: number = 0.5;

  onStart(): void {
    this.maxHp = this.clampInt(this.maxHp, 1, 500);
    this.minDamage = this.clampInt(this.minDamage, 1, 50);
    this.maxDamage = Math.max(this.minDamage, this.clampInt(this.maxDamage, 1, 50));
    this.critRate = this.clamp(this.critRate, 0, 0.5);
    this.critMultiplier = this.clamp(this.critMultiplier, 1, 3);
    this.flightSec = this.clamp(this.flightSec, 0.1, 2);
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  private clampInt(value: number, min: number, max: number): number {
    return Math.round(this.clamp(value, min, max));
  }
}
