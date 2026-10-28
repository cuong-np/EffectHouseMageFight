@component()
export class ProjectileSpawnOffset extends APJS.BasicScriptComponent {
  @serializeSceneObjectFlag @serializeProperty
  projectileObj: APJS.SceneObject;

  @serializeSceneObjectFlag @serializeProperty
  playerObj: APJS.SceneObject;

  @serializeSceneObjectFlag @serializeProperty
  botObj: APJS.SceneObject;

  // Projectile positioning and flight are owned by BattleManager now.
  // Keep the attached component/resource stable, but do not write transforms here.
  onLateUpdate(_deltaTime: number): void {}
}
