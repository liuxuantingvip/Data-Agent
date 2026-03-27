"use client";

import { useSyncExternalStore } from "react";

import {
  conversationSections,
  favoriteItems,
  homeCapabilityItems,
  previewResults,
  promptCards,
  resultSummaryTitle,
  runRecords,
  scheduleItems,
  workspaceName,
  type ConversationSection,
  type FavoriteItem,
  type PromptCard,
  type ResultPreview,
  type RunRecord,
  type ScheduleItem,
} from "@/lib/mock/demo-data";

export type TaskDraft = {
  id: string;
  objective: string;
  mode: "专业模式" | "轻量模式";
  selectedCapabilities: string[];
  createdAt: string;
};

export type TaskRun = {
  id: string;
  taskDraftId: string;
  reportId: string;
  title: string;
  objective: string;
  mode: "专业模式" | "轻量模式";
  selectedCapabilities: string[];
  status: "running" | "success";
  startedAt: string;
  sections: ConversationSection[];
  notes: string[];
  activePreviewId: string;
  summaryTitle: string;
  summaryBody: string;
  saved: boolean;
  starred: boolean;
};

export type Report = ResultPreview & {
  runId: string;
  generatedAt: string;
};

export type Template = PromptCard & {
  sourceRunId?: string;
  summary?: string;
};

export type Workflow = ScheduleItem & {
  templateId: string;
  description: string;
};

export type Artifact = FavoriteItem & {
  sourceRunId: string;
  reportId: string;
};

export type RunRecordEntry = RunRecord & {
  runId: string;
  reportId: string;
};

type DemoState = {
  workspaceName: string;
  taskDrafts: TaskDraft[];
  runs: TaskRun[];
  reports: Report[];
  templates: Template[];
  workflows: Workflow[];
  artifacts: Artifact[];
  runRecords: RunRecordEntry[];
  currentRunId: string;
};

const previewCatalog = previewResults.map((preview) => preview.id);

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
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

function toRunTitle(objective: string) {
  const cleaned = objective.replace(/\s+/g, " ").trim();
  if (!cleaned) return "新的研究任务";
  return cleaned.length > 24 ? `${cleaned.slice(0, 24)}...` : cleaned;
}

function toCapabilityIds(objective: string) {
  const lower = objective.toLowerCase();
  return homeCapabilityItems
    .filter((item) => lower.includes(item.label.toLowerCase()) || lower.includes(item.id))
    .slice(0, 3)
    .map((item) => item.id);
}

function buildSummaryLines(objective: string, note?: string) {
  const short = toRunTitle(objective);
  const lines = [
    `围绕“${short}”的任务目标，系统已整合市场需求、竞品结构和评论信号，形成可直接继续行动的研究结论。`,
    "当前报告保留了高价值的市场变化、评论痛点和竞争概览，便于继续追问或转为周期性监控。",
    "建议下一步围绕更具体的型号词、价格带或重点平台继续深挖，以缩小决策范围。",
  ];
  if (note) {
    lines.unshift(`已根据补充要求“${note}”追加一轮细化分析，并同步更新本次报告重点。`);
  }
  return lines;
}

function buildSummaryBody(objective: string, note?: string) {
  const short = toRunTitle(objective);
  const suffix = note
    ? `最新一轮补充要求为“${note}”，已将相关变化写入结果摘要。`
    : "当前结果适合进一步转成模板或定时任务。";
  return `任务“${short}”已完成 mock 执行编排，系统整理了市场、评论和竞争三类信息，并生成统一结果视图。${suffix}`;
}

function buildSections(objective: string, note?: string): ConversationSection[] {
  const short = toRunTitle(objective);
  const sections = conversationSections.map((section, index) => {
    if (index === 0) {
      return {
        ...section,
        body: `我将围绕“${short}”优先抓取市场需求与竞争变化，确认这轮任务的核心判断。`,
      };
    }

    if (index === 1) {
      return {
        ...section,
        body: `接下来补评论与用户反馈，判断“${short}”对应方向的真实需求和常见痛点。`,
      };
    }

    return {
      ...section,
      body: `最后补竞品数量与供需概览，帮助您评估“${short}”是否适合继续推进。`,
    };
  });

  if (!note) return sections;

  const nextPreview = previewCatalog[(previewCatalog.indexOf("market-report") + 1) % previewCatalog.length];
  return [
    ...sections,
    {
      id: createId("section"),
      title: `补充执行：${toRunTitle(note)}`,
      body: `已根据您的补充要求“${note}”继续细化任务，并将新的判断写入报告摘要和右侧结果预览。`,
      tools: [
        {
          id: createId("tool"),
          title: "继续执行",
          detail: `补充约束“${note}”，重新整理结果重点与建议动作。`,
          resultCount: "新增 1 组结果",
          previewId: nextPreview,
        },
      ],
    },
  ];
}

function buildReport(runId: string, objective: string, note?: string): Report {
  const base = previewResults[0];
  return {
    ...base,
    id: createId("report"),
    runId,
    title: toRunTitle(objective),
    subtitle: `最后生成时间：${formatShortDate()} · ${objective.slice(0, 26)}`,
    generatedAt: formatDate(),
    summary: buildSummaryLines(objective, note),
    sheetRows: [...base.sheetRows],
    sheetTabs: [...base.sheetTabs],
  };
}

function buildArtifact(run: TaskRun, report: Report): Artifact {
  return {
    id: createId("artifact"),
    title: run.title,
    body: run.objective,
    scope: "全部",
    type: report.mode === "sheet" ? "表格" : "报告",
    createdAt: formatDate(),
    sourceRunId: run.id,
    reportId: report.id,
  };
}

function buildRunRecord(run: TaskRun, report: Report): RunRecordEntry {
  return {
    id: createId("record"),
    runId: run.id,
    reportId: report.id,
    title: run.title,
    startedAt: run.startedAt,
    result: `生成 1 份${report.mode === "sheet" ? "结构化表格" : "结构化报告"}`,
    status: "成功",
  };
}

function buildRunFromObjective(
  objective: string,
  mode: TaskDraft["mode"],
  selectedCapabilities: string[],
) {
  const taskDraftId = createId("task");
  const runId = createId("run");
  const title = toRunTitle(objective);
  const report = buildReport(runId, objective);
  const run: TaskRun = {
    id: runId,
    taskDraftId,
    reportId: report.id,
    title,
    objective,
    mode,
    selectedCapabilities,
    status: "success",
    startedAt: formatDate(),
    sections: buildSections(objective),
    notes: [],
    activePreviewId: "market-report",
    summaryTitle: resultSummaryTitle,
    summaryBody: buildSummaryBody(objective),
    saved: false,
    starred: false,
  };
  const taskDraft: TaskDraft = {
    id: taskDraftId,
    objective,
    mode,
    selectedCapabilities,
    createdAt: run.startedAt,
  };
  return { taskDraft, run, report };
}

function createInitialState(): DemoState {
  const objective =
    "请帮我做一份美国站 keyboard tablet case 赛道调研，输出 3 个值得切入的机会方向，并说明需求信号、竞争强度和下一步建议。";
  const secondaryObjective = "监控关键词并分析";
  const taskDraft: TaskDraft = {
    id: "task-default",
    objective,
    mode: "专业模式",
    selectedCapabilities: ["amazon", "jimu", "web-search"],
    createdAt: "2026-03-24 10:00:00",
  };
  const report: Report = {
    ...previewResults[0],
    id: "report-default",
    runId: "run-default",
    title: "美国站 keyboard tablet case 赛道调研",
    subtitle: "最后生成时间：2026-03-24 · 美国站 keyboard tablet case 赛道调研",
    generatedAt: "2026-03-24 10:08:00",
    summary: buildSummaryLines(objective),
    sheetRows: [...previewResults[0].sheetRows],
    sheetTabs: [...previewResults[0].sheetTabs],
  };
  const initialRun: TaskRun = {
    id: "run-default",
    taskDraftId: taskDraft.id,
    reportId: report.id,
    title: report.title,
    objective,
    mode: taskDraft.mode,
    selectedCapabilities: taskDraft.selectedCapabilities,
    status: "success",
    startedAt: taskDraft.createdAt,
    sections: buildSections(objective),
    notes: [],
    activePreviewId: "market-report",
    summaryTitle: resultSummaryTitle,
    summaryBody: buildSummaryBody(objective),
    saved: true,
    starred: false,
  };
  const secondaryReport: Report = {
    ...previewResults[0],
    id: "report-secondary",
    runId: "run-secondary",
    title: secondaryObjective,
    subtitle: `最后生成时间：2026-03-25 · ${secondaryObjective}`,
    generatedAt: "2026-03-25 14:18:00",
    summary: buildSummaryLines(secondaryObjective),
    sheetRows: [...previewResults[0].sheetRows],
    sheetTabs: [...previewResults[0].sheetTabs],
  };
  const secondaryRun: TaskRun = {
    id: "run-secondary",
    taskDraftId: "task-secondary",
    reportId: secondaryReport.id,
    title: secondaryObjective,
    objective: secondaryObjective,
    mode: "专业模式",
    selectedCapabilities: ["seller-sprite", "google", "web-search"],
    status: "success",
    startedAt: "2026-03-25 14:10:00",
    sections: buildSections(secondaryObjective),
    notes: [],
    activePreviewId: "market-report",
    summaryTitle: resultSummaryTitle,
    summaryBody: buildSummaryBody(secondaryObjective),
    saved: false,
    starred: false,
  };
  const defaultRecord: RunRecordEntry = {
    id: "record-default",
    runId: initialRun.id,
    reportId: report.id,
    title: initialRun.title,
    startedAt: initialRun.startedAt,
    result: "生成 1 份结构化表格",
    status: "成功",
  };
  const defaultArtifact: Artifact = {
    id: "artifact-default",
    title: initialRun.title,
    body: initialRun.objective,
    scope: "全部",
    type: "表格",
    createdAt: "2026-03-24 10:10:00",
    sourceRunId: initialRun.id,
    reportId: report.id,
  };

  return {
    workspaceName,
    taskDrafts: [
      taskDraft,
      {
        id: "task-secondary",
        objective: secondaryObjective,
        mode: "专业模式",
        selectedCapabilities: ["seller-sprite", "google", "web-search"],
        createdAt: "2026-03-25 14:10:00",
      },
    ],
    runs: [secondaryRun, initialRun],
    reports: [secondaryReport, report],
    templates: promptCards.map((item) => ({ ...item })),
    workflows: scheduleItems.map((item, index) => ({
      ...item,
      templateId: promptCards[index % promptCards.length]?.id ?? "p1",
      description: "围绕市场变化、评论信号和竞争概览形成一条可复用监控链路。",
    })),
    artifacts: [
      defaultArtifact,
      ...favoriteItems.map((item, index) => ({
        ...item,
        id: `artifact-seed-${index + 1}`,
        sourceRunId: initialRun.id,
        reportId: report.id,
      })),
    ],
    runRecords: [
      defaultRecord,
      ...runRecords.map((item, index) => ({
        ...item,
        id: `record-seed-${index + 1}`,
        runId: initialRun.id,
        reportId: report.id,
      })),
    ],
    currentRunId: initialRun.id,
  };
}

function readStoredState() {
  return createInitialState();
}

let state = readStoredState();
const listeners = new Set<() => void>();

function emit(nextState: DemoState) {
  state = nextState;
  listeners.forEach((listener) => listener());
}

function updateState(updater: (current: DemoState) => DemoState) {
  emit(updater(state));
}

function cloneWorkflowFromTemplate(template: Template): Workflow {
  return {
    id: createId("workflow"),
    templateId: template.id,
    title: `${template.title} · 周期执行`,
    frequency: "每周一 09:00",
    nextRun: `${formatShortDate()} 09:00`,
    status: "运行中",
    scope: template.scope,
    description: "按模板持续检查市场变化，并把结果同步为结构化产物。",
  };
}

function createTemplateFromInput(input: {
  title: string;
  body: string;
  scope?: Template["scope"];
  sourceRunId?: string;
  summary?: string;
}): Template {
  return {
    id: createId("template"),
    title: input.title.trim(),
    body: input.body.trim(),
    scope: input.scope ?? "默认",
    createdAt: formatDate(),
    sourceRunId: input.sourceRunId,
    summary: input.summary?.trim(),
  };
}

function createWorkflowFromInput(input: {
  templateId: string;
  title: string;
  prompt: string;
  frequency: string;
  nextRun: string;
  scope?: Workflow["scope"];
  status?: Workflow["status"];
}): Workflow {
  return {
    id: createId("workflow"),
    templateId: input.templateId,
    title: input.title.trim(),
    frequency: input.frequency,
    nextRun: input.nextRun,
    status: input.status ?? "运行中",
    scope: input.scope ?? "默认",
    description: input.prompt.trim(),
  };
}

export const demoStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    return state;
  },
};

export function useDemoState() {
  return useSyncExternalStore(demoStore.subscribe, demoStore.getSnapshot, demoStore.getSnapshot);
}

export const demoActions = {
  startTaskRun(input: {
    objective: string;
    mode: TaskDraft["mode"];
    selectedCapabilities?: string[];
  }) {
    const objective = input.objective.trim();
    const selectedCapabilities = input.selectedCapabilities?.length
      ? input.selectedCapabilities
      : toCapabilityIds(objective);
    const { taskDraft, run, report } = buildRunFromObjective(objective, input.mode, selectedCapabilities);

    updateState((current) => ({
      ...current,
      taskDrafts: [taskDraft, ...current.taskDrafts],
      runs: [run, ...current.runs],
      reports: [report, ...current.reports],
      runRecords: [buildRunRecord(run, report), ...current.runRecords],
      currentRunId: run.id,
    }));

    return run.id;
  },

  setCurrentRun(runId: string) {
    updateState((current) => ({ ...current, currentRunId: runId }));
  },

  setActivePreview(runId: string, previewId: string) {
    updateState((current) => ({
      ...current,
      runs: current.runs.map((run) =>
        run.id === runId ? { ...run, activePreviewId: previewId } : run,
      ),
    }));
  },

  appendRunFollowup(runId: string, note: string) {
    const value = note.trim();
    if (!value) return null;

    let nextReportId = "";
    updateState((current) => {
      const targetRun = current.runs.find((run) => run.id === runId);
      if (!targetRun) return current;

      const nextPreview =
        previewCatalog[
          (previewCatalog.indexOf(targetRun.activePreviewId) + 1 + previewCatalog.length) %
            previewCatalog.length
        ] ?? "market-report";

      const nextRuns = current.runs.map((run) =>
        run.id === runId
          ? {
              ...run,
              notes: [...run.notes, value],
              sections: buildSections(run.objective, value),
              activePreviewId: nextPreview,
              summaryBody: buildSummaryBody(run.objective, value),
            }
          : run,
      );

      const nextReports = current.reports.map((report) => {
        if (report.runId !== runId) return report;
        nextReportId = report.id;
        return {
          ...report,
          generatedAt: formatDate(),
          subtitle: `最后生成时间：${formatShortDate()} · 已补充 ${toRunTitle(value)}`,
          summary: buildSummaryLines(targetRun.objective, value),
        };
      });

      return {
        ...current,
        runs: nextRuns,
        reports: nextReports,
      };
    });

    return nextReportId;
  },

  toggleRunStar(runId: string) {
    updateState((current) => ({
      ...current,
      runs: current.runs.map((run) =>
        run.id === runId ? { ...run, starred: !run.starred } : run,
      ),
    }));
  },

  toggleArtifactForRun(runId: string) {
    let saved = false;

    updateState((current) => {
      const existing = current.artifacts.find((artifact) => artifact.sourceRunId === runId);
      const run = current.runs.find((item) => item.id === runId);
      const report = current.reports.find((item) => item.runId === runId);
      if (!run || !report) return current;

      if (existing) {
        saved = false;
        return {
          ...current,
          artifacts: current.artifacts.filter((artifact) => artifact.sourceRunId !== runId),
          runs: current.runs.map((item) =>
            item.id === runId ? { ...item, saved: false } : item,
          ),
        };
      }

      saved = true;
      const artifact = buildArtifact(run, report);
      return {
        ...current,
        artifacts: [artifact, ...current.artifacts],
        runs: current.runs.map((item) =>
          item.id === runId ? { ...item, saved: true } : item,
        ),
      };
    });

    return saved;
  },

  saveTemplateFromRun(runId: string) {
    let templateId = "";
    updateState((current) => {
      const existing = current.templates.find((template) => template.sourceRunId === runId);
      if (existing) {
        templateId = existing.id;
        return current;
      }

      const run = current.runs.find((item) => item.id === runId);
      if (!run) return current;

      const template: Template = {
        id: createId("template"),
        sourceRunId: runId,
        title: `${run.title} 模板`,
        body: `${run.objective}\n\n输出结构化报告，包含市场变化、评论痛点和下一步建议。`,
        scope: "全部",
        createdAt: formatDate(),
      };
      templateId = template.id;

      return {
        ...current,
        templates: [template, ...current.templates],
      };
    });

    return templateId;
  },

  createTemplate(input: {
    title: string;
    body: string;
    scope?: Template["scope"];
    sourceRunId?: string;
    summary?: string;
  }) {
    const template = createTemplateFromInput(input);
    updateState((current) => ({
      ...current,
      templates: [template, ...current.templates],
    }));
    return template.id;
  },

  createWorkflowFromTemplate(templateId: string) {
    let workflowId = "";
    updateState((current) => {
      const existing = current.workflows.find((workflow) => workflow.templateId === templateId);
      if (existing) {
        workflowId = existing.id;
        return current;
      }

      const template = current.templates.find((item) => item.id === templateId);
      if (!template) return current;

      const workflow = cloneWorkflowFromTemplate(template);
      workflowId = workflow.id;

      return {
        ...current,
        workflows: [workflow, ...current.workflows],
      };
    });

    return workflowId;
  },

  createWorkflow(input: {
    templateId: string;
    title: string;
    prompt: string;
    frequency: string;
    nextRun: string;
    scope?: Workflow["scope"];
    status?: Workflow["status"];
  }) {
    const workflow = createWorkflowFromInput(input);
    updateState((current) => ({
      ...current,
      workflows: [workflow, ...current.workflows],
    }));
    return workflow.id;
  },
};
