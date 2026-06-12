export type TripPlan = {
  id: string;
  title: string;
  artist: string;
  date: string;
  city: string;
  venue: string;
  venueId?: string;
  seatType?: string;
  departureCity?: string;
  transportMode?: string;
  oneWayDuration?: string;
  hotelArea?: string;
  hotelNightlyPrice?: number;
  hotelNights?: number;
  venueCommuteTime?: string;
  ticketPrice: number;
  serviceFee: number;
  transportCost: number;
  hotelCost: number;
  foodBudget: number;
  merchBudget: number;
  localTransitCost: number;
  preference: number;
  rarity: number;
  fatigue: number;
  seatSatisfaction: number;
  hotelQuietness: number;
  regretRisk: number;
  departureTime?: string;
  arrivalTime?: string;
  hotelCheckInTime?: string;
  venueArrivalTime?: string;
  entryTime?: string;
  showStartTime?: string;
  showEndTime?: string;
  returnTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type TripPlanInput = Omit<TripPlan, "id" | "createdAt" | "updatedAt">;

export type ScoreBreakdownItem = {
  label: string;
  value: number;
  maxAbsValue: number;
  type: "positive" | "negative";
  description: string;
};

export type WorthScoreResult = {
  finalScore: number;
  breakdown: ScoreBreakdownItem[];
  advice: string;
};
