import { Check, Clipboard, Download } from "lucide-react";
import { useMemo, useState } from "react";
import type { TripPlan } from "../types";
import {
  createMarkdownFileName,
  downloadTextFile,
  generateTripMarkdown,
} from "../utils/markdown";

type MarkdownExportPanelProps = {
  plan: TripPlan;
};

export const MarkdownExportPanel = ({ plan }: MarkdownExportPanelProps) => {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const markdown = useMemo(() => generateTripMarkdown(plan), [plan]);
  const fileName = createMarkdownFileName(plan);

  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setCopyError(false);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopyError(true);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Markdown 行程导出</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            生成可复制、可下载的行程文档，适合放进 Notion、GitHub 或旅行备忘。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyMarkdown}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-ink transition hover:border-flight/40 hover:text-flight"
          >
            {copied ? <Check size={16} /> : <Clipboard size={16} />}
            {copied ? "已复制" : "复制 Markdown"}
          </button>
          <button
            type="button"
            onClick={() => downloadTextFile(markdown, fileName)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            <Download size={16} />
            下载 .md
          </button>
        </div>
      </div>
      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-medium text-slate-600">
          预览 Markdown
        </summary>
        {copyError ? (
          <p className="mt-3 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
            当前浏览器限制了剪贴板写入。可以在下方预览框中手动选择文本复制，或直接下载 .md 文件。
          </p>
        ) : null}
        <pre className="mt-3 max-h-72 overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-5 text-slate-100">
          {markdown}
        </pre>
      </details>
    </div>
  );
};
