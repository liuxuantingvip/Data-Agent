"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import {
  Bot,
  ChevronDown,
  FileText,
  ListRestart,
  MessageCircleMore,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import type { TdAttachmentItem } from "tdesign-web-components/lib/filecard/type";
import type { AgentAttachment, ConversationNode, DataSourceChain } from "@/lib/agent-events";
import { InlineNotice } from "@/components/inline-notice";
import { MoreDataShell } from "@/components/more-data-shell";
import { ReportPreviewPanel } from "@/components/report-preview-panel";
import { TaskComposer } from "@/components/task-composer";
import { Button } from "@/components/ui/button";
import { inferAttachmentType, sanitizeObjective } from "@/lib/agent-attachments";
import { streamAgentRound } from "@/lib/agent-runtime";
import { homeCapabilityItems } from "@/lib/mock/demo-data";
import { demoActions, useDemoState } from "@/lib/mock/store";
import { cn } from "@/lib/utils";

const ChatAttachments = dynamic(
  () => import("@tdesign-react/aigc").then((mod) => mod.ChatAttachments),
  { ssr: false },
);

function buildAttachmentItems(files: FileList): AgentAttachment[] {
  return Array.from(files).map((file, index) => ({
    id: `${file.name}-${index}`,
    name: file.name,
    size: file.size,
    fileType: inferAttachmentType(file.name),
    extension: file.name.split(".").pop()?.toLowerCase(),
    status: "queued",
  }));
}

function toTdAttachments(attachments: AgentAttachment[]): TdAttachmentItem[] {
  return attachments.map((item) => ({
    uid: item.id,
    name: item.name,
    size: item.size,
    status: "success",
    fileType: item.fileType,
    extension: item.extension,
  }));
}

export type RoundViewModel = {
  roundId: string;
  createdAt: string;
  userMessage?: string;
  attachments: AgentAttachment[];
  intentText: string;
  splitItems: string[];
  executionGroups: Array<{
    id: string;
    title: string;
    description: string;
    tools: Array<{
      id: string;
      title: string;
      detail: string;
      previewId?: string;
    }>;
  }>;
  resultSummary: string;
  resultTitle: string;
  hasResult: boolean;
};

function compactText(text: string, maxLength = 120) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength).trim()}...`;
}

function splitMessageLines(text: string) {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function ConversationBubble({
  role,
  title,
  datetime,
  body,
  tone = "default",
}: {
  role: "user" | "assistant";
  title: string;
  datetime: string;
  body: string;
  tone?: "default" | "status";
}) {
  const lines = splitMessageLines(body);

  return (
    <div className={cn("flex", role === "user" ? "justify-end" : "justify-start")}>
      <div className={cn("w-full max-w-[780px]", role === "user" ? "items-end" : "items-start")}>
        <div
          className={cn(
            "px-5 py-4",
            role === "user"
              ? "rounded-none bg-transparent px-0 py-0 text-[#202124] shadow-none"
              : tone === "status"
                ? "rounded-[16px] border border-[#e6dcc8] bg-[linear-gradient(180deg,#fffdf8,#faf6eb)] text-[#5d5442] shadow-none"
                : "border border-[#e5e7eb] bg-[linear-gradient(180deg,#ffffff,#fafafa)] text-[#39403c]",
          )}
        >
          <div className="space-y-2 text-[14px] leading-7">
            {lines.map((line) => (
              <p key={line} className="whitespace-pre-wrap break-words">
                {line}
              </p>
            ))}
          </div>
          {role === "user" ? (
            <div className="mt-3 text-right text-[11px] text-[#b0b4b8]">
              {datetime}
            </div>
          ) : null}
        </div>
        {role === "assistant" ? (
          <div className="mb-2 mt-2 flex items-center gap-2 text-[11px] justify-start text-[#7a8380]">
            <span className="font-medium text-[#1f2421]">{title}</span>
            <span>{datetime}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function CollapsedStatusRow({
  title,
  expanded,
  onClick,
  testId,
}: {
  title: string;
  expanded: boolean;
  onClick: () => void;
  testId?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-[16px] border border-[#eceef1] bg-[#fcfcfd] px-4 py-3.5 text-left"
      data-testid={testId}
    >
      <div className="text-[14px] font-semibold text-[#1f2421]">{title}</div>
      <ChevronDown className={cn("h-4 w-4 text-[#8f9692]", expanded ? "rotate-180" : "-rotate-90")} />
    </button>
  );
}

function ToolCard({
  title,
  detail,
  actionLabel = "查看",
  onAction,
}: {
  title: string;
  detail: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="rounded-[16px] border border-[#eceef1] bg-white px-4 py-3 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[12px] font-medium text-[#3f4542]">
          <div className="flex h-5 w-5 items-center justify-center rounded-full border border-[#e5e7eb] bg-[#fafafa]">
            <FileText className="h-3 w-3" />
          </div>
          {title}
        </div>
        {onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="rounded-[8px] border border-[#e5e7eb] bg-[#fafafa] px-2 py-0.5 text-[11px] font-medium text-[#3a403d]"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
      <div className="mt-2 text-[11px] leading-5 text-[#6c7571]">{detail}</div>
    </div>
  );
}

export function buildRoundViewModels(run: TaskRunLike) {
  const seen = new Set<string>();
  const models: RoundViewModel[] = [];

  for (const node of run.timeline) {
    if (seen.has(node.roundId)) continue;
    seen.add(node.roundId);

    const roundNodes = run.timeline.filter((item) => item.roundId === node.roundId);
    const createdAt = roundNodes[0]?.createdAt ?? run.startedAt;
    const userNode = roundNodes.find((item) => item.kind === "user_message" && "text" in item);
    const finalNode = roundNodes.find((item) => item.kind === "assistant_final" && "text" in item);
    const attachmentNode = roundNodes.find((item) => item.kind === "attachment_group" && "attachments" in item);
    const patchNode = roundNodes.find((item) => item.kind === "report_patch" && "summary" in item);
    const chains = run.chains.filter((chain) => chain.roundId === node.roundId);
    const sourceLabels = chains.map((chain) => chain.sourceLabel);
    const intentText =
      sourceLabels.length > 0
        ? `本轮会优先调度 ${sourceLabels.join("、")}，先确认目标，再完成结果汇总。`
        : "本轮会先确认目标，再按阶段完成执行与汇总。";
    const splitItems =
      chains.length > 0
        ? chains.map((chain, index) => `${index + 1}）${chain.sourceLabel}：补充本轮所需的结构化结果。`)
        : (run.selectedCapabilities.length > 0 ? run.selectedCapabilities : ["web-search"]).map(
            (sourceId, index) => `${index + 1}）${toCapabilitySafeTitle(sourceId)}：补充本轮所需的结构化结果。`,
          );
    const executionGroups = chains.map((chain) => ({
      id: chain.id,
      title: chain.sourceLabel,
      description: chain.intent,
      tools: [
        {
          id: `${chain.id}-tool`,
          title: chain.sourceLabel,
          detail: `${chain.progressText}${chain.resultCountText ? `（${chain.resultCountText}）` : ""}`,
          previewId: chain.resultPreviewId,
        },
      ],
    }));
    const patchSummaryText = (patchNode?.summary ?? []).join("。");
    const resultSummary = finalNode?.text ?? (patchSummaryText || buildExecutionSummaryFallback(run.objective, sourceLabels));

    models.push({
      roundId: node.roundId,
      createdAt,
      userMessage: userNode?.text,
      attachments: attachmentNode?.attachments ?? [],
      intentText,
      splitItems,
      executionGroups,
      resultSummary,
      resultTitle: buildResultTitle(userNode?.text ?? run.objective),
      hasResult: Boolean(finalNode?.text || patchNode?.summary?.length),
    });
  }

  return models;
}

function buildExecutionSummaryFallback(objective: string, sourceLabels: string[]) {
  if (sourceLabels.length > 0) {
    return `本轮已经完成 ${sourceLabels.join("、")} 的结构化执行，并将关键结果整理进当前任务。`;
  }
  return `本轮围绕“${toCapabilitySafeTitle(objective)}”生成了一份结构化结果。`;
}

function buildResultTitle(sourceText: string) {
  const cleaned = toCapabilitySafeTitle(sourceText)
    .replace(/^(请帮我做一份|请帮我|帮我|给我|做一份|做个|生成|输出)/, "")
    .trim();

  if (!cleaned) return "分析结果";
  if (/(报告|结果|方案|规划|摘要|概览|分析)$/.test(cleaned)) return cleaned;
  return `${cleaned}结果`;
}

export function buildAcknowledgement(round: RoundViewModel, run: TaskRunLike) {
  const shortTitle = compactText(round.userMessage ?? run.objective, 40);
  if (round.executionGroups.length > 0) {
    const groupTitles = round.executionGroups.map((group) => group.title).join("、");
    return `好的，我收到「${shortTitle}」这个任务了。我会先把 ${groupTitles} 这些结果查齐，再整理成结论给你。`;
  }
  return `好的，我收到「${shortTitle}」这个任务了。我会先完成任务理解，再把执行结果整理给你。`;
}

export function toCapabilitySafeTitle(text: string) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  return cleaned.length > 42 ? `${cleaned.slice(0, 42)}...` : cleaned;
}

export type TaskRunLike = {
  startedAt: string;
  objective: string;
  selectedCapabilities: string[];
  timeline: ConversationNode[];
  chains: DataSourceChain[];
};

export function AgentWorkspace() {
  const searchParams = useSearchParams();
  const { currentRunId, reports, runs, templates } = useDemoState();
  const runId = searchParams.get("runId") ?? currentRunId;
  const run = runs.find((item) => item.id === runId) ?? runs[0];
  const report = reports.find((item) => item.id === run?.reportId) ?? reports[0];

  const [previewOverrides, setPreviewOverrides] = useState<Record<string, string | null>>({});
  const [panelVisibility, setPanelVisibility] = useState<Record<string, boolean>>({});
  const [composerModes, setComposerModes] = useState<Record<string, "普通模式" | "深度模式">>({});
  const [selectedSourceOverrides, setSelectedSourceOverrides] = useState<Record<string, string[]>>({});
  const [queuedAttachments, setQueuedAttachments] = useState<Record<string, AgentAttachment[]>>({});
  const [composerVersion, setComposerVersion] = useState<Record<string, number>>({});
  const [thinkingOpen, setThinkingOpen] = useState<Record<string, boolean>>({});
  const [executionCardExpandedByRound, setExecutionCardExpandedByRound] = useState<Record<string, boolean>>({});
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");
  const executingRoundsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (run && currentRunId !== run.id) {
      demoActions.setCurrentRun(run.id);
    }
  }, [currentRunId, run]);

  const composerMode = composerModes[run.id] ?? (run.mode === "专业模式" ? "深度模式" : "普通模式");
  const selectedSourceIds = selectedSourceOverrides[run.id] ?? [];
  const currentComposerVersion = composerVersion[run.id] ?? 0;
  const activePreview =
    (panelVisibility[run.id] ?? run.status === "success") ? previewOverrides[run.id] ?? run.activePreviewId ?? report.previewKey : null;

  const roundModels = useMemo(
    () =>
      buildRoundViewModels({
        startedAt: run.startedAt,
        objective: run.objective,
        selectedCapabilities: run.selectedCapabilities,
        timeline: run.timeline,
        chains: run.chains,
      }),
    [run.chains, run.objective, run.selectedCapabilities, run.startedAt, run.timeline],
  );

  const executeRound = useCallback(async (input: {
    roundId: string;
    prompt: string;
    selectedCapabilities: string[];
    attachments: AgentAttachment[];
    isInitialRound?: boolean;
  }) => {
    if (executingRoundsRef.current.has(input.roundId)) return;
    executingRoundsRef.current.add(input.roundId);
    try {
      await streamAgentRound(
        {
          roundId: input.roundId,
          runId: run.id,
          prompt: input.prompt,
          mode: composerMode,
          selectedCapabilities: input.selectedCapabilities,
          attachments: input.attachments,
          objective: run.objective,
          isInitialRound: input.isInitialRound,
        },
        {
          onEvent: (event) => {
            demoActions.applyRuntimeEvent(run.id, event);
          },
        },
      );
      setQueuedAttachments((current) => ({ ...current, [run.id]: [] }));
      setComposerVersion((current) => ({ ...current, [run.id]: (current[run.id] ?? 0) + 1 }));
    } catch (error) {
      demoActions.applyRuntimeEvent(run.id, {
        type: "error",
        roundId: input.roundId,
        message: error instanceof Error ? error.message : "执行失败",
      });
      setNotice(error instanceof Error ? error.message : "执行失败");
    } finally {
      executingRoundsRef.current.delete(input.roundId);
    }
  }, [composerMode, run.id, run.objective]);

  useEffect(() => {
    if (run.status !== "queued" || !run.latestRoundId) return;
    void executeRound({
      roundId: run.latestRoundId,
      prompt: run.objective,
      selectedCapabilities: run.selectedCapabilities,
      attachments: [],
      isInitialRound: true,
    });
  }, [executeRound, run.id, run.latestRoundId, run.objective, run.selectedCapabilities, run.status]);

  const appendNote = async () => {
    const value = sanitizeObjective(draft);
    if (!value || run.status === "running") return;
    const attachments = queuedAttachments[run.id] ?? [];
    const roundId = demoActions.queueFollowupRound(run.id, {
      prompt: value,
      selectedCapabilities: selectedSourceIds,
      attachments,
    });
    setDraft("");
    setNotice(`已发起新一轮多数据源分析：${value}`);
    await executeRound({
      roundId,
      prompt: value,
      selectedCapabilities: selectedSourceIds,
      attachments,
    });
  };

  const applyCapability = (capabilityId: string) => {
    const item = homeCapabilityItems.find((entry) => entry.id === capabilityId);
    if (!item) return;
    setSelectedSourceOverrides((current) => {
      const currentSources = current[run.id] ?? [];
      return {
        ...current,
        [run.id]: currentSources.includes(item.id) ? currentSources : [...currentSources, item.id],
      };
    });
    setNotice(`本轮已加入数据源「${item.label}」。`);
  };

  const removeCapability = (capabilityId: string) => {
    setSelectedSourceOverrides((current) => ({
      ...current,
      [run.id]: (current[run.id] ?? []).filter((id) => id !== capabilityId),
    }));
  };

  const applyTemplate = (templateId: string) => {
    const template = templates.find((item) => item.id === templateId);
    if (!template) return;
    setDraft(template.body);
    setNotice(`已载入任务指令「${template.title}」。`);
  };

  const handleFilesSelected = (files: FileList) => {
    const attachmentItems = buildAttachmentItems(files);
    setQueuedAttachments((current) => ({
      ...current,
      [run.id]: attachmentItems,
    }));
    setNotice(`已添加附件：${attachmentItems.map((item) => item.name).join("、")}。`);
  };

  const handleFeedback = (kind: "喜欢" | "不喜欢" | "需要继续") => {
    setNotice(`已记录反馈：${kind}。`);
  };

  return (
    <MoreDataShell
      currentPath="/agent"
      contentScrollMode="child"
      currentRunLabel={run.title}
      rightRail={
        activePreview ? (
          <ReportPreviewPanel
            previewId={activePreview}
            reportTitle={run.title}
            report={report}
            onClose={() =>
              setPanelVisibility((current) => ({
                ...current,
                [run.id]: false,
              }))
            }
          />
        ) : undefined
      }
    >
      <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
        <div className="min-h-0 flex-1 overflow-y-auto bg-white">
          <div className="mx-auto max-w-[920px] px-8 pb-8 pt-6">
            <div className="space-y-5">
              {notice ? <InlineNotice message={notice} /> : null}

            <div className="space-y-7">
              {roundModels.map((round, index) => {
                const executionExpanded =
                  executionCardExpandedByRound[round.roundId] ?? run.status !== "success";

                return (
                <div key={round.roundId} className="space-y-3">
                  {round.userMessage ? (
                    <div className="flex justify-end">
                      <div className="w-full max-w-[780px]" data-testid="agent-user-input-card">
                        <ConversationBubble role="user" title="你" datetime={round.createdAt} body={compactText(round.userMessage, 220)} />
                      </div>
                    </div>
                  ) : null}

                  {round.attachments.length > 0 ? (
                    <div className="w-full max-w-[780px]">
                      <div className="rounded-[16px] border border-[#e5e7eb] bg-white px-3 py-3">
                        <ChatAttachments items={toTdAttachments(round.attachments)} overflow="wrap" />
                      </div>
                    </div>
                  ) : null}

                  <div className="w-full max-w-[780px]">
                    <div className="space-y-3.5">
                      <div className="flex items-center gap-3 text-[14px] font-medium text-[#303734]">
                        <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#171717] text-white shadow-[0_14px_32px_rgba(23,23,23,0.18)]">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-[15px] font-semibold text-[#1f2421]">MData Agent</div>
                        </div>
                      </div>

                      <div className="space-y-0" data-testid="agent-thinking-section">
                        <CollapsedStatusRow
                          title="完成思考"
                          expanded={Boolean(thinkingOpen[round.roundId])}
                          onClick={() =>
                            setThinkingOpen((current) => ({
                              ...current,
                              [round.roundId]: !current[round.roundId],
                            }))
                          }
                        />
                        {thinkingOpen[round.roundId] ? (
                          <div className="border-x border-b border-[#eceef1] rounded-b-[16px] bg-[#fcfcfd] px-4 pb-4 pt-3 text-[13px] leading-6.5 text-[#4f5753]">
                            {round.intentText}
                          </div>
                        ) : null}
                      </div>

                      <div className="max-w-[780px] text-[14px] leading-6.5 text-[#444b47]" data-testid="agent-acknowledgement">
                        {buildAcknowledgement(round, run)}
                      </div>

                      <div className="space-y-2 px-1" data-testid="agent-split-section">
                        <div className="text-[14px] font-semibold text-[#202124]">任务拆分</div>
                        <div className="space-y-2 text-[13px] leading-6.5 text-[#4f5753]">
                          {round.splitItems.map((item, itemIndex) => (
                            <div key={item} className="flex gap-2">
                              <span className="pt-[1px] text-[#9aa39e]">{itemIndex + 1}.</span>
                              <p className="min-w-0 flex-1">{item.replace(/^\d+[）)]\s*/, "")}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {executionExpanded ? (
                        <div className="rounded-[20px] border border-[#eceef1] bg-[#fcfcfd] px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.03)]" data-testid="agent-execution-panel">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <div className="text-[16px] font-semibold tracking-[-0.02em] text-[#1f2421]">任务执行</div>
                            </div>
                            <div className="flex items-center">
                              {run.status === "success" ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExecutionCardExpandedByRound((current) => ({
                                      ...current,
                                      [round.roundId]: false,
                                    }))
                                  }
                                  aria-label="收起任务执行"
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] border border-[#e5e7eb] bg-white text-[#303734]"
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </button>
                              ) : null}
                            </div>
                          </div>

                          <div className="mt-4 space-y-3">
                            {round.executionGroups.map((group) => (
                              <div key={group.id} className="space-y-2.5">
                                {group.tools.map((tool) => (
                                  <ToolCard
                                    key={tool.id}
                                    title={tool.title}
                                    detail={tool.detail}
                                    onAction={
                                      tool.previewId
                                        ? () => {
                                            demoActions.setActivePreview(run.id, tool.previewId!);
                                            setPreviewOverrides((current) => ({ ...current, [run.id]: tool.previewId! }));
                                            setPanelVisibility((current) => ({ ...current, [run.id]: true }));
                                          }
                                        : undefined
                                    }
                                  />
                                ))}
                              </div>
                            ))}
                            {round.executionGroups.length === 0 ? (
                              <div className="rounded-[18px] border border-dashed border-[#e5e7eb] bg-[#fcfcfd] px-4 py-5 text-[13px] leading-7 text-[#6c7571]">
                                正在为这轮任务准备执行节点，稍后会把关键过程同步到这里。
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ) : (
                        <CollapsedStatusRow
                          title="任务已完成"
                          expanded={false}
                          onClick={() =>
                            setExecutionCardExpandedByRound((current) => ({
                              ...current,
                              [round.roundId]: true,
                            }))
                          }
                          data-testid="agent-execution-summary-bar"
                        />
                      )}

                      <div className="space-y-3" data-testid="agent-result-section">
                        <div className="text-[14px] font-semibold text-[#202124]">任务结果</div>
                        <div className="group rounded-[16px] border border-[#e5e7eb] bg-white px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.03)]">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex min-w-0 items-center gap-4">
                              <div className="relative flex h-[56px] w-[76px] shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-[linear-gradient(180deg,#eef4ff,#f8fafc)]">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_55%)]" />
                                <div className="relative flex h-8 w-8 items-center justify-center rounded-[10px] bg-white text-[#2563eb] shadow-sm">
                                  <FileText className="h-4 w-4" />
                                </div>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-[15px] font-semibold text-[#202124]">{compactText(round.resultTitle, 48)}</div>
                              </div>
                            </div>
                            {round.hasResult ? (
                              <button
                                type="button"
                                onClick={() => {
                                  demoActions.setActivePreview(run.id, run.activePreviewId);
                                  setPreviewOverrides((current) => ({ ...current, [run.id]: run.activePreviewId }));
                                  setPanelVisibility((current) => ({ ...current, [run.id]: true }));
                                }}
                                className="rounded-[10px] border border-[#e5e7eb] bg-white px-3 py-1.5 text-[11px] font-medium text-[#303734] opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                              >
                                查看
                              </button>
                            ) : null}
                          </div>
                        </div>
                        <div className="line-clamp-3 max-w-[720px] px-1 text-[13px] leading-6.5 text-[#5f666f]">{compactText(round.resultSummary, 220)}</div>
                      </div>
                    </div>
                  </div>

                  {index < roundModels.length - 1 ? <div className="border-b border-dashed border-[#e5e7eb]" /> : null}
                </div>
                );
              })}
            </div>

            <div className="flex items-center gap-1 text-[#8a97a8]">
                <Button aria-label="继续追问" variant="ghost" size="icon" className="h-8 w-8 rounded-[10px]" onClick={() => handleFeedback("需要继续")}>
                  <ListRestart className="h-4 w-4" />
                </Button>
                <Button aria-label="反馈喜欢" variant="ghost" size="icon" className="h-8 w-8 rounded-[10px]" onClick={() => handleFeedback("喜欢")}>
                  <ThumbsUp className="h-4 w-4" />
                </Button>
                <Button aria-label="反馈不喜欢" variant="ghost" size="icon" className="h-8 w-8 rounded-[10px]" onClick={() => handleFeedback("不喜欢")}>
                  <ThumbsDown className="h-4 w-4" />
                </Button>
                <Button aria-label="添加会话备注" variant="ghost" size="icon" className="h-8 w-8 rounded-[10px]" onClick={() => setNotice("评论接口入口已预留。")}>
                  <MessageCircleMore className="h-4 w-4" />
                </Button>
            </div>
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-[#e5e7eb] bg-[linear-gradient(180deg,#ffffff,#fafafa)] px-8 pb-4 pt-4 backdrop-blur-xl">
          <div className="mx-auto max-w-[920px]">
            <TaskComposer
              key={`${run.id}-${currentComposerVersion}`}
              value={draft}
              onValueChange={setDraft}
              placeholder="继续追问，或通过 @ 选择要执行的数据源"
              mode={composerMode}
              onModeChange={(mode) =>
                setComposerModes((current) => ({
                  ...current,
                  [run.id]: mode,
                }))
              }
              templates={templates}
              selectedSourceIds={selectedSourceIds}
              onToolSelect={applyCapability}
              onSourceRemove={removeCapability}
              onTemplateSelect={applyTemplate}
              onFilesSelected={handleFilesSelected}
              onSubmit={() => {
                if (run.status !== "running") {
                  void appendNote();
                }
              }}
              containerClassName="overflow-visible rounded-[18px] border border-[#dde4ef] bg-[rgba(255,255,255,0.98)] shadow-[0_16px_36px_rgba(163,177,198,0.12)]"
              textareaClassName="min-h-[84px] max-h-[12em] min-w-[180px] flex-1 overflow-y-auto whitespace-pre-wrap break-words border-0 bg-transparent px-1 py-2 pr-2 text-[15px] leading-7 text-[#324357] caret-[#324357] outline-none shadow-none scrollbar-thin scrollbar-thumb-transparent hover:scrollbar-thumb-zinc-300 focus-visible:outline-none focus-visible:ring-0 focus-visible:[box-shadow:none!important]"
              sendButtonClassName="h-9 w-9 rounded-[10px]"
            />

            <div className="mt-3 text-center text-xs text-[#92a0b2]">内容由 AI 大模型生成，请仔细甄别</div>
          </div>
        </div>
      </div>
    </MoreDataShell>
  );
}
