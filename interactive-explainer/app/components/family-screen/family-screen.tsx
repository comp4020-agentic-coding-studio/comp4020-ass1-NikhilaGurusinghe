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
  disabled,
  onToggle,
}: {
  label: string;
  cost: number;
  paid: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between text-red-600">
      <span className="capitalize">{label}</span>
      <div className="flex items-center gap-3">
        <span>{-cost}</span>
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          aria-pressed={paid}
          className={`w-8 h-8 rounded-full border-2 border-red-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${paid ? "bg-red-600" : "bg-white"}`}
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

  // default to NOT paying - the affordability guard on the toggle handlers
  // only runs when you turn a need on, so starting checked would skip it and
  // could open the screen already negative
  const [payHeat, setPayHeat] = useState<boolean>(false);
  const [payFood, setPayFood] = useState<boolean>(false);
  const [payMedicine, setPayMedicine] = useState<boolean>(false);

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

  // turning a need OFF only ever raises totalLeftover, so that's always
  // allowed; turning one ON is only allowed if it wouldn't take the total
  // negative - toggling off is unaffected either way
  const canAffordFood: boolean = payFood || totalLeftover - FOOD_COST >= 0;
  const canAffordHeat: boolean = payHeat || totalLeftover - HEAT_COST >= 0;
  const canAffordMedicine: boolean =
    payMedicine || totalLeftover - MEDICINE_COST >= 0;

  function handleToggleFood(): void {
    setPayFood((prev: boolean) => (prev || canAffordFood ? !prev : prev));
  }

  function handleToggleHeat(): void {
    setPayHeat((prev: boolean) => (prev || canAffordHeat ? !prev : prev));
  }

  function handleToggleMedicine(): void {
    setPayMedicine((prev: boolean) =>
      prev || canAffordMedicine ? !prev : prev,
    );
  }

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
          disabled={!canAffordFood}
          onToggle={handleToggleFood}
        />
        <OptionalSumRow
          label="heat"
          cost={HEAT_COST}
          paid={payHeat}
          disabled={!canAffordHeat}
          onToggle={handleToggleHeat}
        />
        {familySick && (
          <OptionalSumRow
            label="medicine"
            cost={MEDICINE_COST}
            paid={payMedicine}
            disabled={!canAffordMedicine}
            onToggle={handleToggleMedicine}
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
          <div key={member.name} className="flex flex-col items-center gap-1">
            <div className="w-16 h-16 rounded-full border-2 border-(--highlight-colour) flex items-center justify-center text-xs font-semibold">
              {familyMemberHealthLabel(
                getFamilyMemberHealth(member.healthPoints),
              )}
            </div>
            <span className="text-xs">{member.name}</span>
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
