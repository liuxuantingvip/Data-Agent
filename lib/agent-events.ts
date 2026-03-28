import type { AttachmentType } from "tdesign-web-components/lib/chatbot/core/type";
import type { SheetTab } from "@/lib/mock/demo-data";

export type AgentAttachmentStatus = "queued" | "accepted" | "referenced";
export type AgentAttachmentFileType = AttachmentType;

export type AgentAttachment = {
  id: string;
  name: string;
  size?: number;
  fileType?: AgentAttachmentFileType;
  extension?: string;
  status: AgentAttachmentStatus;
};

export type DataSourceChainStatus = "queued" | "running" | "success" | "error";

export type DataSourceChain = {
  id: string;
  roundId: string;
  sourceId: string;
  sourceLabel: string;
  status: DataSourceChainStatus;
  intent: string;
  progressText: string;
  resultCountText?: string;
  resultPreviewId?: string;
};

type ConversationNodeBase = {
  id: string;
  roundId: string;
  createdAt: string;
};

export type ConversationNode =
  | (ConversationNodeBase & {
      kind: "user_message";
      text: string;
    })
  | (ConversationNodeBase & {
      kind: "attachment_group";
      attachments: AgentAttachment[];
    })
  | (ConversationNodeBase & {
      kind: "assistant_thinking";
      text: string;
    })
  | (ConversationNodeBase & {
      kind: "assistant_loading";
      text: string;
    })
  | (ConversationNodeBase & {
      kind: "data_source_chain";
      chainId: string;
    })
  | (ConversationNodeBase & {
      kind: "assistant_stream";
      text: string;
      status: "streaming" | "complete";
    })
  | (ConversationNodeBase & {
      kind: "assistant_final";
      text: string;
    })
  | (ConversationNodeBase & {
      kind: "report_patch";
      summary: string[];
    })
  | (ConversationNodeBase & {
      kind: "error";
      message: string;
    });

export type AgentReportPatch = {
  previewKey: string;
  title: string;
  subtitle: string;
  generatedAt: string;
  mode: "sheet" | "report";
  summary: string[];
  sheetTabs: SheetTab[];
  sheetRows: string[][];
  summaryBody: string;
};

export type AgentRoundRuntimeEvent =
  | {
      type: "round_started";
      roundId: string;
    }
  | {
      type: "attachments_received";
      roundId: string;
      attachments: AgentAttachment[];
    }
  | {
      type: "thinking";
      roundId: string;
      text: string;
    }
  | {
      type: "loading";
      roundId: string;
      text: string;
    }
  | {
      type: "source_started";
      roundId: string;
      chain: DataSourceChain;
    }
  | {
      type: "source_progress";
      roundId: string;
      chainId: string;
      progressText: string;
    }
  | {
      type: "source_completed";
      roundId: string;
      chainId: string;
      progressText: string;
      resultCountText?: string;
      resultPreviewId?: string;
    }
  | {
      type: "delta";
      roundId: string;
      text: string;
    }
  | {
      type: "final";
      roundId: string;
      text: string;
    }
  | {
      type: "report_updated";
      roundId: string;
      patch: AgentReportPatch;
    }
  | {
      type: "round_completed";
      roundId: string;
    }
  | {
      type: "error";
      roundId: string;
      message: string;
    };
