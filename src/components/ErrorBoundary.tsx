import { Component, ErrorInfo, ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("LiveTrip Planner render error", error, info);
    }
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-cloud px-4 py-10 text-ink">
        <div className="mx-auto max-w-lg rounded-lg border border-slate-200 bg-white p-6 text-center shadow-soft">
          <h1 className="text-2xl font-semibold">页面出现了一些问题</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            当前页面没有正确渲染。你可以返回 Dashboard，或刷新页面重新加载。
          </p>
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <a
              href="/"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-ink px-4 text-sm font-semibold text-white"
            >
              返回 Dashboard
            </a>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700"
            >
              刷新页面
            </button>
          </div>
        </div>
      </div>
    );
  }
}
