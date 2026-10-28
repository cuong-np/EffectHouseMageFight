@component()
export class FightNowButtonPulse extends APJS.BasicScriptComponent {
  private transform: APJS.ScreenTransform | null = null;
  private baseScale: APJS.Vector3f | null = null;
  private elapsed = 0;
  private readonly cycleDuration = 1.2;
  private readonly maxScaleIncrease = 0.1;

  onStart(): void {
    this.transform = this.getSceneObject().getComponent("ScreenTransform") as APJS.ScreenTransform;
    if (!this.transform) return;

    const scale = this.transform.localScale;
    this.baseScale = new APJS.Vector3f(scale.x, scale.y, scale.z);
  }

  onUpdate(deltaTime: number): void {
    if (!this.transform || !this.baseScale) return;

    this.elapsed = (this.elapsed + deltaTime) % this.cycleDuration;
    const progress = this.elapsed / this.cycleDuration;
    const pulse = 0.5 - 0.5 * Math.cos(2 * Math.PI * progress);
    const factor = 1 + this.maxScaleIncrease * pulse;

    this.transform.localScale = new APJS.Vector3f(
      this.baseScale.x * factor,
      this.baseScale.y * factor,
      this.baseScale.z * factor
    );
  }

  onDisable(): void {
    this.elapsed = 0;
    if (this.transform && this.baseScale) {
      this.transform.localScale = new APJS.Vector3f(
        this.baseScale.x,
        this.baseScale.y,
        this.baseScale.z
      );
    }
  }
}