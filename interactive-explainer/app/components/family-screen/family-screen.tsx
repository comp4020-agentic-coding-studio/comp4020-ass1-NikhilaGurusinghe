"use client";

import { useState } from "react";
import { GameManagerTransitions } from "@/app/game/state/game-manager";
import { GameManagerContext } from "@/app/game/state/game-manager-context";
import {
  type FamilyMemberStats,
  getFamilyMemberHealth,
} from "@/app/game/types/family-stats";
import {
  anyFamilyMemberSick,
  calculateFamilyHpChanges,
  FOOD_COST,
  familyMemberHealthLabel,
  HEAT_COST,
  MEDICINE_COST,
  RENT_COST,
} from "./utils/family-screen-utils";

function SumRow({
  label,
  value,
  negative,
}: {
  label: string;
  value: number;
  negative?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between ${negative ? "text-red-600" : ""}`}
    >
      <span className="capitalize">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function OptionalSumRow({
  label,
  cost,
  paid,
  onToggle,
}: {
  label: string;
  cost: number;
  paid: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between text-red-600">
      <span className="capitalize">{label}</span>
      <div className="flex items-center gap-3">
        <span>{paid ? -cost : 0}</span>
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={paid}
          className={`w-8 h-8 rounded-full border-2 border-red-600 cursor-pointer ${paid ? "bg-red-600" : "bg-white"}`}
        />
      </div>
    </div>
  );
}

export default function FamilyScreen() {
  const actorRef = GameManagerContext.useActorRef();
  const savings: number = GameManagerContext.useSelector(
    (state) => state.context.savings,
  );
  const salary: number = GameManagerContext.useSelector(
    (state) => state.context.previousMinigameStats?.salary ?? 0,
  );
  const iteration: number = GameManagerContext.useSelector(
    (state) => state.context.iteration,
  );
  const familyMembers: FamilyMemberStats[] = GameManagerContext.useSelector(
    (state) => state.context.familyStats.getAllMemberStats(),
  );

  // default to paying every need - the player opts OUT rather than in
  const [payHeat, setPayHeat] = useState<boolean>(true);
  const [payFood, setPayFood] = useState<boolean>(true);
  const [payMedicine, setPayMedicine] = useState<boolean>(true);

  const familySick: boolean = anyFamilyMemberSick(familyMembers);

  const heatCost: number = payHeat ? HEAT_COST : 0;
  const foodCost: number = payFood ? FOOD_COST : 0;
  const medicineCost: number = familySick && payMedicine ? MEDICINE_COST : 0;
  const paidMedicine: boolean = familySick && payMedicine;

  const totalCosts: number = RENT_COST + heatCost + foodCost + medicineCost;
  const totalLeftover: number = savings + salary - totalCosts;
  // the machine adds leftoverSalary onto its own savings, so only the day's
  // net change is sent - not the running total shown above, or savings would
  // get double-counted
  const dayNetChange: number = salary - totalCosts;

  function handleNextClick(): void {
    const familyHpChanges = calculateFamilyHpChanges(
      familyMembers,
      payHeat,
      payFood,
      paidMedicine,
    );

    actorRef.send({
      type: GameManagerTransitions.NEXT,
      leftoverSalary: dayNetChange,
      familyHpChanges,
    });
  }

  return (
    <div className="w-full bg-white p-4 rounded-xl flex flex-col gap-4">
      <div className="text-center font-bold">end of day {iteration + 1}</div>

      <div className="flex flex-col gap-2">
        <SumRow label="savings" value={savings} />
        <SumRow label="salary" value={salary} />
        <SumRow label="rent" value={-RENT_COST} negative />
        <OptionalSumRow
          label="food"
          cost={FOOD_COST}
          paid={payFood}
          onToggle={() => setPayFood((prev: boolean) => !prev)}
        />
        <OptionalSumRow
          label="heat"
          cost={HEAT_COST}
          paid={payHeat}
          onToggle={() => setPayHeat((prev: boolean) => !prev)}
        />
        {familySick && (
          <OptionalSumRow
            label="medicine"
            cost={MEDICINE_COST}
            paid={payMedicine}
            onToggle={() => setPayMedicine((prev: boolean) => !prev)}
          />
        )}
      </div>

      <hr className="border-dashed border-t-2 border-gray-300" />

      <div className="flex items-center justify-between font-bold">
        <span>total leftover</span>
        <span>{totalLeftover}</span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        {familyMembers.map((member: FamilyMemberStats) => (
          <div
            key={member.name}
            className="w-16 h-16 rounded-full border-2 border-(--highlight-colour) flex items-center justify-center text-xs font-semibold"
          >
            {familyMemberHealthLabel(
              getFamilyMemberHealth(member.healthPoints),
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        className="cursor-pointer"
        onClick={handleNextClick}
      >
        next
      </button>
    </div>
  );
}
