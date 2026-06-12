export type TripPlan = {
  id: string;
  title: string;
  artist: string;
  date: string;
  city: string;
  venue: string;
  ticketPrice: number;
  transportCost: number;
  hotelCost: number;
  foodBudget: number;
  merchBudget: number;
  preference: number;
  rarity: number;
  fatigue: number;
  seatSatisfaction: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type TripPlanInput = Omit<TripPlan, "id" | "createdAt" | "updatedAt">;
