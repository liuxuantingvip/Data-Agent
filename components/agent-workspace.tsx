"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronDown,
  FileText,
  Heart,
  ListRestart,
  MessageCircleMore,
  Share2,
  Star,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import { InlineNotice } from "@/components/inline-notice";
import { MoreDataShell } from "@/components/more-data-shell";
import { ReportPreviewPanel } from "@/components/report-preview-panel";
import { TaskComposer } from "@/components/task-composer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { homeCapabilityItems } from "@/lib/mock/demo-data";
import { demoActions, useDemoState } from "@/lib/mock/store";

type ExpandedMap = Record<string, boolean>;

function sanitizeObjective(value: string) {
  return value.replace(/(^|\s)@[^\s]*/g, " ").replace(/\s+/g, " ").trim();
}

export function AgentWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentRunId, reports, runs, templates } = useDemoState();
  const runId = searchParams.get("runId") ?? currentRunId;
  const run = runs.find((item) => item.id === runId) ?? runs[0];
  const report = reports.find((item) => item.id === run?.reportId) ?? reports[0];

  const [expanded, setExpanded] = useState<ExpandedMap>({});
  const [previewOverrides, setPreviewOverrides] = useState<Record<string, string | null>>({});
  const [panelVisibility, setPanelVisibility] = useState<Record<string, boolean>>({});
  const [composerModes, setComposerModes] = useState<Record<string, "普通模式" | "深度模式">>({});
  const [selectedSourceOverrides, setSelectedSourceOverrides] = useState<Record<string, string[]>>({});
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (run && currentRunId !== run.id) {
      demoActions.setCurrentRun(run.id);
    }
  }, [currentRunId, run]);

  const composerMode = composerModes[run.id] ?? (run.mode === "专业模式" ? "深度模式" : "普通模式");
  const selectedSourceIds = selectedSourceOverrides[run.id] ?? run.selectedCapabilities;
  const activePreview =
    (panelVisibility[run.id] ?? true)
      ? previewOverrides[run.id] ?? run.activePreviewId ?? null
      : null;

  const expandedState = useMemo(
    () => ({
      ...Object.fromEntries(run.sections.map((section) => [section.id, true])),
      ...expanded,
    }),
    [expanded, run.sections],
  );

  if (!run || !report) return null;

  const appendNote = () => {
    const value = sanitizeObjective(draft);
    if (!value) return;
    demoActions.appendRunFollowup(run.id, value);
    setDraft("");
    setNotice(`已根据“${value}”补充一轮 mock 分析，右侧预览与报告摘要已同步刷新。`);
  };

  const applyCapability = (capabilityId: string) => {
    const item = homeCapabilityItems.find((entry) => entry.id === capabilityId);
    if (!item) return;
    setSelectedSourceOverrides((current) => {
      const currentSources = current[run.id] ?? run.selectedCapabilities;
      return {
        ...current,
        [run.id]: currentSources.includes(item.id) ? currentSources : [...currentSources, item.id],
      };
    });
    setNotice(`已选择数据源「${item.label}」，可以继续补充追问后发送。`);
  };

  const removeCapability = (capabilityId: string) => {
    setSelectedSourceOverrides((current) => ({
      ...current,
      [run.id]: (current[run.id] ?? run.selectedCapabilities).filter((id) => id !== capabilityId),
    }));
  };

  const applyTemplate = (templateId: string) => {
    const template = templates.find((item) => item.id === templateId);
    if (!template) return;
    setDraft(template.body);
    setNotice(`已载入任务指令「${template.title}」。`);
  };

  const handleFilesSelected = (files: FileList) => {
    const names = Array.from(files).map((file) => file.name).join("、");
    setNotice(`已添加附件：${names}。`);
  };

  const saveTemplate = () => {
    const templateId = demoActions.saveTemplateFromRun(run.id);
    setNotice("当前任务已保存为模板，可直接继续转成定时任务。");
    router.push(`/templates?templateId=${templateId}`);
  };

  const goToReport = () => {
    router.push(`/report?reportId=${report.id}`);
  };

  const openSummaryCard = () => {
    setPreviewOverrides((current) => ({
      ...current,
      [run.id]: run.activePreviewId,
    }));
    setPanelVisibility((current) => ({
      ...current,
      [run.id]: true,
    }));
    goToReport();
  };

  const handleSaveArtifact = () => {
    const saved = demoActions.toggleArtifactForRun(run.id);
    setNotice(saved ? "当前结果已加入报告中心。" : "当前结果已从报告中心移除。");
  };

  const handleStar = () => {
    demoActions.toggleRunStar(run.id);
    setNotice(run.starred ? "已取消星标。" : "已将当前任务标记为重点。");
  };

  const handleShare = () => {
    setNotice("已生成 mock 分享结果。联调后可替换为真实分享链接。");
  };

  const handleFeedback = (kind: "喜欢" | "不喜欢" | "需要继续") => {
    setNotice(`已记录反馈：${kind}。如需提交问题，请使用左侧导航里的“问题反馈”。`);
  };

  return (
    <MoreDataShell
      currentPath="/agent"
      currentRunLabel={run.title}
      rightRail={
        activePreview ? (
          <ReportPreviewPanel
            previewId={activePreview}
            reportTitle={run.title}
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
      <div className="h-full overflow-auto">
        <div className="border-b border-[#e4e8f0] px-10 py-5">
          <div className="flex items-start gap-4 text-[15px] text-[#324357]">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <span className="font-medium">{run.title}</span>
                <span className="rounded-full border border-[#e4e4e7] bg-[#f4f4f5] px-2 py-1 text-xs text-[#3f3f46]">
                  {run.status === "success" ? "已完成" : "执行中"}
                </span>
              </div>
              <p className="mt-2 max-w-[760px] text-sm leading-7 text-[#718199]">{run.objective}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#7c8ba0]">
                <span>{run.startedAt}</span>
                <span>·</span>
                <span>{run.mode}</span>
                {run.selectedCapabilities.map((capability) => (
                  <span
                    key={capability}
                    className="rounded-full border border-[#dde4ef] bg-[#fbfcff] px-2 py-1 text-[#718199]"
                  >
                    {capability}
                  </span>
                ))}
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2 text-[#7e8da0]">
              <Button aria-label="分享当前任务" variant="ghost" size="icon" className="h-8 w-8 rounded-[10px]" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
              <Button aria-label="标记当前任务" variant="ghost" size="icon" className="h-8 w-8 rounded-[10px]" onClick={handleStar}>
                <Star className={`h-4 w-4 ${run.starred ? "fill-current text-[#6d81f5]" : ""}`} />
              </Button>
              <Button aria-label="收藏当前结果" variant="ghost" size="icon" className="h-8 w-8 rounded-[10px]" onClick={handleSaveArtifact}>
                <Heart className={`h-4 w-4 ${run.saved ? "fill-current text-[#ff8ca6]" : ""}`} />
              </Button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[980px] px-8 pb-10 pt-6">
          <div className="space-y-8">
            {notice ? <InlineNotice message={notice} /> : null}

            {run.sections.map((section) => (
              <div key={section.id} className="relative border-l border-[#e0e6f0] pl-6">
                <button
                  onClick={() =>
                    setExpanded((current) => ({ ...current, [section.id]: !current[section.id] }))
                  }
                  className="inline-flex items-center gap-2 font-[family:var(--font-jakarta)] text-[18px] font-semibold text-[#223248]"
                >
                  <span>{section.title}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-[#8b97a8] transition ${
                      expandedState[section.id] ? "" : "-rotate-90"
                    }`}
                  />
                </button>
                {expandedState[section.id] ? (
                  <>
                    <p className="mt-3 text-[15px] leading-8 text-[#6f8097]">{section.body}</p>
                    <div className="mt-5 space-y-3">
                      {section.tools.map((tool) => (
                        <Card
                          key={tool.id}
                          className="border-[#e1e6ef] bg-[linear-gradient(180deg,#ffffff,#f8faff)] shadow-[0_16px_34px_rgba(162,175,199,0.12)]"
                        >
                          <CardContent className="flex items-center justify-between gap-4 px-5 py-4">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 text-[#213248]">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[#dbe3ee] bg-[#f7f9fd]">
                                  <CubeLike />
                                </div>
                                <span className="font-medium">{tool.title}</span>
                                <span className="truncate text-sm text-[#7e8da0]">
                                  {tool.detail}（{tool.resultCount}）
                                </span>
                              </div>
                            </div>
                            <Button
                              onClick={() => {
                                demoActions.setActivePreview(run.id, tool.previewId);
                                setPreviewOverrides((current) => ({
                                  ...current,
                                  [run.id]: tool.previewId,
                                }));
                                setPanelVisibility((current) => ({
                                  ...current,
                                  [run.id]: true,
                                }));
                              }}
                              variant="outline"
                              className="rounded-[10px]"
                            >
                              查看
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            ))}

            <div className="border-l border-[#dce4f2] pl-6">
              <div className="font-[family:var(--font-jakarta)] text-[18px] font-semibold text-[#223248]">
                {run.summaryTitle}
              </div>
              <div
                role="button"
                tabIndex={0}
                onClick={openSummaryCard}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openSummaryCard();
                  }
                }}
                className="mt-4 block w-full cursor-pointer text-left focus:outline-none"
              >
                <Card className="border-[#dbe4f2] bg-[linear-gradient(180deg,#ffffff,#f8fbff)]">
                  <CardContent className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#18181b] text-white shadow-[0_12px_22px_rgba(24,24,27,0.14)]">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-[18px] font-semibold text-[#223248]">{run.summaryTitle}</div>
                        <div className="mt-1 text-sm text-[#76879d]">{report.title}</div>
                      </div>
                    </div>
                    <span className="rounded-[10px] border border-[#d6dce6] px-4 py-2 text-[14px] font-medium text-[#3c4c61]">
                      查看报告
                    </span>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="rounded-[20px] border border-[#dde4ef] bg-[linear-gradient(180deg,#ffffff,#f7f9fd)] p-6 shadow-[0_22px_48px_rgba(159,175,199,0.16)]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-sm uppercase tracking-[0.24em] text-[#8595aa]">Result Summary</div>
                  <p className="mt-3 max-w-[760px] text-[15px] leading-8 text-[#55687d]">{run.summaryBody}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="secondary" className="rounded-[10px]" onClick={saveTemplate}>
                    保存为模板
                  </Button>
                  <Button className="rounded-[10px]" onClick={goToReport}>
                    打开结果页
                  </Button>
                </div>
              </div>
            </div>

            {run.notes.length > 0 ? (
              <div className="space-y-4">
                {run.notes.map((note) => (
                  <Card key={note} className="border-[#e0e6ef] bg-[#fbfcff]">
                    <CardContent className="px-5 py-4 text-[15px] leading-8 text-[#5f6f84]">
                      继续追问：{note}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : null}

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
              <Button aria-label="添加会话备注" variant="ghost" size="icon" className="h-8 w-8 rounded-[10px]" onClick={() => setNotice("会话备注入口已预留，后续可联调评论接口。")}
              >
                <MessageCircleMore className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="sticky bottom-0 mt-8 bg-[linear-gradient(180deg,rgba(248,248,245,0),rgba(248,248,245,0.9)_18%,rgba(248,248,245,0.98))] pb-4 pt-6">
            <div className="overflow-hidden rounded-[18px] border border-[#dde4ef] bg-[rgba(255,255,255,0.94)] shadow-[0_16px_36px_rgba(163,177,198,0.18)] backdrop-blur-xl">
              <TaskComposer
                value={draft}
                onValueChange={setDraft}
                placeholder="继续追问，或输入 @ 补充数据源"
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
                onSubmit={appendNote}
                containerClassName="border-0 bg-transparent shadow-none"
                textareaClassName="min-h-[96px] resize-none border-0 bg-transparent px-1 py-2 text-[15px] leading-7 text-[#324357] placeholder:text-[#8d9cb0] shadow-none focus-visible:ring-0 focus-visible:[box-shadow:none!important]"
                sendButtonClassName="h-9 w-9 rounded-[10px]"
              />
              <div className="flex items-center justify-between border-t border-[#e8dfcf] bg-[linear-gradient(90deg,#fff8ed,#fff7ea,#f9f5ec)] px-5 py-2 text-xs text-[#a07f4f]">
                <span>当前为完整 mock 闭环演示，任务上下文、任务指令库、定时任务与报告中心已走同一状态流。</span>
                <button onClick={saveTemplate} className="font-medium text-[#8d6a34]">
                  保存模板
                </button>
              </div>
            </div>

            <div className="mt-4 text-center text-xs text-[#92a0b2]">内容由 AI 大模型生成，请仔细甄别</div>
          </div>
        </div>
      </div>
    </MoreDataShell>
  );
}

function CubeLike() {
  return <div className="h-3.5 w-3.5 rotate-45 rounded-[3px] border border-[#91a0b3]" />;
}
