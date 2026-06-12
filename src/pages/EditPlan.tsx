import { Link, useNavigate, useParams } from "react-router-dom";
import { PlanForm } from "../components/PlanForm";
import type { TripPlan, TripPlanInput } from "../types";

type EditPlanProps = {
  plans: TripPlan[];
  onUpdate: (id: string, value: TripPlanInput) => void;
};

export const EditPlan = ({ plans, onUpdate }: EditPlanProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const plan = plans.find((item) => item.id === id);

  if (!plan) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-soft">
        <h1 className="text-2xl font-semibold">没有找到这个计划</h1>
        <Link
          to="/"
          className="mt-5 inline-flex rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white"
        >
          返回首页
        </Link>
      </div>
    );
  }

  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...input } = plan;

  return (
    <PlanForm
      initialValue={input}
      title={`编辑 ${plan.title}`}
      subtitle="修改后会覆盖原计划，不会新建重复数据。"
      submitLabel="保存修改"
      onSubmit={(value) => {
        onUpdate(plan.id, value);
        navigate(`/plans/${plan.id}`);
      }}
    />
  );
};
