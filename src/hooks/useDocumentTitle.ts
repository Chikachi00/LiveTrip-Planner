import { useEffect } from "react";

const baseTitle = "LiveTrip Planner — 演出远征规划器";

export const useDocumentTitle = (title?: string) => {
  useEffect(() => {
    document.title = title ? `${title} | LiveTrip Planner` : baseTitle;
  }, [title]);
};
