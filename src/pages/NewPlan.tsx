import { useNavigate } from "react-router-dom";
import { PlanForm } from "../components/PlanForm";
import type { Venue } from "../data/venues";
import type { TripPlan } from "../types";
import { createPlan } from "../utils/storage";

type NewPlanProps = {
  customVenues: Venue[];
  onCreateCustomVenue: (venue: Venue) => void;
  onCreate: (plan: TripPlan) => void;
};

export const NewPlan = ({
  customVenues,
  onCreateCustomVenue,
  onCreate,
}: NewPlanProps) => {
  const navigate = useNavigate();

  return (
    <PlanForm
      title="新建远征计划"
      subtitle="把预算、体力、场馆风险和心动程度放进同一张决策表里。"
      submitLabel="保存计划"
      customVenues={customVenues}
      onCreateCustomVenue={onCreateCustomVenue}
      onSubmit={(value) => {
        const plan = createPlan(value);
        onCreate(plan);
        navigate(`/plans/${plan.id}`);
      }}
    />
  );
};
