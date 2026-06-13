import { useNavigate } from "react-router-dom";
import { defaultPlanInput, PlanForm } from "../components/PlanForm";
import type { Venue } from "../data/venues";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import type { UserPreferences } from "../lib/userPreferences";
import type { TripPlan } from "../types";
import { createPlan } from "../utils/storage";

type NewPlanProps = {
  customVenues: Venue[];
  userPreferences: UserPreferences;
  onCreateCustomVenue: (venue: Venue) => void;
  onCreate: (plan: TripPlan) => void;
};

export const NewPlan = ({
  customVenues,
  userPreferences,
  onCreateCustomVenue,
  onCreate,
}: NewPlanProps) => {
  useDocumentTitle("新建计划");
  const navigate = useNavigate();
  const initialValue = {
    ...defaultPlanInput,
    departureCity: userPreferences.homeCity || defaultPlanInput.departureCity,
    foodBudget: userPreferences.defaultFoodBudget ?? defaultPlanInput.foodBudget,
    localTransitCost:
      userPreferences.defaultLocalTransportBudget ??
      defaultPlanInput.localTransitCost,
    merchBudget: userPreferences.defaultMerchBudget ?? defaultPlanInput.merchBudget,
  };

  return (
    <PlanForm
      title="新建远征计划"
      subtitle="把预算、体力、场馆风险和心动程度放进同一张决策表里。"
      submitLabel="保存计划"
      initialValue={initialValue}
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
