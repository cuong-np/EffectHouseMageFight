@component()
export class PlayerStamina extends APJS.BasicScriptComponent {
  private static readonly STARTING_STAMINA: number = 5;
  private static readonly MAX_STAMINA: number = 10;

  private currentStamina: number = PlayerStamina.STARTING_STAMINA;

  public resetForBattle(): number {
    this.currentStamina = PlayerStamina.STARTING_STAMINA;
    return this.currentStamina;
  }

  public recoverForTurn(amount: number): number {
    const recoveryAmount = Number.isFinite(amount) ? Math.max(0, Math.floor(amount)) : 0;
    this.currentStamina = Math.min(
      PlayerStamina.MAX_STAMINA,
      this.currentStamina + recoveryAmount
    );
    return this.currentStamina;
  }

  public trySpend(cost: number): boolean {
    const amount = Math.floor(cost);
    if (!Number.isFinite(amount) || amount <= 0 || this.currentStamina < amount) {
      return false;
    }
    this.currentStamina -= amount;
    return true;
  }

  public getCurrentStamina(): number {
    return this.currentStamina;
  }
}