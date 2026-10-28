@component()
export class ImpactDirectionPresentation extends APJS.BasicScriptComponent {
  @header("Gameplay Tuning")
  @serializeProperty
  @tooltip("Screen-pixel offset behind the projectile when the impact effect appears.")
  @slider(0, 128, 1)
  behindOffsetPixels: number = 100;

  @serializeSceneObjectFlag @header("Advanced — Scene Wiring")
  @serializeProperty
  projectileObject!: APJS.SceneObject;

  @serializeProperty
  projectileTransform!: APJS.ScreenTransform;

  @serializeSceneObjectFlag @serializeProperty
  impactObject!: APJS.SceneObject;

  @serializeProperty
  impactTransform!: APJS.ScreenTransform;

  @serializeProperty
  impactImage!: APJS.Image;

  private initialized: boolean = false;
  private projectileWasEnabled: boolean = false;
  private impactWasEnabled: boolean = false;
  private previousX: number = 0;
  private travelDirection: number = 1;

  onLateUpdate(_deltaTime: number): void {
    if (!this.projectileObject || !this.projectileTransform || !this.impactObject ||
        !this.impactTransform || !this.impactImage) {
      return;
    }

    const projectileEnabled = this.projectileObject.isEnabledInHierarchy();
    const impactEnabled = this.impactObject.isEnabledInHierarchy();
    const currentX = this.projectileTransform.anchoredPosition.x;

    if (!this.initialized) {
      this.previousX = currentX;
      this.projectileWasEnabled = projectileEnabled;
      this.impactWasEnabled = impactEnabled;
      this.initialized = true;
      return;
    }

    if (projectileEnabled) {
      if (!this.projectileWasEnabled) {
        this.previousX = currentX;
      } else {
        const deltaX = currentX - this.previousX;
        if (deltaX < -0.01) {
          this.travelDirection = -1;
        } else if (deltaX > 0.01) {
          this.travelDirection = 1;
        }
        this.previousX = currentX;
      }
    }

    if (impactEnabled && !this.impactWasEnabled) {
      this.impactImage.flipX = this.travelDirection < 0;

      const impactPosition = this.impactTransform.anchoredPosition;
      const offset = Math.max(0, Math.min(128, this.behindOffsetPixels));
      this.impactTransform.anchoredPosition = new APJS.Vector2f(
        impactPosition.x - this.travelDirection * offset,
        impactPosition.y
      );
    }

    this.projectileWasEnabled = projectileEnabled;
    this.impactWasEnabled = impactEnabled;
  }
}