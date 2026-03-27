"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Copy } from "lucide-react";
import { homeCapabilityItems, homePromptCards } from "@/lib/mock/demo-data";
import { AgentWorkspace } from "@/components/agent-workspace";
import { MoreDataShell } from "@/components/more-data-shell";
import { PlatformLogo } from "@/components/platform-logo";
import { demoActions, useDemoState } from "@/lib/mock/store";
import { TaskComposer } from "@/components/task-composer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

function sanitizeObjective(value: string) {
  return value.replace(/(^|\s)@[^\s]*/g, " ").replace(/\s+/g, " ").trim();
}

export function MoreDataHomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { templates } = useDemoState();
  const [query, setQuery] = useState("");
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [activeCapabilityId, setActiveCapabilityId] = useState(homeCapabilityItems[0]?.id ?? "scenarios");
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]);
  const [composerMode, setComposerMode] = useState<"普通模式" | "深度模式">("深度模式");
  const [notice, setNotice] = useState("");
  const [promptCopied, setPromptCopied] = useState(false);
  const activeRunId = searchParams.get("runId");

  const cards = useMemo(() => {
    if (!activeCapabilityId || activeCapabilityId === "scenarios") return homePromptCards;
    const filtered = homePromptCards.filter((card) => card.capabilityIds.includes(activeCapabilityId));
    return filtered.length > 0 ? filtered : homePromptCards;
  }, [activeCapabilityId]);

  const launchAgent = (seed?: string) => {
    const nextQuery = sanitizeObjective(seed ?? query);
    if (!nextQuery) {
      setNotice("请先输入一个研究目标，或从下方示例任务中直接发起。");
      return;
    }
    const runId = demoActions.startTaskRun({
      objective: nextQuery,
      mode: composerMode === "深度模式" ? "专业模式" : "轻量模式",
      selectedCapabilities: selectedSourceIds.length > 0
        ? selectedSourceIds
        : activeCapabilityId === "scenarios"
          ? []
          : [activeCapabilityId],
    });
    router.replace(`/?runId=${runId}`);
  };

  const applyBrowseCapability = (capabilityId: string) => {
    const item = homeCapabilityItems.find((entry) => entry.id === capabilityId);
    if (!item) return;
    setActiveCapabilityId(item.id);
    setNotice(`已切换首页浏览视角到「${item.label}」，可继续选择示例任务或直接输入需求。`);
  };

  const applyComposerTool = (capabilityId: string) => {
    const item = homeCapabilityItems.find((entry) => entry.id === capabilityId);
    if (!item || item.id === "scenarios") return;
    setSelectedSourceIds((current) => (current.includes(item.id) ? current : [...current, item.id]));
    setNotice(`已选择工具「${item.label}」，可以继续补充要求后直接发送。`);
  };

  const removeComposerTool = (capabilityId: string) => {
    setSelectedSourceIds((current) => current.filter((id) => id !== capabilityId));
  };

  const applyTemplate = (templateId: string) => {
    const template = templates.find((item) => item.id === templateId);
    if (!template) return;
    setQuery(template.body);
    setNotice(`已从任务指令库载入「${template.title}」。`);
  };

  const handleFilesSelected = (files: FileList) => {
    const names = Array.from(files).map((file) => file.name).join("、");
    setNotice(`已添加附件：${names}。`);
  };

  const selectedPrompt = cards.find((card) => card.id === selectedPromptId) ?? null;

  const openPromptCard = (cardId: string) => {
    setPromptCopied(false);
    setSelectedPromptId(cardId);
  };

  const applyPromptCard = (card: (typeof homePromptCards)[number]) => {
    setQuery(card.prompt);
    setSelectedSourceIds(card.capabilityIds);
    setActiveCapabilityId(card.capabilityIds[0] ?? "scenarios");
    setNotice(`已载入示例任务「${card.title}」，可继续补充要求后发送。`);
  };

  const usePromptCard = () => {
    if (!selectedPrompt) return;
    applyPromptCard(selectedPrompt);
    setSelectedPromptId(null);
  };

  const previewPromptRun = () => {
    if (!selectedPrompt) return;
    setSelectedPromptId(null);
    demoActions.setCurrentRun(selectedPrompt.replayRunId ?? "run-default");
    window.open(`/share/${selectedPrompt.replayShareId ?? selectedPrompt.replayRunId ?? "run-default"}`, "_blank", "noopener,noreferrer");
  };

  const copyPromptCard = async () => {
    if (!selectedPrompt) return;
    try {
      await navigator.clipboard.writeText(selectedPrompt.prompt);
      setPromptCopied(true);
      setNotice(`已复制示例任务「${selectedPrompt.title}」内容。`);
      window.setTimeout(() => setPromptCopied(false), 1500);
    } catch {
      setNotice("复制失败，请稍后重试。");
    }
  };

  if (activeRunId) {
    return <AgentWorkspace />;
  }

  return (
    <MoreDataShell
      currentPath="/"
      mainDecoration={
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-4%,rgba(255,255,255,0.98),rgba(255,255,255,0)_32%),linear-gradient(180deg,rgba(0,0,0,0.015),transparent_14%,transparent_100%)]" />
          <div className="absolute left-1/2 top-0 h-[320px] w-[860px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.98),rgba(255,255,255,0)_70%)]" />
        </>
      }
    >
      <div className="px-8 pb-8 pt-8">
        <div className="mx-auto w-full max-w-[1180px] pt-4">
          <div className="mx-auto max-w-[760px] text-center">
            <h1 className="font-[family:var(--font-jakarta)] text-[34px] font-semibold tracking-[-0.05em] text-[#171717] md:text-[42px]">
              跨境电商 AI 运营助手
            </h1>
            <p className="mt-2 text-[13px] leading-[1.7] text-[#6b7280] md:text-[13.5px]">数据、选品、调研、分析...</p>
          </div>

          <div className="mx-auto mt-4 max-w-[720px]">
            <TaskComposer
              value={query}
              onValueChange={setQuery}
              placeholder="需要分析亚马逊的流量来源？试试 @Sif-亚马逊-流量来源分析。"
              mode={composerMode}
              onModeChange={setComposerMode}
              templates={templates}
              selectedSourceIds={selectedSourceIds}
              onToolSelect={applyComposerTool}
              onSourceRemove={removeComposerTool}
              onTemplateSelect={applyTemplate}
              onFilesSelected={handleFilesSelected}
              onSubmit={() => launchAgent()}
            />
            <div className="mt-3 flex items-center justify-between gap-4 px-2">
              <div className="text-xs text-[#8b7355]">{notice || "有任何使用上的困惑，请随时联系我们！"}</div>
              <button
                type="button"
                className="text-xs font-medium text-[#6b7280] transition hover:text-[#23262d]"
              >
                联系我们
              </button>
            </div>
          </div>

          <div className="mx-auto mt-4 flex max-w-[960px] flex-wrap items-center justify-center gap-x-1.5 gap-y-1.5 text-[12px] text-[#71717a]">
            {homeCapabilityItems.map((item) => {
              const active = item.id === activeCapabilityId;
              return (
                <button
                  key={item.id}
                  onClick={() => applyBrowseCapability(item.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] transition duration-300 ${
                    active
                      ? "border-[#d4d4d8] bg-[#f4f4f5] text-[#18181b] shadow-[0_10px_20px_rgba(15,23,42,0.06)]"
                      : "border-[#e4e4e7] bg-[rgba(255,255,255,0.9)] text-[#71717a] hover:border-[#d4d4d8] hover:bg-white hover:text-[#18181b] hover:-translate-y-0.5"
                  }`}
                >
                  <span className="inline-flex h-3 w-3 items-center justify-center">
                    <PlatformLogo name={item.icon} color={item.accent} className="h-[10px] w-[10px]" />
                  </span>
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="mt-8 pb-2 text-center text-[13px] font-medium text-[#8d8f96]">探索精选提示词</div>

          <div className="mt-4 grid gap-3 pb-6 md:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
              <div
                key={card.id}
                role="button"
                tabIndex={0}
                aria-haspopup="dialog"
                aria-label={`打开示例任务 ${card.title}`}
                onClick={() => openPromptCard(card.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openPromptCard(card.id);
                  }
                }}
                className={`group relative overflow-hidden rounded-[18px] border text-left outline-none transition duration-300 ${
                  "border-[#ececee] bg-[linear-gradient(180deg,#ffffff,#fcfcfc)] shadow-[0_8px_18px_rgba(15,23,42,0.03)] hover:-translate-y-0.5 hover:border-[#d8dadd] hover:bg-[linear-gradient(180deg,#ffffff,#fafafa)] hover:shadow-[0_18px_34px_rgba(15,23,42,0.08)] focus-visible:-translate-y-0.5 focus-visible:border-[#d8dadd] focus-visible:bg-[linear-gradient(180deg,#ffffff,#fafafa)] focus-visible:shadow-[0_18px_34px_rgba(15,23,42,0.08)]"
                }`}
              >
                <div className="flex min-h-[148px] flex-col px-4 py-3.5">
                  <div className="min-w-0">
                    <div className="line-clamp-4 text-[11px] leading-5 text-[#666a73]">
                      {card.body.length > 68 ? `${card.body.slice(0, 68)}…` : card.body}
                    </div>
                  </div>
                  <div className="mt-auto pt-3">
                    <div className="text-[13px] font-medium tracking-[-0.02em] text-[#202020]">{card.title}</div>
                    <div className="mt-1 text-[10px] leading-4 text-[#9ea2ad]">{card.meta}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={Boolean(selectedPrompt)} onOpenChange={(open) => (!open ? setSelectedPromptId(null) : null)}>
        <DialogContent className="max-w-[608px] rounded-[14px] border-[#e3e1dc] bg-white p-0 shadow-[0_28px_80px_rgba(15,23,42,0.16)]">
          {selectedPrompt ? (
            <div className="p-5">
              <DialogTitle className="pr-8 text-[16px] font-semibold tracking-[-0.03em] text-[#222222]">
                {selectedPrompt.title}
              </DialogTitle>
              <DialogDescription className="mt-3 text-[13px] leading-6 text-[#7a7b80]">
                {selectedPrompt.body}
              </DialogDescription>

              <div className="mt-5 overflow-hidden rounded-[10px] border border-[#e8e8ea] bg-white">
                <div className="flex items-center justify-between border-b border-[#efeff1] bg-[#fafafb] px-4 py-3">
                  <div className="text-[13px] text-[#85868d]">提示词(Prompt)</div>
                  <button
                    type="button"
                    onClick={copyPromptCard}
                    className="inline-flex items-center gap-1.5 text-[13px] text-[#26272b] transition hover:text-[#111111]"
                  >
                    {promptCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {promptCopied ? "已复制" : "复制"}
                  </button>
                </div>
                <div className="bg-[#fdfdfd] px-4 py-4 text-[13px] leading-7 text-[#2b2d31]">
                  <p className="whitespace-pre-wrap">{selectedPrompt.prompt}</p>
                </div>
              </div>

              <div className="mt-7 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 rounded-[9px] border-[#dadbdd] bg-white px-4 text-[13px] text-[#3d3f44]"
                  onClick={() => setSelectedPromptId(null)}
                >
                  取消
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 rounded-[9px] border-[#dadbdd] bg-white px-4 text-[13px] text-[#2b2d31] hover:bg-[#f5f5f6]"
                  onClick={previewPromptRun}
                >
                  查看回放
                </Button>
                <Button
                  type="button"
                  className="h-9 rounded-[9px] border border-[#1d2a1e] bg-[#263126] px-4 text-[13px] text-white shadow-none hover:bg-[#1f2a20]"
                  onClick={usePromptCard}
                >
                  使用
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </MoreDataShell>
  );
}
