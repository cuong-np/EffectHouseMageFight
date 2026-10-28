@component()
export class ImpactPivotByDirection extends APJS.BasicScriptComponent {
  @serializeProperty
  projectileObj: APJS.SceneObject;

  @serializeProperty
  impactTransform: APJS.ScreenTransform;

  private wasTracking: boolean = false;
  private lastX: number = 0;
  private lastY: number = 0;

  onLateUpdate(_deltaTime: number): void {
    if (!this.projectileObj || !this.impactTransform) {
      return;
    }

    if (!this.projectileObj.enabled) {
      this.wasTracking = false;
      return;
    }

    const projectileTransform = this.projectileObj.getComponent("ScreenTransform") as APJS.ScreenTransform | null;
    if (!projectileTransform) {
      return;
    }

    const position = projectileTransform.anchoredPosition;
    if (!this.wasTracking) {
      this.lastX = position.x;
      this.lastY = position.y;
      this.wasTracking = true;
      return;
    }

    const dx = position.x - this.lastX;
    if (Math.abs(dx) > 0.5) {
      const currentPivot = this.impactTransform.pivot;
      const pivotX = dx > 0 ? 0.75 : 0.25;
      this.impactTransform.pivot = new APJS.Vector2f(pivotX, currentPivot.y);
    }

    this.lastX = position.x;
    this.lastY = position.y;
  }
}