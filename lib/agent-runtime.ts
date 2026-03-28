import type { AgentAttachment, AgentRoundRuntimeEvent, DataSourceChain } from "@/lib/agent-events";
import type { Report, TaskRun } from "@/lib/mock/store";
import { homeCapabilityItems, previewResults } from "@/lib/mock/demo-data";

export type AgentRunSnapshot = {
  run: TaskRun;
  report: Report;
};

export type AgentCreateRunInput = {
  objective: string;
  mode: TaskRun["mode"];
  selectedCapabilities: string[];
};

export type AgentRoundInput = {
  roundId: string;
  runId: string;
  prompt: string;
  mode: "普通模式" | "深度模式";
  selectedCapabilities: string[];
  attachments: AgentAttachment[];
  objective?: string;
  isInitialRound?: boolean;
};

const RUNTIME_MODE = process.env.NEXT_PUBLIC_AGENT_RUNTIME_MODE === "mock" ? "mock" : "api";
const API_BASE = process.env.NEXT_PUBLIC_AGENT_API_BASE_URL?.replace(/\/$/, "");
const capabilityLabelMap = new Map(homeCapabilityItems.map((item) => [item.id, item.label]));

export function isAgentRuntimeConfigured() {
  return Boolean(API_BASE);
}

export function isMockRuntimeEnabled() {
  return RUNTIME_MODE === "mock";
}

function getApiBase() {
  if (!API_BASE) {
    throw new Error("未配置会话后端接口：请设置 NEXT_PUBLIC_AGENT_API_BASE_URL");
  }
  return API_BASE;
}

async function parseJsonResponse<T>(response: Response) {
  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message || `请求失败：${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function createAgentRun(input: AgentCreateRunInput) {
  const base = getApiBase();
  const response = await fetch(`${base}/runs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  return parseJsonResponse<AgentRunSnapshot>(response);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getSourceLabel(sourceId: string) {
  return capabilityLabelMap.get(sourceId) ?? sourceId;
}

function pickPreviewKey(sourceId: string, index: number) {
  if (["amazon", "keepa", "store-scan", "walmart", "ebay"].includes(sourceId)) return "market-report";
  if (["jimu", "seller-sprite", "google"].includes(sourceId)) return "review-report";
  if (["web-search", "alibaba", "tiktok", "patent"].includes(sourceId)) return "competition-report";
  return previewResults[index % previewResults.length]?.id ?? "market-report";
}

function formatDate(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  const seconds = `${date.getSeconds()}`.padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function formatShortDate(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildFinalMarkdown(
  prompt: string,
  sourceLabels: string[],
  attachments: AgentAttachment[],
) {
  const lines = [
    `已完成本轮针对“${prompt}”的多逻辑链分析。`,
    sourceLabels.length > 0
      ? `本轮重点调取了 ${sourceLabels.join("、")}，分别验证市场、评论与竞争层面的关键信号。`
      : "本轮按默认数据源链完成了一次基础验证。",
    attachments.length > 0
      ? `已纳入附件 ${attachments.map((item) => item.name).join("、")} 的上下文，不是只基于页面数据给出结论。`
      : "当前结果不是静态摘要，而是按数据源链逐步汇总得出的结论。",
  ];
  return lines.join("\n\n");
}

function buildStreamChunks(prompt: string, sourceLabels: string[], attachments: AgentAttachment[]) {
  const chunks = [
    `先按 ${sourceLabels.join("、") || "默认数据源"} 拆开核对关键信号，`,
    "再把市场需求、评论反馈和竞争密度放到同一轮判断里，",
    attachments.length > 0
      ? `并结合附件 ${attachments.map((item) => item.name).join("、")} 里的上下文补充约束，`
      : "避免只给单一数据源下的片面结论，",
    `最后围绕“${prompt}”收敛成一版可继续追问的结果。`,
  ];
  return chunks;
}

function buildReportPatch(prompt: string, sourceLabels: string[], attachments: AgentAttachment[]) {
  const previewKey = sourceLabels.length > 1 ? "market-report" : sourceLabels[0]?.includes("极目") ? "review-report" : "competition-report";
  const base = previewResults.find((item) => item.id === previewKey) ?? previewResults[0];
  return {
    previewKey,
    title: prompt.length > 24 ? `${prompt.slice(0, 24)}...` : prompt,
    subtitle: `最后生成时间：${formatShortDate()} · ${sourceLabels.join("、") || "默认数据源"}`,
    generatedAt: formatDate(),
    mode: base.mode,
    summary: [
      `本轮以 ${sourceLabels.join("、") || "默认数据源"} 为主线完成了多逻辑链执行。`,
      attachments.length > 0
        ? `已结合附件 ${attachments.map((item) => item.name).join("、")} 做上下文校正。`
        : "当前结果已经具备继续追问的上下文承接能力。",
      `围绕“${prompt}”的关键判断已同步写入右侧结果快照。`,
    ],
    sheetTabs: base.sheetTabs.map((tab) => ({ ...tab })),
    sheetRows: base.sheetRows.map((row) => [...row]),
    summaryBody: `系统已按 ${sourceLabels.join("、") || "默认数据源"} 并行完成多逻辑链分析，并将结果同步到当前会话与右侧预览。`,
  };
}

function buildMockChains(input: AgentRoundInput): DataSourceChain[] {
  const sources = input.selectedCapabilities.length > 0 ? input.selectedCapabilities : ["amazon"];
  return sources.map((sourceId, index) => ({
    id: `${input.roundId}-chain-${index + 1}`,
    roundId: input.roundId,
    sourceId,
    sourceLabel: getSourceLabel(sourceId),
    status: "queued",
    intent: `围绕“${input.prompt}”查询 ${getSourceLabel(sourceId)} 的结构化结果。`,
    progressText: "等待启动数据源链...",
    resultPreviewId: pickPreviewKey(sourceId, index),
  }));
}

async function runMockRound(
  input: AgentRoundInput,
  handlers: {
    onEvent: (event: AgentRoundRuntimeEvent) => void;
  },
) {
  const chains = buildMockChains(input);
  const sourceLabels = chains.map((item) => item.sourceLabel);
  handlers.onEvent({ type: "round_started", roundId: input.roundId });
  await sleep(160);

  if (input.attachments.length > 0) {
    handlers.onEvent({
      type: "attachments_received",
      roundId: input.roundId,
      attachments: input.attachments.map((item) => ({ ...item, status: "accepted" })),
    });
    await sleep(120);
  }

  await sleep(220);

  for (const [index, chain] of chains.entries()) {
    handlers.onEvent({
      type: "source_started",
      roundId: input.roundId,
      chain: { ...chain, status: "running", progressText: `已连接 ${chain.sourceLabel}，开始查询。` },
    });
    await sleep(180);
    handlers.onEvent({
      type: "source_progress",
      roundId: input.roundId,
      chainId: chain.id,
      progressText: `正在整理 ${chain.sourceLabel} 返回的数据结构和关键字段。`,
    });
    await sleep(180);
    handlers.onEvent({
      type: "source_completed",
      roundId: input.roundId,
      chainId: chain.id,
      progressText: `${chain.sourceLabel} 已返回可用结果，等待与其他链路汇总。`,
      resultCountText: index === 0 ? "返回 50 条数据" : index === 1 ? "返回 60 条数据" : "返回 1 组结果",
      resultPreviewId: chain.resultPreviewId,
    });
    await sleep(120);
  }

  const chunks = buildStreamChunks(input.prompt, sourceLabels, input.attachments);
  for (const chunk of chunks) {
    handlers.onEvent({
      type: "delta",
      roundId: input.roundId,
      text: chunk,
    });
    await sleep(160);
  }

  handlers.onEvent({
    type: "final",
    roundId: input.roundId,
    text: buildFinalMarkdown(input.prompt, sourceLabels, input.attachments),
  });
  await sleep(120);

  handlers.onEvent({
    type: "report_updated",
    roundId: input.roundId,
    patch: buildReportPatch(input.prompt, sourceLabels, input.attachments),
  });
  await sleep(80);

  handlers.onEvent({
    type: "round_completed",
    roundId: input.roundId,
  });
}

function readSSEChunk(buffer: string) {
  const parts = buffer.split("\n\n");
  return {
    completed: parts.slice(0, -1),
    rest: parts.at(-1) ?? "",
  };
}

function parseEventBlock(block: string) {
  const lines = block.split("\n").filter(Boolean);
  let event = "message";
  const dataLines: string[] = [];

  lines.forEach((line) => {
    if (line.startsWith("event:")) {
      event = line.slice(6).trim();
      return;
    }
    if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trim());
    }
  });

  if (dataLines.length === 0) return null;
  const raw = dataLines.join("\n");

  try {
    const payload = JSON.parse(raw) as Record<string, unknown>;
    if (event === "thinking") return { type: "thinking", text: String(payload.text ?? "") } as const;
    if (event === "delta") return { type: "delta", text: String(payload.text ?? "") } as const;
    if (event === "complete") return { type: "complete", snapshot: payload.snapshot as AgentRunSnapshot | undefined } as const;
    if (event === "error") return { type: "error", message: String(payload.message ?? "后端返回错误") } as const;
  } catch {
    if (event === "delta") return { type: "delta", text: raw } as const;
    if (event === "thinking") return { type: "thinking", text: raw } as const;
    if (event === "error") return { type: "error", message: raw } as const;
  }

  return null;
}

async function runApiRound(
  input: AgentRoundInput,
  handlers: {
    onEvent: (event: AgentRoundRuntimeEvent) => void;
  },
) {
  const base = getApiBase();
  const response = await fetch(`${base}/runs/${input.runId}/followups/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      runId: input.runId,
      prompt: input.prompt,
      mode: input.mode,
      selectedCapabilities: input.selectedCapabilities,
      attachments: input.attachments,
    }),
  });

  if (!response.ok || !response.body) {
    const message = await response.text().catch(() => "");
    throw new Error(message || `流式请求失败：${response.status}`);
  }

  handlers.onEvent({ type: "round_started", roundId: input.roundId });
  if (input.attachments.length > 0) {
    handlers.onEvent({
      type: "attachments_received",
      roundId: input.roundId,
      attachments: input.attachments.map((item) => ({ ...item, status: "accepted" })),
    });
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const { completed, rest } = readSSEChunk(buffer);
    buffer = rest;

    completed.forEach((block) => {
      const event = parseEventBlock(block);
      if (!event) return;
      if (event.type === "thinking") {
        handlers.onEvent({ type: "thinking", roundId: input.roundId, text: event.text });
      }
      if (event.type === "delta") {
        handlers.onEvent({ type: "delta", roundId: input.roundId, text: event.text });
      }
      if (event.type === "complete") {
        if (event.snapshot?.report) {
          handlers.onEvent({
            type: "report_updated",
            roundId: input.roundId,
            patch: {
              previewKey: event.snapshot.report.previewKey,
              title: event.snapshot.report.title,
              subtitle: event.snapshot.report.subtitle,
              generatedAt: event.snapshot.report.generatedAt,
              mode: event.snapshot.report.mode,
              summary: [...event.snapshot.report.summary],
              sheetTabs: event.snapshot.report.sheetTabs.map((tab) => ({ ...tab })),
              sheetRows: event.snapshot.report.sheetRows.map((row) => [...row]),
              summaryBody: `后端已返回本轮结果，并同步刷新当前预览。`,
            },
          });
          handlers.onEvent({
            type: "final",
            roundId: input.roundId,
            text: buildFinalMarkdown(input.prompt, input.selectedCapabilities.map(getSourceLabel), input.attachments),
          });
          handlers.onEvent({ type: "round_completed", roundId: input.roundId });
        }
      }
      if (event.type === "error") {
        throw new Error(event.message);
      }
    });
  }
}

export async function streamAgentRound(
  input: AgentRoundInput,
  handlers: {
    onEvent: (event: AgentRoundRuntimeEvent) => void;
  },
) {
  if (isMockRuntimeEnabled()) {
    await runMockRound(input, handlers);
    return;
  }
  await runApiRound(input, handlers);
}
