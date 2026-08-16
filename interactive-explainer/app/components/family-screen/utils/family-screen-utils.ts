import {
  FamilyMemberHealth,
  type FamilyMemberStatChange,
  FamilyMemberStatChangeType,
  type FamilyMemberStats,
  getFamilyMemberHealth,
} from "@/app/game/types/family-stats";

// TODO placeholder costs - tune once the real economy numbers are decided
export const RENT_COST: number = 50;
export const HEAT_COST: number = 20;
export const FOOD_COST: number = 20;
export const MEDICINE_COST: number = 30;

// TODO placeholder HP effect for skipping a need / paying for medicine - tune
// alongside the costs above
export const SKIPPED_NEED_HP_PENALTY: number = 1;
export const MEDICINE_HP_RECOVERY: number = 4;

export function familyMemberHealthLabel(health: FamilyMemberHealth): string {
  switch (health) {
    case FamilyMemberHealth.HEALTHY:
      return "OK";
    case FamilyMemberHealth.SICK:
      return "SICK";
    case FamilyMemberHealth.DECEASED:
      return "DEAD";
  }
}

export function anyFamilyMemberSick(members: FamilyMemberStats[]): boolean {
  return members.some(
    (member: FamilyMemberStats) =>
      getFamilyMemberHealth(member.healthPoints) === FamilyMemberHealth.SICK,
  );
}

// skipping heat/food costs everyone a little HP; paying for medicine heals
// just the members who are currently sick
export function calculateFamilyHpChanges(
  members: FamilyMemberStats[],
  paidHeat: boolean,
  paidFood: boolean,
  paidMedicine: boolean,
): FamilyMemberStatChange[] {
  const changes: FamilyMemberStatChange[] = [];

  members.forEach((member: FamilyMemberStats) => {
    const isSick: boolean =
      getFamilyMemberHealth(member.healthPoints) === FamilyMemberHealth.SICK;

    let hpChange: number = 0;
    if (!paidHeat) hpChange -= SKIPPED_NEED_HP_PENALTY;
    if (!paidFood) hpChange -= SKIPPED_NEED_HP_PENALTY;
    if (isSick && paidMedicine) hpChange += MEDICINE_HP_RECOVERY;

    if (hpChange !== 0) {
      changes.push({
        name: member.name,
        hpChange,
        statChangeType: FamilyMemberStatChangeType.INCREMENT,
      });
    }
  });

  return changes;
}
