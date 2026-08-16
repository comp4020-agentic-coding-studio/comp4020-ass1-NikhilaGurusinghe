// the enum values here correspond to the amount of healthPoints they have at each state
export enum FamilyMemberHealth {
  HEALTHY = "HEALTHY",
  SICK = "SICK",
  DECEASED = "DECEASED",
}

export enum FamilyMemberName {
  WIFE = "WIFE",
  SON = "SON",
  MOTHER_IN_LAW = "MOTHER-IN-LAW",
  AUNT = "AUNT",
  NEPHEW = "NEPHEW",
}

export function getFamilyMemberHealth(familyMemberHP: number) : FamilyMemberHealth {
  if (familyMemberHP >= 4) {
    return FamilyMemberHealth.HEALTHY;
  } else if (familyMemberHP > 0) {
    return FamilyMemberHealth.SICK;
  } else if (familyMemberHP <= 0) {
    return FamilyMemberHealth.DECEASED;
  }

  return FamilyMemberHealth.DECEASED;
}

export type FamilyMemberStats = {
  name: FamilyMemberName,
  healthPoints: number
}

export class FamilyStats {
  private readonly familyStats: Map<FamilyMemberName, FamilyMemberStats>;

  public constructor(...familyMembers: FamilyMemberStats[]) {
    this.familyStats = new Map<FamilyMemberName, FamilyMemberStats>();
    familyMembers.forEach((memberStats: FamilyMemberStats) => {
      this.familyStats.set(memberStats.name, memberStats);
    })
  }

  public incrementFamilyHP(name: FamilyMemberName, increment: number): boolean {
    const familyMemberStats: FamilyMemberStats | undefined = this.familyStats.get(name);
    if (familyMemberStats) {
      familyMemberStats.healthPoints += increment;
      return true;
    }

    return false;
  }

  public getAllMemberStats(): FamilyMemberStats[] {
    return Array.from(this.familyStats.values());
  }
}

export class DefaultFamilyStats extends FamilyStats {
  public constructor() {
    super(
      { name: FamilyMemberName.WIFE, healthPoints: 10 },
      { name: FamilyMemberName.SON, healthPoints: 4 },
      { name: FamilyMemberName.MOTHER_IN_LAW, healthPoints: 10 },
    );
  }
}
