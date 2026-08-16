// the enum values here correspond to the amount of healthPoints they have at each state
export enum FamilyMemberHealth {
  HEALTHY = "HEALTHY",
  SICK = "SICK",
  DECEASED = "DECEASED",
}

export enum FamilyMemberName {
  WIFE = "Wife",
  SON = "Son",
  MOTHER_IN_LAW = "Mother-in-law",
  AUNT = "Aunt",
  NEPHEW = "Nephew",
}

export function getFamilyMemberHealth(
  familyMemberHP: number,
): FamilyMemberHealth {
  if (familyMemberHP >= 4) {
    return FamilyMemberHealth.HEALTHY;
  } else if (familyMemberHP > 0) {
    return FamilyMemberHealth.SICK;
  } else if (familyMemberHP <= 0) {
    return FamilyMemberHealth.DECEASED;
  }

  return FamilyMemberHealth.DECEASED;
}

export enum FamilyMemberStatChangeType {
  INCREMENT = "INCREMENT",
  UPDATE = "UPDATE",
}

export type FamilyMemberStatChange = {
  name: FamilyMemberName;
  hpChange: number; // can be negative
  statChangeType: FamilyMemberStatChangeType;
};

export type FamilyMemberStats = {
  name: FamilyMemberName;
  healthPoints: number;
};

export class FamilyStats {
  private readonly familyStats: Map<FamilyMemberName, FamilyMemberStats>;

  public constructor(...familyMembers: FamilyMemberStats[]) {
    this.familyStats = new Map<FamilyMemberName, FamilyMemberStats>();
    familyMembers.forEach((memberStats: FamilyMemberStats) => {
      // copy rather than alias the caller's object, so nothing outside this
      // instance can reach in and mutate its stored stats later
      this.familyStats.set(memberStats.name, { ...memberStats });
    });
  }

  // applies every change against a working copy of each member's HP and
  // returns a brand-new FamilyStats built from the result - this instance
  // (and the FamilyMemberStats objects it holds) are never mutated, so it's
  // safe to keep living in xstate context and be compared/replaced by assign
  // the normal immutable way
  public updateStats(memberStatChanges: FamilyMemberStatChange[]): FamilyStats {
    const updatedHealthPoints = new Map<FamilyMemberName, number>(
      this.getAllMemberStats().map((memberStats: FamilyMemberStats) => [
        memberStats.name,
        memberStats.healthPoints,
      ]),
    );

    memberStatChanges.forEach((memberStatChange: FamilyMemberStatChange) => {
      const currentHP: number | undefined = updatedHealthPoints.get(
        memberStatChange.name,
      );
      // a change for a member this instance never had is a no-op, matching
      // the old map.get-returns-undefined behaviour
      if (currentHP === undefined) return;

      updatedHealthPoints.set(
        memberStatChange.name,
        memberStatChange.statChangeType === FamilyMemberStatChangeType.INCREMENT
          ? currentHP + memberStatChange.hpChange
          : memberStatChange.hpChange,
      );
    });

    return new FamilyStats(
      ...this.getAllMemberStats().map(
        (memberStats: FamilyMemberStats): FamilyMemberStats => ({
          name: memberStats.name,
          healthPoints: updatedHealthPoints.get(memberStats.name) as number,
        }),
      ),
    );
  }

  public getAllMemberStats(): FamilyMemberStats[] {
    // copies out, so callers can't mutate this instance's stored stats either
    return Array.from(this.familyStats.values()).map(
      (memberStats: FamilyMemberStats) => ({ ...memberStats }),
    );
  }
}

export class DefaultFamilyStats extends FamilyStats {
  public constructor() {
    super(
      { name: FamilyMemberName.WIFE, healthPoints: 10 },
      { name: FamilyMemberName.SON, healthPoints: 2 },
      { name: FamilyMemberName.MOTHER_IN_LAW, healthPoints: 10 },
    );
  }
}
