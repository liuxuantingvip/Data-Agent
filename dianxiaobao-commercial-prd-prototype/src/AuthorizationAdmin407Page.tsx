import {
  Badge,
  Button,
  DatePicker,
  Descriptions,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popover,
  Radio,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CloseOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  RightOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import type { Key, ReactNode } from "react";
import { useState } from "react";

const { RangePicker } = DatePicker;

type ConnectorProductLineKey = "ecommerce" | "crossBorder" | "bank";
type EcosystemName = "取数宝" | "钉钉" | "飞书" | "企微" | "联通" | "电信";
type AuthDrawerProduct =
  | "mallConnector"
  | "crossBorderConnector"
  | "bankConnector"
  | "cateringConnector"
  | "phoneConnector"
  | "robotToken"
  | "cloudPhone"
  | "cloudDesk";
type AuthStatus = "生效中" | "部分已过期" | "已过期" | "待生效" | "已删除";
type AuthResourceLifecycleStatus = "buffer" | "released" | "expired";
type AuthResourceValue = {
  name: string;
  period: string;
  durationMonth?: number;
  lifecycleStatus?: AuthResourceLifecycleStatus;
  bufferEndsAt?: string;
  released?: boolean;
};
type AuthQuantitySummary = {
  totalQty: number;
  currentUsableQty: number;
  pendingQty?: number;
  expiredQty?: number;
  bufferQty?: number;
  releasedQty?: number;
  note?: string;
};
type AuthTableRecord = {
  key: string;
  tenantName?: string;
  product: string;
  ecosystem?: EcosystemName;
  products?: string[];
  productKeys?: AuthDrawerProduct[];
  productPeriods?: string[];
  period: string;
  authType?: string;
  updater: string;
  updateTime: string;
  createTime?: string;
  creator: string;
  status?: AuthStatus;
  productKey?: AuthDrawerProduct;
  qty?: number;
  quantitySummary?: AuthQuantitySummary;
  children?: AuthTableRecord[];
};

type BatchPeriodFailure = {
  key: string;
  resourceName: string;
  currentStatus: string;
  reason: string;
  nextStep: string;
};

interface InteractionNote {
  number: string;
  title: string;
  placement?: "top" | "bottom" | "left" | "right" | "bottomLeft" | "topLeft";
  sections: Array<{ label: string; text: string }>;
}

const interactionNotes: Record<"ecosystemFilter" | "ecosystemColumn", InteractionNote> = {
  ecosystemFilter: {
    number: "2.1",
    title: "所属生态筛选",
    placement: "bottomLeft",
    sections: [
      {
        label: "页面功能说明",
        text: "用于按租户所属生态筛选租户授权记录，支持取数宝、钉钉、飞书、企微、联通、电信。",
      },
      {
        label: "元素交互行为",
        text: "点击下拉选择生态后立即刷新表格；清空后恢复全部生态租户。",
      },
      {
        label: "状态表现",
        text: "选中态展示生态名称；无匹配数据时表格进入 Ant Design 空态。",
      },
      {
        label: "反馈机制",
        text: "筛选不额外弹 Toast，结果通过表格数据和分页总数即时反馈。",
      },
      {
        label: "用户操作流程",
        text: "选择所属生态 -> 查看该生态租户 -> 可继续组合租户名称、授权产品、日期等条件筛选。",
      },
      {
        label: "边界与异常状态",
        text: "仅筛选租户父级生态，不改变租户授权明细、授权数量和开通状态。",
      },
    ],
  },
  ecosystemColumn: {
    number: "2.2",
    title: "所属生态字段",
    placement: "top",
    sections: [
      {
        label: "页面功能说明",
        text: "在租户维度展示租户所属生态，帮助运营区分取数宝存量租户与店小宝钉钉租户。",
      },
      {
        label: "元素交互行为",
        text: "字段只读展示，不支持单元格内编辑；展开授权明细后子行继承父级生态，不重复展示。",
      },
      {
        label: "状态表现",
        text: "所属生态直接以纯文本展示，不使用 Tag，避免和授权状态、产品状态混淆。",
      },
      {
        label: "反馈机制",
        text: "生态字段随筛选结果同步刷新，分页总数按筛选后的租户数量计算。",
      },
      {
        label: "用户操作流程",
        text: "运营进入租户管理 -> 通过所属生态列识别租户来源 -> 展开查看该租户授权明细。",
      },
      {
        label: "边界与异常状态",
        text: "生态为空时展示空占位；本期 mock 中钉钉租户使用店小宝资源组合，取数宝租户保留原授权结构。",
      },
    ],
  },
};

function renderInteractionText(text: string): ReactNode {
  return text;
}

function InteractionMarker({
  noteId,
  className,
}: {
  noteId: keyof typeof interactionNotes;
  className?: string;
}) {
  const note = interactionNotes[noteId];

  return (
    <Popover
      trigger={["hover", "click"]}
      placement={note.placement || "top"}
      overlayClassName="interaction-tooltip-popover"
      content={
        <div className="interaction-tooltip">
          <div className="interaction-tooltip-title">
            <Badge
              className="interaction-marker interaction-tooltip-badge"
              count={note.number}
            />
            <strong>{note.title}</strong>
          </div>
          {note.sections.map((section) => (
            <div className="interaction-tooltip-section" key={section.label}>
              <div className="interaction-tooltip-section-label">
                {section.label}
              </div>
              <div className="interaction-tooltip-section-body">
                <p>{renderInteractionText(section.text)}</p>
              </div>
            </div>
          ))}
        </div>
      }
    >
      <button
        className={`interaction-marker-trigger ${className || ""}`}
        type="button"
        aria-label={`${note.number} ${note.title}`}
      >
        <Badge className="interaction-marker" count={note.number} />
      </button>
    </Popover>
  );
}

export default function AuthorizationAdmin407Page() {
  const [messageApi, contextHolder] = message.useMessage();
  const [authDrawerOpen, setAuthDrawerOpen] = useState(false);
  const [authDrawerTitle, setAuthDrawerTitle] = useState("新增授权");
  const [authDetailRecord, setAuthDetailRecord] =
    useState<AuthTableRecord | null>(null);
  const [deletedAuthKeys, setDeletedAuthKeys] = useState<string[]>([]);
  const [deletedAuthSnapshots, setDeletedAuthSnapshots] = useState<
    Record<string, { status?: AuthStatus; currentUsableQty?: number }>
  >({});
  const [connectorNoCandidateKeys, setConnectorNoCandidateKeys] = useState<
    string[]
  >([]);
  const [editingAuthRecord, setEditingAuthRecord] =
    useState<AuthTableRecord | null>(null);
  const [authDrawerProduct, setAuthDrawerProduct] =
    useState<AuthDrawerProduct>("cloudPhone");
  const [expandedAuthTenantKeys, setExpandedAuthTenantKeys] = useState<Key[]>(
    [],
  );
  const [drawerAddedProducts, setDrawerAddedProducts] = useState<
    AuthDrawerProduct[]
  >([]);
  const [drawerProductQty, setDrawerProductQty] = useState<
    Record<string, number>
  >({});
  const [drawerProductDates, setDrawerProductDates] = useState<
    Record<string, [Dayjs | null, Dayjs | null]>
  >({});
  const [drawerTenantInput, setDrawerTenantInput] = useState("");
  const [drawerTenantInfo, setDrawerTenantInfo] = useState<{
    id: string;
    name: string;
    admin: string;
  } | null>(null);
  const [drawerResourceDates, setDrawerResourceDates] = useState<
    Record<string, [Dayjs | null, Dayjs | null]>
  >({});
  const [batchPeriodTarget, setBatchPeriodTarget] = useState<{
    recordKey: string;
    productKey: AuthDrawerProduct;
  } | null>(null);
  const [batchPeriodDates, setBatchPeriodDates] = useState<
    [Dayjs | null, Dayjs | null]
  >([null, null]);
  const [batchPeriodFailures, setBatchPeriodFailures] = useState<
    BatchPeriodFailure[]
  >([]);
  const [batchCloudDeskDuration, setBatchCloudDeskDuration] = useState(12);
  const [drawerCloudDeskDuration, setDrawerCloudDeskDuration] = useState<
    Record<string, number>
  >({});
  const [drawerCloudDeskResourceDuration, setDrawerCloudDeskResourceDuration] =
    useState<Record<string, number>>({});
  const [drawerConnectorScope, setDrawerConnectorScope] = useState<
    Record<string, "all" | "custom">
  >({});
  const [drawerConnectorItems, setDrawerConnectorItems] = useState<
    Record<string, string[]>
  >({});
  const [authDrawerErrors, setAuthDrawerErrors] = useState<
    Record<string, string>
  >({});
  const [connectorModalOpen, setConnectorModalOpen] = useState(false);
  const [connectorModalTarget, setConnectorModalTarget] = useState("");
  const [connectorModalDraftItems, setConnectorModalDraftItems] = useState<
    string[]
  >([]);
  const [connectorStatusTab, setConnectorStatusTab] = useState<
    "active" | "expired"
  >("active");
  const [connectorListProductLine, setConnectorListProductLine] =
    useState<ConnectorProductLineKey>("ecommerce");
  const [connectorListSearchText, setConnectorListSearchText] = useState("");
  const [connectorListPlatformTypeFilter, setConnectorListPlatformTypeFilter] =
    useState<string>();
  const [connectorListPlatformNameFilter, setConnectorListPlatformNameFilter] =
    useState<string>();
  const [connectorAutoRuleOpen, setConnectorAutoRuleOpen] = useState(false);
  const [refreshingAuthTenantKey, setRefreshingAuthTenantKey] = useState<
    string | null
  >(null);
  const [connectorSelectedRowKeys, setConnectorSelectedRowKeys] = useState<Key[]>(
    [],
  );
  const [connectorAddContext, setConnectorAddContext] = useState<{
    productLine: ConnectorProductLineKey;
    platformType?: string;
    platformName?: string;
    locked?: boolean;
  } | null>(null);
  const [connectorAddSelectedKeys, setConnectorAddSelectedKeys] = useState<
    Key[]
  >([]);
  const [tenantNameFilter, setTenantNameFilter] = useState("");
  const [ecosystemFilter, setEcosystemFilter] = useState<EcosystemName>();
  const [updaterFilter, setUpdaterFilter] = useState("");
  const [updateDateRange, setUpdateDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);
  const [authProductFilter, setAuthProductFilter] =
    useState<AuthDrawerProduct>();
  const [creatorFilter, setCreatorFilter] = useState("");
  const [createDateRange, setCreateDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);
  const [form] = Form.useForm();
  const authorizationBusinessDateProvider = {
    source: "AUTH_SERVICE_BUSINESS_DATE_PROVIDER",
    businessDate: "2026-04-29",
  };

  const renderAuthorizationAdminPage = () => {
    const productConfigs: Record<
      AuthDrawerProduct,
      {
        name: string;
        qty: number;
        start: string;
        end: string;
        note: string;
        category: "connector" | "basic" | "cloudDesk";
        rows: Array<{
          period: string;
          codes: string;
          qty: number;
          active?: boolean;
        }>;
      }
    > = {
      mallConnector: {
        name: "电商连接器",
        qty: 6,
        start: "2026-04-24",
        end: "2027-02-02",
        note: "连接器产品支持选择全部或自定义连接器池，授权变更时会触发连接器自动承接规则。",
        category: "connector",
        rows: [
          { period: "2026-02-02 ~ 2026-04-23", codes: "A", qty: 3 },
          {
            period: "2026-04-24 ~ 2027-02-02",
            codes: "B",
            qty: 6,
            active: true,
          },
        ],
      },
      crossBorderConnector: {
        name: "跨境连接器",
        qty: 4,
        start: "2025-10-01",
        end: "2026-10-01",
        note: "同属连接器授权，适用时间重叠放开、数量动态叠加与授权范围校验。",
        category: "connector",
        rows: [
          {
            period: "2025-10-01 ~ 2026-10-01",
            codes: "D",
            qty: 4,
            active: true,
          },
          { period: "2026-09-01 ~ 2027-09-01", codes: "D + E", qty: 6 },
        ],
      },
      bankConnector: {
        name: "网银连接器",
        qty: 3,
        start: "2025-10-01",
        end: "2026-10-01",
        note: "新增授权只校验开始时间小于结束时间，不校验与同产品历史授权重叠。",
        category: "connector",
        rows: [
          {
            period: "2025-10-01 ~ 2026-10-01",
            codes: "F",
            qty: 3,
            active: true,
          },
          { period: "2026-09-01 ~ 2027-09-01", codes: "F + G", qty: 5 },
        ],
      },
      cateringConnector: {
        name: "餐饮连接器",
        qty: 5,
        start: "2026-04-27",
        end: "2027-04-27",
        note: "餐饮连接器同样走连接器授权规则，数量按有效授权记录叠加。",
        category: "connector",
        rows: [
          {
            period: "2026-04-27 ~ 2027-04-27",
            codes: "G",
            qty: 5,
            active: true,
          },
        ],
      },
      phoneConnector: {
        name: "手机连接器",
        qty: 2,
        start: "2026-05-15",
        end: "2027-05-15",
        note: "手机连接器覆盖在连接器范围内，需参与授权变更后的自动承接可选池判断。",
        category: "connector",
        rows: [
          {
            period: "2026-05-15 ~ 2027-05-15",
            codes: "H",
            qty: 2,
            active: true,
          },
        ],
      },
      robotToken: {
        name: "机器人令牌",
        qty: 20,
        start: "2026-04-23",
        end: "2026-12-31",
        note: "令牌覆盖本次数量动态叠加规则，但不触发连接器自动承接。",
        category: "basic",
        rows: [
          {
            period: "2026-04-23 ~ 2026-12-31",
            codes: "C",
            qty: 20,
            active: true,
          },
        ],
      },
      cloudPhone: {
        name: "云号",
        qty: 2,
        start: "2026-09-01",
        end: "2027-09-01",
        note: "允许与授权记录 A 的 2026-09-01 至 2026-10-01 部分重叠。",
        category: "basic",
        rows: [
          { period: "2025-10-01 ~ 2026-08-31", codes: "A", qty: 5 },
          {
            period: "2026-09-01 ~ 2026-10-01",
            codes: "A + B",
            qty: 7,
            active: true,
          },
          { period: "2026-10-02 ~ 2027-09-01", codes: "B", qty: 2 },
        ],
      },
      cloudDesk: {
        name: "云桌面",
        qty: 3,
        start: "2026-04-27",
        end: "2027-04-27",
        note: "云桌面保留授权时长选择，有效期由开始日期和授权时长自动计算；到期后 14 天缓冲期不计入可用数量。",
        category: "cloudDesk",
        rows: [
          {
            period: "2026-04-27 ~ 2027-04-27",
            codes: "I",
            qty: 3,
            active: true,
          },
        ],
      },
    };
    const drawerProducts: AuthDrawerProduct[] = [
      "mallConnector",
      "crossBorderConnector",
      "bankConnector",
      "cateringConnector",
      "phoneConnector",
      "robotToken",
      "cloudPhone",
      "cloudDesk",
    ];
    const resourceProductKeys: AuthDrawerProduct[] = [
      "cloudPhone",
      "robotToken",
      "cloudDesk",
    ];
    const ecosystemOptions: EcosystemName[] = [
      "取数宝",
      "钉钉",
      "飞书",
      "企微",
      "联通",
      "电信",
    ];
    const productFilterOptions: Array<{ label: string; value: AuthDrawerProduct }> =
      [
        { label: "电商连接器", value: "mallConnector" },
        { label: "跨境连接器", value: "crossBorderConnector" },
        { label: "网银连接器", value: "bankConnector" },
        { label: "餐饮连接器", value: "cateringConnector" },
        { label: "手机连接器", value: "phoneConnector" },
        { label: "云号", value: "cloudPhone" },
        { label: "机器人令牌", value: "robotToken" },
        { label: "云桌面", value: "cloudDesk" },
      ];
    const resourceLabelMap: Partial<Record<AuthDrawerProduct, string>> = {
      cloudPhone: "云号号码",
      robotToken: "机器人令牌",
      cloudDesk: "云桌面",
    };
    const mockTenants = [
      {
        value: "农夫山泉（安吉）智能生活有限公司",
        id: "17492603467 27899137",
        admin: "nfsq_admin",
      },
      {
        value: "中海油数字化智能门户",
        id: "16383920011200001",
        admin: "cnooc_admin",
      },
      {
        value: "森森电商运营中心",
        id: "98765432109876540",
        admin: "sensen_admin",
      },
      {
        value: "森森品牌中台",
        id: "98765432109876541",
        admin: "brand_admin",
      },
      {
        value: "森森供应链运营中心",
        id: "98765432109876542",
        admin: "supply_admin",
      },
      {
        value: "森森直播业务中心",
        id: "98765432109876543",
        admin: "live_admin",
      },
      {
        value: "森森数据中台",
        id: "98765432109876544",
        admin: "data_admin",
      },
      {
        value: "森森客户成功中心",
        id: "98765432109876545",
        admin: "service_admin",
      },
      {
        value: "森森零售事业部",
        id: "98765432109876546",
        admin: "retail_admin",
      },
      {
        value: "森森财务共享中心",
        id: "98765432109876547",
        admin: "finance_admin",
      },
      {
        value: "森森营销增长中心",
        id: "98765432109876548",
        admin: "marketing_admin",
      },
    ];

    const mockConnectorList: Array<{
      id: string;
      name: string;
      platform: string;
      platformName: string;
      productKeys: AuthDrawerProduct[];
    }> = [
      {
        id: "conn-xhs-qrcode-login",
        name: "小红书二维码-登录",
        platform: "小红书",
        platformName: "小红书",
        productKeys: ["mallConnector"],
      },
      {
        id: "conn-sycm-login",
        name: "钉钉生意参谋-登录",
        platform: "淘系",
        platformName: "生意参谋",
        productKeys: ["mallConnector"],
      },
      {
        id: "conn-xhs-blog-note",
        name: "小红书-博主笔记",
        platform: "小红书",
        platformName: "小红书",
        productKeys: ["mallConnector"],
      },
      {
        id: "conn-taobao-keyword-comment",
        name: "淘宝前台-关键词查询(带评论)",
        platform: "淘系",
        platformName: "淘宝前台",
        productKeys: ["mallConnector"],
      },
      {
        id: "conn-amazon-order",
        name: "Amazon SP-API-订单查询",
        platform: "Amazon",
        platformName: "Amazon SP-API",
        productKeys: ["crossBorderConnector"],
      },
      {
        id: "conn-temu-aftersale",
        name: "Temu 商家后台-售后明细查询",
        platform: "Temu",
        platformName: "Temu 商家后台",
        productKeys: ["crossBorderConnector"],
      },
      {
        id: "conn-cmb-balance",
        name: "招商银行企业网银-账户余额查询",
        platform: "招商银行",
        platformName: "招商银行企业网银",
        productKeys: ["bankConnector"],
      },
      {
        id: "conn-icbc-receipt",
        name: "工商银行企业网银-电子回单下载",
        platform: "工商银行",
        platformName: "工商银行企业网银",
        productKeys: ["bankConnector"],
      },
      {
        id: "conn-meituan-business",
        name: "美团外卖-经营数据查询",
        platform: "美团",
        platformName: "美团外卖商家后台",
        productKeys: ["cateringConnector"],
      },
      {
        id: "conn-douyin-local-store",
        name: "抖音生活服务-门店数据查询",
        platform: "抖音",
        platformName: "抖音生活服务",
        productKeys: ["phoneConnector"],
      },
    ];

    const authRecordResourceMap: Partial<
      Record<
        string,
        Partial<
          Record<
            AuthDrawerProduct,
            {
              qty: number;
              emptyText?: string;
              values: AuthResourceValue[];
            }
          >
        >
      >
    > = {
      "tenant-cnooc-cloud-a": {
        cloudPhone: {
          qty: 5,
          values: [
            { name: "186****1024", period: "2025-10-01 - 2026-10-01" },
            { name: "186****2088", period: "2025-10-01 - 2026-10-01" },
            { name: "186****3156", period: "2025-10-01 - 2026-10-01" },
            {
              name: "186****4210",
              period: "2025-10-01 - 2026-04-22",
              lifecycleStatus: "buffer",
              bufferEndsAt: "2026-04-29",
            },
            {
              name: "186****5872",
              period: "2025-10-01 - 2026-04-20",
              lifecycleStatus: "released",
              released: true,
            },
          ],
        },
        robotToken: {
          qty: 5,
          values: [
            { name: "TOKEN-C005-01", period: "2025-10-01 - 2026-10-01" },
            { name: "TOKEN-C005-02", period: "2025-10-01 - 2026-10-01" },
            { name: "TOKEN-C005-03", period: "2025-10-01 - 2026-10-01" },
            { name: "TOKEN-C005-04", period: "2025-10-01 - 2026-10-01" },
            { name: "TOKEN-C005-05", period: "2025-10-01 - 2026-10-01" },
          ],
        },
        cloudDesk: {
          qty: 5,
          values: [
            {
              name: "ECS-CNOOC-001",
              period: "2025-10-01 - 2026-10-01",
              durationMonth: 12,
            },
            {
              name: "ECS-CNOOC-002",
              period: "2025-10-01 - 2026-04-20",
              durationMonth: 12,
              lifecycleStatus: "buffer",
              bufferEndsAt: "2026-05-04",
            },
            {
              name: "ECS-CNOOC-003",
              period: "2025-10-01 - 2026-04-14",
              durationMonth: 12,
              lifecycleStatus: "released",
              released: true,
            },
            {
              name: "ECS-CNOOC-004",
              period: "2025-10-01 - 2026-10-01",
              durationMonth: 12,
            },
            {
              name: "ECS-CNOOC-005",
              period: "2025-10-01 - 2026-10-01",
              durationMonth: 12,
            },
          ],
        },
      },
      "tenant-cnooc-cloud-partial-expired": {
        cloudPhone: {
          qty: 2,
          values: [
            { name: "186****6018", period: "2025-08-01 - 2026-04-20" },
            { name: "186****7732", period: "2025-08-01 - 2026-12-31" },
          ],
        },
        robotToken: {
          qty: 3,
          values: [
            { name: "TOKEN-C-HIS-01", period: "2025-08-01 - 2026-04-20" },
            { name: "TOKEN-C-HIS-02", period: "2025-08-01 - 2026-12-31" },
            { name: "TOKEN-C-HIS-03", period: "2025-08-01 - 2026-12-31" },
          ],
        },
        cloudDesk: {
          qty: 2,
          values: [
            { name: "ECS-CNOOC-HIS-001", period: "2025-08-01 - 2026-04-20" },
            { name: "ECS-CNOOC-HIS-002", period: "2025-08-01 - 2026-12-31" },
          ],
        },
      },
      "tenant-cnooc-cloud-b": {
        cloudPhone: {
          qty: 2,
          values: [],
          emptyText: "暂未获取到云号明细，可能是用户未完成设备认证或平台数据同步延迟",
        },
      },
      "tenant-cnooc-clouddesk-expired": {
        cloudDesk: {
          qty: 3,
          values: [
            { name: "ECS-CNOOC-OLD-001", period: "2025-04-01 - 2026-04-14" },
            { name: "ECS-CNOOC-OLD-002", period: "2025-04-01 - 2026-04-14" },
            { name: "ECS-CNOOC-OLD-003", period: "2025-04-01 - 2026-04-14" },
          ],
        },
      },
      "tenant-brand-token": {
        robotToken: {
          qty: 8,
          values: [
            { name: "TOKEN-BRAND-01", period: "2026-05-01 - 2027-05-01" },
            { name: "TOKEN-BRAND-02", period: "2026-05-01 - 2027-05-01" },
            { name: "TOKEN-BRAND-03", period: "2026-05-01 - 2027-05-01" },
            { name: "TOKEN-BRAND-04", period: "2026-05-01 - 2027-05-01" },
          ],
        },
      },
      "tenant-data-clouddesk": {
        cloudDesk: {
          qty: 6,
          values: [
            { name: "ECS-DATA-101", period: "2026-04-16 - 2026-12-16" },
            { name: "ECS-DATA-102", period: "2026-04-16 - 2026-12-16" },
            { name: "ECS-DATA-103", period: "2026-04-16 - 2026-12-16" },
          ],
        },
      },
    };

    const buildResourceDateKey = (
      recordKey: string,
      productKey: AuthDrawerProduct,
      resourceName: string,
    ) => `${recordKey}:${productKey}:${resourceName}`;

    const getResourceLifecycleMeta = (
      productKey: AuthDrawerProduct,
      resource?: AuthResourceValue,
    ) => {
      const isCloudPhone = productKey === "cloudPhone";
      const isCloudDesk = productKey === "cloudDesk";
      const isRobotToken = productKey === "robotToken";
      const [, resourceEndText] = (resource?.period || "").split(" - ");
      const resourceEnd = resourceEndText ? dayjs(resourceEndText) : null;
      const isExpiredByPeriod =
        Boolean(resourceEnd?.isValid()) &&
        authBusinessDate.isAfter(resourceEnd as Dayjs, "day");

      if (!isCloudPhone && !isCloudDesk && !isRobotToken) {
        return undefined;
      }

      if (resource?.released || resource?.lifecycleStatus === "released") {
        return {
          status: "released" as const,
          label: isCloudPhone ? "已销号" : "已释放",
          color: "default",
          renewable: false,
          reason: isCloudPhone ? "云号已销号，不可续期" : "实例已释放，不可续期",
          tip: isCloudPhone
            ? "云号已超出 7 天缓冲期并完成销号，不可再续期。"
            : "云桌面已超出 14 天缓冲期并完成释放，不可再续期。",
        };
      }

      const shouldShowBuffer =
        resource?.lifecycleStatus === "buffer" ||
        ((isCloudPhone || isCloudDesk) &&
          isExpiredByPeriod &&
          resourceEnd?.isValid() &&
          !authBusinessDate.isAfter(
            resourceEnd.add(isCloudPhone ? 7 : 14, "day"),
            "day",
          ));
      if (shouldShowBuffer) {
        const bufferDays = isCloudPhone ? 7 : 14;
        const releaseAction = isCloudPhone ? "销号" : "释放";
        const bufferEndsAt =
          resource?.bufferEndsAt ||
          (resourceEnd?.isValid()
            ? resourceEnd.add(bufferDays, "day").format("YYYY-MM-DD")
            : undefined);
        return {
          status: "buffer" as const,
          label: "缓冲期",
          color: "blue",
          renewable: true,
          reason: bufferEndsAt
            ? `缓冲期至 ${bufferEndsAt}，期间可续期`
            : `${bufferDays} 天缓冲期内可续期`,
          tip: bufferEndsAt
            ? `授权到期后进入 ${bufferDays} 天缓冲期；${bufferEndsAt} 前可续期，超出后资源将${releaseAction}且不可续期。`
            : `授权到期后进入 ${bufferDays} 天缓冲期；缓冲期内可续期，超出后资源将${releaseAction}且不可续期。`,
        };
      }

      if (isExpiredByPeriod) {
        if (isCloudPhone || isCloudDesk) {
          return {
            status: "released" as const,
            label: isCloudPhone ? "已销号" : "已释放",
            color: "default",
            renewable: false,
            reason: isCloudPhone ? "云号已销号，不可续期" : "实例已释放，不可续期",
            tip: isCloudPhone
              ? "云号已超出 7 天缓冲期并完成销号，不可再续期。"
              : "云桌面已超出 14 天缓冲期并完成释放，不可再续期。",
          };
        }
        return {
          status: "expired" as const,
          label: "已过期",
          color: "orange",
          renewable: true,
          reason: "机器人令牌无缓冲期，到期后立即不计入可用数量",
          tip: "机器人令牌不设缓冲期；结束日次日 0 点开始不再计入当前可用数量，但编辑原记录时仍可调整资源有效期。",
        };
      }

      return undefined;
    };

    const isNonRenewableResource = (
      productKey: AuthDrawerProduct,
      resource?: AuthResourceValue,
    ) => getResourceLifecycleMeta(productKey, resource)?.renewable === false;

    const cloudDeskDurationOptions = [
      { label: "1 个月", value: 1 },
      { label: "3 个月", value: 3 },
      { label: "6 个月", value: 6 },
      { label: "12 个月", value: 12 },
    ];
    const getCloudDeskEndDate = (
      start: Dayjs | null,
      durationMonth: number,
    ) => (start ? start.add(durationMonth, "month") : null);
    const getCloudDeskBufferEndDate = (end: Dayjs | null) =>
      end ? end.add(14, "day") : null;
    const getCloudDeskReleaseDate = (end: Dayjs | null) =>
      end ? end.add(15, "day") : null;
    const getCloudDeskDurationFromRange = (
      dates: [Dayjs | null, Dayjs | null],
    ) => {
      const [start, end] = dates;
      if (!start || !end) {
        return undefined;
      }
      return cloudDeskDurationOptions.find((option) =>
        end.isSame(start.add(option.value, "month"), "day"),
      )?.value;
    };
    const getCloudDeskResourceDuration = (
      resource: AuthResourceValue,
      dates: [Dayjs | null, Dayjs | null],
      fallback = 12,
    ) => resource.durationMonth ?? getCloudDeskDurationFromRange(dates) ?? fallback;
    const setCloudDeskStartAndDuration = (
      productKey: AuthDrawerProduct,
      start: Dayjs | null,
      durationMonth: number,
    ) => {
      const end = getCloudDeskEndDate(start, durationMonth);
      setDrawerCloudDeskDuration((prev) => ({
        ...prev,
        [productKey]: durationMonth,
      }));
      setDrawerProductDates((prev) => ({
        ...prev,
        [productKey]: [start, end],
      }));
      setAuthDrawerErrors((prev) => {
        const next = { ...prev };
        delete next[`period:${productKey}`];
        return next;
      });
    };

    const getAuthorizationDateError = (
      dates: [Dayjs | null, Dayjs | null] | undefined,
      productKey: AuthDrawerProduct,
      label: string,
    ) => {
      const [start, end] = dates ?? [null, null];
      if (!start || !end) {
        return `请选择${label}有效期`;
      }
      if (start.isAfter(end, "day")) {
        return `${label}有效期开始日期不能晚于结束日期`;
      }
      return "";
    };

    const getUnifiedResourceRange = (
      recordKey: string,
      productKey: AuthDrawerProduct,
      nextResourceDates: Record<string, [Dayjs | null, Dayjs | null]>,
    ): [Dayjs | null, Dayjs | null] => {
      const resources = authRecordResourceMap[recordKey]?.[productKey]?.values ?? [];
      if (!resources.length) {
        return [null, null];
      }

      const ranges: Array<[Dayjs | null, Dayjs | null]> = resources.map(
        (resource) =>
          nextResourceDates[
            buildResourceDateKey(recordKey, productKey, resource.name)
          ] ?? [null, null],
      );
      const [firstStart, firstEnd] = ranges[0] ?? [null, null];
      if (!firstStart || !firstEnd) {
        return [null, null];
      }

      const isUnified = ranges.every(([start, end]) => {
        if (!start || !end) {
          return false;
        }
        return (
          start.isSame(firstStart, "day") && end.isSame(firstEnd, "day")
        );
      });

      return isUnified ? [firstStart, firstEnd] : [null, null];
    };

    const syncProductDatesFromResources = (
      recordKey: string,
      productKey: AuthDrawerProduct,
      nextResourceDates: Record<string, [Dayjs | null, Dayjs | null]>,
    ) => {
      setDrawerProductDates((prev) => ({
        ...prev,
        [productKey]: getUnifiedResourceRange(
          recordKey,
          productKey,
          nextResourceDates,
        ),
      }));
    };
    const updateDrawerResourcePeriod = (
      recordKey: string,
      productKey: AuthDrawerProduct,
      resourceName: string,
      nextDates: [Dayjs | null, Dayjs | null],
    ) => {
      setDrawerResourceDates((prev) => {
        const next: Record<string, [Dayjs | null, Dayjs | null]> = {
          ...prev,
          [buildResourceDateKey(recordKey, productKey, resourceName)]: nextDates,
        };
        syncProductDatesFromResources(recordKey, productKey, next);
        return next;
      });
      setAuthDrawerErrors((prev) => {
        const next = { ...prev };
        delete next[`resourcePeriod:${productKey}:${resourceName}`];
        return next;
      });
    };
    const updateCloudDeskResourcePeriod = (
      recordKey: string,
      resourceName: string,
      start: Dayjs | null,
      durationMonth: number,
    ) => {
      const dateKey = buildResourceDateKey(recordKey, "cloudDesk", resourceName);
      const end = getCloudDeskEndDate(start, durationMonth);
      setDrawerCloudDeskResourceDuration((prev) => ({
        ...prev,
        [dateKey]: durationMonth,
      }));
      updateDrawerResourcePeriod(recordKey, "cloudDesk", resourceName, [start, end]);
    };

    const applyGlobalProductDates = (
      recordKey: string,
      productKey: AuthDrawerProduct,
      nextDates: [Dayjs | null, Dayjs | null],
    ) => {
      setDrawerProductDates((prev) => ({
        ...prev,
        [productKey]: nextDates,
      }));

      const resources = authRecordResourceMap[recordKey]?.[productKey]?.values ?? [];
      if (!resources.length) {
        setAuthDrawerErrors((prev) => {
          const next = { ...prev };
          delete next[`period:${productKey}`];
          return next;
        });
        return;
      }
      const hasNonRenewableResource = resources.some((resource) =>
        isNonRenewableResource(productKey, resource),
      );

      setDrawerResourceDates((prev) => {
        const next: Record<string, [Dayjs | null, Dayjs | null]> = {
          ...prev,
        };
        resources.forEach((resource) => {
          if (isNonRenewableResource(productKey, resource)) {
            return;
          }
          next[buildResourceDateKey(recordKey, productKey, resource.name)] =
            nextDates;
        });
        return next;
      });
      if (hasNonRenewableResource) {
        setDrawerProductDates((prev) => ({
          ...prev,
          [productKey]: [null, null],
        }));
      }
      setAuthDrawerErrors((prev) => {
        const next = { ...prev };
        delete next[`period:${productKey}`];
        resources.forEach((resource) => {
          if (isNonRenewableResource(productKey, resource)) {
            return;
          }
          delete next[`resourcePeriod:${productKey}:${resource.name}`];
        });
        return next;
      });
    };

    const resetDrawer = () => {
      setAuthDrawerOpen(false);
      setAuthDrawerTitle("新增授权");
      setDrawerAddedProducts([]);
      setDrawerProductQty({});
      setDrawerProductDates({});
      setDrawerTenantInput("");
      setDrawerTenantInfo(null);
      setEditingAuthRecord(null);
      setDrawerConnectorScope({});
      setDrawerConnectorItems({});
      setDrawerResourceDates({});
      setBatchPeriodTarget(null);
      setBatchPeriodDates([null, null]);
      setBatchPeriodFailures([]);
      setBatchCloudDeskDuration(12);
      setDrawerCloudDeskDuration({});
      setDrawerCloudDeskResourceDuration({});
      setAuthDrawerErrors({});
    };

    const fillDrawerTenant = (tenantName?: string) => {
      const tenant = mockTenants.find((item) => item.value === tenantName);
      if (tenant) {
        setDrawerTenantInput(tenant.value);
        setDrawerTenantInfo({
          id: tenant.id,
          name: tenant.value,
          admin: tenant.admin,
        });
      } else {
        setDrawerTenantInput("");
        setDrawerTenantInfo(null);
      }
    };

    const openAddAuthorization = (tenantName?: string) => {
      setAuthDrawerTitle("新增授权");
      setDrawerAddedProducts([]);
      setDrawerProductQty({});
      setDrawerProductDates({});
      setDrawerConnectorScope({});
      setDrawerConnectorItems({});
      setEditingAuthRecord(null);
      setDrawerResourceDates({});
      setDrawerCloudDeskDuration({});
      setDrawerCloudDeskResourceDuration({});
      setBatchCloudDeskDuration(12);
      setBatchPeriodFailures([]);
      setAuthDrawerErrors({});
      fillDrawerTenant(tenantName);
      setAuthDrawerOpen(true);
    };

    const openEditAuthorization = (record: AuthTableRecord) => {
      setAuthDrawerTitle("编辑授权");
      fillDrawerTenant(record.tenantName);
      setDrawerConnectorScope({});
      setDrawerConnectorItems({});
      setEditingAuthRecord(record);
      setAuthDrawerErrors({});
      const [start, end] = record.period.split(" - ");
      const targetKeys =
        record.productKeys?.length
          ? record.productKeys
          : record.productKey
            ? [record.productKey]
            : [];
      setDrawerAddedProducts(targetKeys);
      setDrawerProductQty(
        targetKeys.reduce<Record<string, number>>((acc, key) => {
          acc[key] =
            authRecordResourceMap[record.key]?.[key]?.qty ?? record.qty ?? 1;
          return acc;
        }, {}) as Partial<Record<AuthDrawerProduct, number>>,
      );
      setDrawerProductDates(
        targetKeys.reduce<Record<string, [Dayjs | null, Dayjs | null]>>(
          (acc, key) => {
            acc[key] = [dayjs(start), dayjs(end)];
            return acc;
          },
          {},
        ) as Partial<Record<AuthDrawerProduct, [Dayjs | null, Dayjs | null]>>,
      );
      setDrawerCloudDeskDuration(
        targetKeys.includes("cloudDesk")
          ? {
              cloudDesk:
                getCloudDeskDurationFromRange([dayjs(start), dayjs(end)]) ?? 12,
            }
          : {},
      );
      const nextResourceDates: Record<string, [Dayjs | null, Dayjs | null]> = {};
      const nextCloudDeskResourceDuration: Record<string, number> = {};
      targetKeys.forEach((key) => {
        const resources = authRecordResourceMap[record.key]?.[key]?.values ?? [];
        resources.forEach((resource) => {
          const [resourceStart, resourceEnd] = resource.period.split(" - ");
          const dateKey = buildResourceDateKey(record.key, key, resource.name);
          const resourceDates: [Dayjs | null, Dayjs | null] = [
            dayjs(resourceStart),
            dayjs(resourceEnd),
          ];
          nextResourceDates[dateKey] = resourceDates;
          if (key === "cloudDesk") {
            nextCloudDeskResourceDuration[dateKey] =
              getCloudDeskResourceDuration(resource, resourceDates);
          }
        });
      });
      setDrawerResourceDates(nextResourceDates);
      setDrawerCloudDeskResourceDuration(
        nextCloudDeskResourceDuration,
      );
      setAuthDrawerOpen(true);
    };

    const handleAddProduct = (key: AuthDrawerProduct) => {
      if (!drawerAddedProducts.includes(key)) {
        setDrawerAddedProducts((prev) => [...prev, key]);
        setDrawerProductQty((prev) => ({ ...prev, [key]: 1 }));
        setDrawerProductDates((prev) => ({ ...prev, [key]: [null, null] }));
        if (key === "cloudDesk") {
          setDrawerCloudDeskDuration((prev) => ({ ...prev, [key]: 1 }));
        }
        setAuthDrawerErrors((prev) => {
          const next = { ...prev };
          delete next.products;
          return next;
        });
      }
    };

    const validateAuthDrawerBeforeSubmit = () => {
      const nextErrors: Record<string, string> = {};
      if (!drawerTenantInfo) {
        nextErrors.tenant = "请选择授权租户";
      }
      if (!drawerAddedProducts.length) {
        nextErrors.products = "请至少选择 1 个授权产品";
      }

      drawerAddedProducts.forEach((key) => {
        const item = productConfigs[key];
        const qty = drawerProductQty[key] ?? 0;
        const resourceDetail = editingAuthRecord
          ? authRecordResourceMap[editingAuthRecord.key]?.[key]
          : undefined;
        const shouldValidateResourceDates =
          authDrawerTitle === "编辑授权" &&
          resourceProductKeys.includes(key) &&
          Boolean(resourceDetail?.values?.length);

        if (!Number.isInteger(qty) || qty <= 0) {
          nextErrors[`qty:${key}`] = `${item.name}授权数量需为大于 0 的整数`;
        }

        if (shouldValidateResourceDates && resourceDetail?.values?.length) {
          resourceDetail.values.forEach((resource) => {
            if (isNonRenewableResource(key, resource)) {
              return;
            }
            const resourceDateKey = buildResourceDateKey(
              editingAuthRecord?.key ?? "",
              key,
              resource.name,
            );
            const error = getAuthorizationDateError(
              drawerResourceDates[resourceDateKey],
              key,
              resource.name,
            );
            if (error) {
              nextErrors[`resourcePeriod:${key}:${resource.name}`] = error;
            }
          });
        } else {
          const error = getAuthorizationDateError(
            drawerProductDates[key],
            key,
            item.name,
          );
          if (error) {
            nextErrors[`period:${key}`] = error;
          }
        }

        if (
          item.category === "connector" &&
          drawerConnectorScope[key] === "custom" &&
          !(drawerConnectorItems[key] ?? []).length
        ) {
          nextErrors[`connectors:${key}`] = "自定义范围需至少添加 1 个连接器";
        }
        if (
          item.category === "connector" &&
          drawerConnectorScope[key] === "custom" &&
          (drawerConnectorItems[key] ?? []).length > (qty ?? 0)
        ) {
          nextErrors[`connectors:${key}`] =
            "自定义连接器数量不能超过授权数量";
        }
      });

      setAuthDrawerErrors(nextErrors);
      return Object.keys(nextErrors).length === 0;
    };

    const openBatchPeriodModal = (productKey: AuthDrawerProduct) => {
      if (!editingAuthRecord?.key) {
        return;
      }
      const nextDates = drawerProductDates[productKey] ?? [null, null];

      setBatchPeriodFailures([]);
      setBatchPeriodTarget({
        recordKey: editingAuthRecord.key,
        productKey,
      });
      setBatchPeriodDates(nextDates);
      if (productKey === "cloudDesk") {
        setBatchCloudDeskDuration(
          getCloudDeskDurationFromRange(nextDates) ??
            drawerCloudDeskDuration[productKey] ??
            12,
        );
      }
    };

    const renderProductRow = (key: AuthDrawerProduct) => {
      const item = productConfigs[key];
      const isAdded = drawerAddedProducts.includes(key);
      const isEditMode = authDrawerTitle === "编辑授权";
      const qty = drawerProductQty[key] ?? 1;
      const dates = drawerProductDates[key] ?? [null, null];
      const scope = drawerConnectorScope[key] ?? "all";
      const connectors = drawerConnectorItems[key] ?? [];
      const resourceDetail = editingAuthRecord
        ? authRecordResourceMap[editingAuthRecord.key]?.[key]
        : undefined;
      const isResourceDateProduct = resourceProductKeys.includes(key);
      const isFirstResourceProduct =
        key ===
        drawerAddedProducts.find((productKey) =>
          resourceProductKeys.includes(productKey),
        );
      const hasEditableResources =
        isEditMode &&
        Boolean(editingAuthRecord?.key) &&
        Boolean(resourceDetail?.values?.length);
      const productRangeValue =
        isEditMode && hasEditableResources
          ? drawerProductDates[key] ?? [null, null]
          : dates;
      const productRangePlaceholder: [string, string] =
        isEditMode &&
        hasEditableResources &&
        !productRangeValue[0] &&
        !productRangeValue[1]
          ? ["- -", "- -"]
          : ["开始日期", "结束日期"];
      const showBatchPeriodButton = isEditMode && isResourceDateProduct;
      const showMixedPeriodHint =
        showBatchPeriodButton &&
        hasEditableResources &&
        !productRangeValue[0] &&
        !productRangeValue[1];
      const qtyError = authDrawerErrors[`qty:${key}`];
      const periodError = authDrawerErrors[`period:${key}`];
      const connectorScopeError = authDrawerErrors[`connectors:${key}`];
      const cloudDeskDurationMonth = drawerCloudDeskDuration[key] ?? 1;
      const cloudDeskEndDate =
        key === "cloudDesk"
          ? getCloudDeskEndDate(productRangeValue[0], cloudDeskDurationMonth)
          : null;
      const cloudDeskBufferEndDate = getCloudDeskBufferEndDate(cloudDeskEndDate);
      const cloudDeskReleaseDate = getCloudDeskReleaseDate(cloudDeskEndDate);
      const selectedConnectorRows = connectors
        .map((connectorId) =>
          mockConnectorList.find((connector) => connector.id === connectorId),
        )
        .filter(
          (
            connector,
          ): connector is (typeof mockConnectorList)[number] =>
            Boolean(connector),
        );

      return (
        <div
          key={key}
          className={`auth-drawer-product-row${isAdded ? " is-added" : ""}`}
        >
          <div className="auth-drawer-product-row-head">
            <span className="auth-drawer-product-name">
              {item.name}
            </span>
            {!isEditMode && (
              <Space size={8}>
                <Button
                  type="link"
                  size="small"
                  icon={isAdded ? <CloseOutlined /> : <PlusOutlined />}
                  danger={isAdded}
                  onClick={() => {
                    if (isAdded) {
                      setDrawerAddedProducts((prev) =>
                        prev.filter((productKey) => productKey !== key),
                      );
                      if (key === "cloudDesk") {
                        setDrawerCloudDeskDuration((prev) => {
                          const next = { ...prev };
                          delete next[key];
                          return next;
                        });
                      }
                      setAuthDrawerErrors((prev) => {
                        const next = { ...prev };
                        delete next[`qty:${key}`];
                        delete next[`period:${key}`];
                        delete next[`connectors:${key}`];
                        return next;
                      });
                      return;
                    }
                    handleAddProduct(key);
                  }}
                >
                  {isAdded ? "取消新增" : "新增"}
                </Button>
              </Space>
            )}
          </div>
          {isAdded && (
            <div
              className={`auth-drawer-product-form${isEditMode ? " is-edit-mode" : ""}`}
            >
              <div
                className={`auth-mode-panel ${
                  isEditMode ? "auth-mode-panel-edit" : "auth-mode-panel-add"
                }`}
              >
                <div className="auth-form-line auth-form-line-compact">
                  <span>{isEditMode ? "授权数量" : "新增数量"}</span>
                  <InputNumber
                    min={1}
                    precision={0}
                    value={qty}
                    controls
                    status={qtyError ? "error" : undefined}
                    onChange={(v) => {
                      setDrawerProductQty((prev) => ({
                        ...prev,
                        [key]: v ?? 1,
                      }));
                      setAuthDrawerErrors((prev) => {
                        const next = { ...prev };
                        delete next[`qty:${key}`];
                        return next;
                      });
                    }}
                  />
                  {qtyError && (
                    <span className="auth-field-error">{qtyError}</span>
                  )}
                </div>
                {!showBatchPeriodButton && key === "cloudDesk" && (
                  <div className="auth-form-line auth-cloud-duration-line">
                    <span>授权时长</span>
                    <div className="auth-cloud-duration-grid">
                      <DatePicker
                        value={productRangeValue[0]}
                        placeholder="授权开始日期"
                        status={periodError ? "error" : undefined}
                        onChange={(value) =>
                          setCloudDeskStartAndDuration(
                            key,
                            value,
                            cloudDeskDurationMonth,
                          )
                        }
                      />
                      <Select
                        value={cloudDeskDurationMonth}
                        options={cloudDeskDurationOptions}
                        onChange={(value) =>
                          setCloudDeskStartAndDuration(
                            key,
                            productRangeValue[0],
                            value,
                          )
                        }
                      />
                    </div>
                    <div className="auth-cloud-duration-result">
                      <span>
                        授权有效期：
                        {productRangeValue[0] && cloudDeskEndDate
                          ? `${productRangeValue[0].format("YYYY-MM-DD")} - ${cloudDeskEndDate.format("YYYY-MM-DD")}`
                          : "选择开始日期和授权时长后自动计算"}
                      </span>
                      <span>
                        缓冲期至：
                        {cloudDeskBufferEndDate
                          ? cloudDeskBufferEndDate.format("YYYY-MM-DD")
                          : "-"}
                      </span>
                      <span>
                        自动释放日：
                        {cloudDeskReleaseDate
                          ? cloudDeskReleaseDate.format("YYYY-MM-DD")
                          : "-"}
                      </span>
                    </div>
                    {periodError && (
                      <span className="auth-field-error">{periodError}</span>
                    )}
                  </div>
                )}
                {!showBatchPeriodButton && key !== "cloudDesk" && (
                  <div className="auth-form-line">
                    <span>授权时间</span>
                    <div className="auth-drawer-range-wrap">
                      <RangePicker
                        value={productRangeValue}
                        suffixIcon={null}
                        placeholder={productRangePlaceholder}
                        status={periodError ? "error" : undefined}
                        onChange={(vals) => {
                          const nextDates: [Dayjs | null, Dayjs | null] = vals
                            ? [vals[0], vals[1]]
                            : [null, null];

                          setDrawerProductDates((prev) => ({
                            ...prev,
                            [key]: nextDates,
                          }));
                          setAuthDrawerErrors((prev) => {
                            const next = { ...prev };
                            delete next[`period:${key}`];
                            return next;
                          });
                        }}
                      />
                      {periodError && (
                        <span className="auth-field-error">{periodError}</span>
                      )}
                    </div>
                  </div>
                )}
                {isEditMode && isResourceDateProduct && (
                  <div className="auth-resource-detail-card">
                    <div className="auth-resource-detail-head">
                      <span className="auth-resource-detail-title">
                        {item.name}
                      </span>
                      <span className="auth-resource-detail-actions">
                        {showMixedPeriodHint && (
                          <span className="auth-batch-period-hint">
                            当前资源有效期不一致
                          </span>
                        )}
                        <Button
                          className="auth-batch-period-button"
                          type="link"
                          size="small"
                          onClick={() => openBatchPeriodModal(key)}
                        >
                          批量设置时间
                        </Button>
                      </span>
                    </div>
                    <div className="auth-resource-detail-column-head">
                      <span>
                        {key === "cloudPhone"
                          ? "云号号码"
                          : resourceLabelMap[key]}
                      </span>
                      <span>{key === "cloudDesk" ? "开始日期 / 授权时长" : "有效期"}</span>
                    </div>
                    {resourceDetail?.values?.length ? (
                      <div className="auth-resource-detail-list">
                        {resourceDetail.values.map((resource) => {
                          const dateKey = buildResourceDateKey(
                            editingAuthRecord?.key ?? "",
                            key,
                            resource.name,
                          );
                          const lifecycleMeta = getResourceLifecycleMeta(
                            key,
                            resource,
                          );
                          const isResourceDateDisabled =
                            lifecycleMeta?.renewable === false;
                          const disabledReason =
                            lifecycleMeta?.reason ??
                            (key === "cloudPhone"
                              ? "云号已销号，不可续期"
                              : "实例已释放，不可续期");
                          const resourcePeriodError =
                            authDrawerErrors[
                              `resourcePeriod:${key}:${resource.name}`
                            ];
                          const resourceDateValue: [
                            Dayjs | null,
                            Dayjs | null,
                          ] =
                            drawerResourceDates[dateKey] ?? [null, null];
                          const cloudDeskResourceDuration =
                            key === "cloudDesk"
                              ? getCloudDeskResourceDuration(
                                  resource,
                                  resourceDateValue,
                                  cloudDeskDurationMonth,
                                )
                              : cloudDeskDurationMonth;
                          return (
                            <div
                              className={`auth-resource-detail-row${
                                isResourceDateDisabled ? " is-disabled" : ""
                              }${
                                lifecycleMeta?.status === "buffer"
                                  ? " is-buffer"
                                  : ""
                              }`}
                              key={`${key}-${resource.name}`}
                            >
                              <span className="auth-resource-name-main">
                                <span
                                  className="auth-resource-name-text"
                                  title={resource.name}
                                >
                                  {resource.name}
                                </span>
                                {lifecycleMeta && (
                                  <Tooltip
                                    title={
                                      lifecycleMeta.tip ??
                                      lifecycleMeta.reason
                                    }
                                  >
                                    <Tag
                                      className="auth-resource-status-tag"
                                      color={lifecycleMeta.color}
                                    >
                                      {lifecycleMeta.label}
                                    </Tag>
                                  </Tooltip>
                                )}
                              </span>
                              <div className="auth-resource-date-control">
                                {key === "cloudDesk" ? (
                                  <div className="auth-cloud-duration-grid">
                                    <DatePicker
                                      disabled={isResourceDateDisabled}
                                      value={resourceDateValue[0]}
                                      placeholder="开始日期"
                                      status={
                                        resourcePeriodError ? "error" : undefined
                                      }
                                      onChange={(value) => {
                                        if (!editingAuthRecord?.key) {
                                          return;
                                        }
                                        updateCloudDeskResourcePeriod(
                                          editingAuthRecord.key,
                                          resource.name,
                                          value,
                                          cloudDeskResourceDuration,
                                        );
                                      }}
                                    />
                                    <Select
                                      disabled={isResourceDateDisabled}
                                      value={cloudDeskResourceDuration}
                                      options={cloudDeskDurationOptions}
                                      onChange={(value) => {
                                        if (!editingAuthRecord?.key) {
                                          return;
                                        }
                                        updateCloudDeskResourcePeriod(
                                          editingAuthRecord.key,
                                          resource.name,
                                          resourceDateValue[0],
                                          value,
                                        );
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <RangePicker
                                    disabled={isResourceDateDisabled}
                                    value={resourceDateValue}
                                    placeholder={["开始日期", "结束日期"]}
                                    status={
                                      resourcePeriodError ? "error" : undefined
                                    }
                                    onChange={(vals) => {
                                      if (!editingAuthRecord?.key) {
                                        return;
                                      }
                                      const nextDates: [
                                        Dayjs | null,
                                        Dayjs | null,
                                      ] = vals
                                        ? [vals[0], vals[1]]
                                        : [null, null];
                                      updateDrawerResourcePeriod(
                                        editingAuthRecord.key,
                                        key,
                                        resource.name,
                                        nextDates,
                                      );
                                    }}
                                  />
                                )}
                                {resourcePeriodError && (
                                  <span className="auth-field-error">
                                    {resourcePeriodError}
                                  </span>
                                )}
                                {isResourceDateDisabled && (
                                  <span className="auth-resource-disabled-reason">
                                    {disabledReason}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      ) : (
                        <div className="auth-resource-detail-empty">
                          <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                              resourceDetail?.emptyText ?? "暂无具体资源数据"
                            }
                          />
                        </div>
                      )}
                    </div>
                  )}
              </div>
              {item.category === "connector" && (
                <>
                  <div className="auth-scope-row">
                    <span>{item.name}授权范围</span>
                    <Radio.Group
                      value={scope}
                      onChange={(e) => {
                        setDrawerConnectorScope((prev) => ({
                          ...prev,
                          [key]: e.target.value,
                        }));
                        setAuthDrawerErrors((prev) => {
                          const next = { ...prev };
                          delete next[`connectors:${key}`];
                          return next;
                        });
                      }}
                    >
                      <Radio value="all">全部</Radio>
                      <Radio value="custom">
                        自定义
                        {scope === "custom" &&
                          connectors.length > 0 &&
                          ` 已选${connectors.length}条`}
                      </Radio>
                    </Radio.Group>
                  </div>
                  {scope === "custom" && (
                    <div className="auth-connector-list">
                      <div className="auth-connector-list-head">
                        <span>连接器</span>
                        <Button
                          type="link"
                          size="small"
                          icon={<PlusOutlined />}
                          onClick={() => {
                            setConnectorModalTarget(key);
                            setConnectorModalDraftItems(
                              drawerConnectorItems[key] ?? [],
                            );
                            setConnectorModalOpen(true);
                            setAuthDrawerErrors((prev) => {
                              const next = { ...prev };
                              delete next[`connectors:${key}`];
                              return next;
                            });
                          }}
                        >
                          添加连接器
                        </Button>
                      </div>
                      {selectedConnectorRows.length > 0 && (
                        <Table
                          size="small"
                          className="auth-connector-table"
                          columns={[
                            { title: "连接器名称", dataIndex: "name" },
                            { title: "连接器 ID", dataIndex: "id" },
                            {
                              title: "操作",
                              key: "op",
                              width: 50,
                              render: (_: unknown, r: { id: string }) => (
                                <Button
                                  type="link"
                                  danger
                                  size="small"
                                  onClick={() =>
                                    Modal.confirm({
                                      title: "确认移出连接器",
                                      content:
                                        "移出后该连接器不再属于当前自定义范围；若该连接器已使用当前授权，当前授权到期前仍按原授权生效，到期后进入自动承接。",
                                      okText: "确认移出",
                                      cancelText: "返回",
                                      okButtonProps: { danger: true },
                                      onOk: () => {
                                        setDrawerConnectorItems((prev) => ({
                                          ...prev,
                                          [key]: (prev[key] ?? []).filter(
                                            (connectorId) =>
                                              connectorId !== r.id,
                                          ),
                                        }));
                                        messageApi.success(
                                          "已移出连接器，保存后写入 CONNECTOR_REMOVE 日志",
                                        );
                                      },
                                    })
                                  }
                                >
                                  删除
                                </Button>
                              ),
                            },
                          ]}
                          dataSource={selectedConnectorRows.map((connector) => ({
                            key: connector.id,
                            id: connector.id,
                            name: connector.name,
                          }))}
                          pagination={false}
                          showHeader={false}
                        />
                      )}
                      {connectors.length === 0 && (
                        <div className="auth-connector-empty">请添加连接器</div>
                      )}
                      {connectorScopeError && (
                        <div className="auth-field-error">
                          {connectorScopeError}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      );
    };

    const visibleDrawerProducts =
      authDrawerTitle === "编辑授权" && drawerAddedProducts.length > 0
        ? drawerAddedProducts
        : drawerProducts;

    const authStatusColor: Record<AuthStatus, string> = {
      生效中: "success",
      部分已过期: "orange",
      已过期: "default",
      待生效: "blue",
      已删除: "default",
    };

    const authStatusOrder: Record<AuthStatus, number> = {
      生效中: 0,
      部分已过期: 1,
      待生效: 2,
      已过期: 3,
      已删除: 4,
    };
    const authBusinessDateParam = new URLSearchParams(window.location.search).get(
      "asOfDate",
    );
    const parsedAuthBusinessDate = authBusinessDateParam
      ? dayjs(authBusinessDateParam)
      : null;
    const authBusinessDate =
      parsedAuthBusinessDate?.isValid() === true
        ? parsedAuthBusinessDate
        : dayjs(authorizationBusinessDateProvider.businessDate);
    const getAuthStatusByPeriod = (period?: string): AuthStatus => {
      const [startText, endText] = (period || "").split(" - ");
      const start = startText ? dayjs(startText) : null;
      const end = endText ? dayjs(endText) : null;
      if (!start?.isValid() || !end?.isValid()) {
        return "待生效";
      }
      if (authBusinessDate.isBefore(start, "day")) {
        return "待生效";
      }
      if (authBusinessDate.isAfter(end, "day")) {
        return "已过期";
      }
      return "生效中";
    };
    const normalizeQuantitySummaryByStatus = (
      child: AuthTableRecord,
      status: AuthStatus,
    ): AuthQuantitySummary | undefined => {
      const source = child.quantitySummary;
      const totalQty = source?.totalQty ?? child.qty;
      if (!totalQty) {
        return source;
      }
      if (status === "已删除") {
        return {
          ...source,
          totalQty,
          currentUsableQty: 0,
          pendingQty: 0,
        };
      }
      if (status === "待生效") {
        return {
          ...source,
          totalQty,
          currentUsableQty: 0,
          pendingQty: totalQty,
          expiredQty: 0,
        };
      }
      if (status === "已过期") {
        return {
          ...source,
          totalQty,
          currentUsableQty: 0,
          pendingQty: 0,
          expiredQty: totalQty,
        };
      }
      if (
        status === "生效中" &&
        (child.status === "待生效" || child.status === "已过期")
      ) {
        return {
          ...source,
          totalQty,
          currentUsableQty: totalQty,
          pendingQty: 0,
          expiredQty: 0,
        };
      }
      return source;
    };
    const normalizeAuthChildStatus = (
      child: AuthTableRecord,
    ): AuthTableRecord => {
      if (deletedAuthKeys.includes(child.key)) {
        return {
          ...child,
          status: "已删除",
          quantitySummary: normalizeQuantitySummaryByStatus(child, "已删除"),
        };
      }
      if (child.status === "已删除") {
        return {
          ...child,
          quantitySummary: normalizeQuantitySummaryByStatus(child, "已删除"),
        };
      }
      const computedStatus = getAuthStatusByPeriod(child.period);
      const nextStatus =
        child.status === "部分已过期" && computedStatus === "生效中"
          ? "部分已过期"
          : computedStatus;
      return {
        ...child,
        status: nextStatus,
        quantitySummary: normalizeQuantitySummaryByStatus(child, nextStatus),
      };
    };

    const sortAuthChildren = (children: AuthTableRecord[]) =>
      [...children].sort((left, right) => {
        const leftOrder = authStatusOrder[left.status || "待生效"];
        const rightOrder = authStatusOrder[right.status || "待生效"];
        if (leftOrder !== rightOrder) {
          return leftOrder - rightOrder;
        }
        return (
          dayjs(right.updateTime).valueOf() - dayjs(left.updateTime).valueOf()
        );
      });

    const tenantSeed: Array<{
      key: string;
      tenantName: string;
      ecosystem: EcosystemName;
      total: number;
      period: string;
      updateTime: string;
      children: AuthTableRecord[];
    }> = [
      {
        key: "tenant-cnooc",
        tenantName: "中海油数字化智能门户",
        ecosystem: "取数宝",
        total: 39,
        period: "2025-10-01 - 2027-09-01",
        updateTime: "2026-04-25 04:40:12",
        children: [
          {
            key: "tenant-cnooc-cloud-a",
            tenantName: "中海油数字化智能门户",
            product: "云号（5）｜机器人令牌（5）｜云桌面（5）",
            products: ["云号（5）", "机器人令牌（5）", "云桌面（5）"],
            productKeys: ["cloudPhone", "robotToken", "cloudDesk"],
            productPeriods: [
              "2025-10-01 - 2026-10-01",
              "2025-10-01 - 2026-10-01",
              "2025-10-01 - 2026-10-01",
            ],
            period: "2025-10-01 - 2026-10-01",
            updater: "森森",
            updateTime: "2026-04-25 04:35:45",
            creator: "森森",
            status: "生效中",
            productKey: "cloudPhone",
            qty: 15,
            quantitySummary: {
              totalQty: 15,
              currentUsableQty: 11,
              bufferQty: 2,
              releasedQty: 2,
              note: "云号 1 个缓冲期、1 个已销号；云桌面 1 个缓冲期、1 个已释放，均不计入当前可用数。",
            },
          },
          {
            key: "tenant-cnooc-cloud-partial-expired",
            tenantName: "中海油数字化智能门户",
            product: "云号（2）｜机器人令牌（3）｜云桌面（2）",
            products: ["云号（2）", "机器人令牌（3）", "云桌面（2）"],
            productKeys: ["cloudPhone", "robotToken", "cloudDesk"],
            productPeriods: [
              "2025-08-01 - 2026-12-31",
              "2025-08-01 - 2026-12-31",
              "2025-08-01 - 2026-12-31",
            ],
            period: "2025-08-01 - 2026-12-31",
            updater: "森森",
            updateTime: "2026-04-25 04:20:12",
            creator: "森森",
            status: "部分已过期",
            productKey: "cloudPhone",
            qty: 7,
            quantitySummary: {
              totalQty: 7,
              currentUsableQty: 4,
              bufferQty: 1,
              releasedQty: 1,
              expiredQty: 1,
              note: "机器人令牌不设缓冲期，到期即不计入可用；云号超 7 天缓冲后销号，云桌面 14 天内仍可续期。",
            },
          },
          {
            key: "tenant-cnooc-cloud-b",
            tenantName: "中海油数字化智能门户",
            product: "云号（2）",
            period: "2026-09-01 - 2027-09-01",
            updater: "森森",
            updateTime: "2026-04-25 04:40:12",
            creator: "森森",
            status: "待生效",
            productKey: "cloudPhone",
            qty: 2,
            quantitySummary: {
              totalQty: 2,
              currentUsableQty: 0,
              pendingQty: 2,
              note: "待生效数量计入父级全部授权数，不计入当前可用数。",
            },
          },
          {
            key: "tenant-cnooc-connector-b",
            tenantName: "中海油数字化智能门户",
            product: "电商连接器（6）",
            period: "2026-04-24 - 2027-02-02",
            updater: "森森",
            updateTime: "2026-04-24 17:38:40",
            creator: "森森",
            status: "生效中",
            productKey: "mallConnector",
            qty: 6,
            quantitySummary: {
              totalQty: 6,
              currentUsableQty: 6,
              note: "连接器范围为全部时动态包含未来新增连接器。",
            },
          },
          {
            key: "tenant-cnooc-connector-expired",
            tenantName: "中海油数字化智能门户",
            product: "电商连接器（6）",
            period: "2025-04-01 - 2026-04-20",
            updater: "森森",
            updateTime: "2026-04-20 18:12:09",
            creator: "森森",
            status: "已过期",
            productKey: "mallConnector",
            qty: 6,
            quantitySummary: {
              totalQty: 6,
              currentUsableQty: 0,
              expiredQty: 6,
              note: "已过期授权计入父级全部授权数，不计入当前可用数。",
            },
          },
          {
            key: "tenant-cnooc-clouddesk-expired",
            tenantName: "中海油数字化智能门户",
            product: "云桌面（3）",
            period: "2025-04-01 - 2026-04-14",
            updater: "森森",
            updateTime: "2026-04-18 11:28:36",
            creator: "森森",
            status: "已过期",
            productKey: "cloudDesk",
            qty: 3,
            quantitySummary: {
              totalQty: 3,
              currentUsableQty: 0,
              releasedQty: 3,
              note: "云桌面超出 14 天缓冲期后已释放，不计入当前可用数。",
            },
          },
        ],
      },
      {
        key: "tenant-sensen",
        tenantName: "森森电商运营中心",
        ecosystem: "钉钉",
        total: 3,
        period: "2026-04-24 - 2027-02-02",
        updateTime: "2026-04-24 17:38:40",
        children: [
          {
            key: "tenant-sensen-connector-b",
            tenantName: "森森电商运营中心",
            product: "连接器（1）",
            period: "2026-04-24 - 2027-02-02",
            updater: "森森",
            updateTime: "2026-04-24 17:38:40",
            creator: "森森",
            status: "生效中",
            productKey: "mallConnector",
            qty: 1,
          },
          {
            key: "tenant-sensen-token",
            tenantName: "森森电商运营中心",
            product: "机器人令牌（1）",
            period: "2026-04-24 - 2027-02-02",
            updater: "森森",
            updateTime: "2026-04-24 17:37:20",
            creator: "森森",
            status: "生效中",
            productKey: "robotToken",
            qty: 1,
          },
          {
            key: "tenant-sensen-clouddesk",
            tenantName: "森森电商运营中心",
            product: "云桌面（1）",
            period: "2026-04-24 - 2027-02-02",
            updater: "森森",
            updateTime: "2026-04-24 17:36:48",
            creator: "森森",
            status: "生效中",
            productKey: "cloudDesk",
            qty: 1,
          },
        ],
      },
      {
        key: "tenant-brand",
        tenantName: "森森品牌中台",
        ecosystem: "取数宝",
        total: 18,
        period: "2026-04-20 - 2027-04-20",
        updateTime: "2026-04-24 14:22:17",
        children: [
          {
            key: "tenant-brand-cloud",
            tenantName: "森森品牌中台",
            product: "云号（10）",
            period: "2026-04-20 - 2027-04-20",
            updater: "森森",
            updateTime: "2026-04-24 14:22:17",
            creator: "森森",
            status: "生效中",
            productKey: "cloudPhone",
            qty: 10,
          },
          {
            key: "tenant-brand-token",
            tenantName: "森森品牌中台",
            product: "机器人令牌（8）",
            period: "2026-05-01 - 2027-05-01",
            updater: "森森",
            updateTime: "2026-04-24 13:48:32",
            creator: "森森",
            status: "待生效",
            productKey: "robotToken",
            qty: 8,
          },
        ],
      },
      {
        key: "tenant-supply",
        tenantName: "森森供应链运营中心",
        ecosystem: "取数宝",
        total: 14,
        period: "2026-04-18 - 2027-01-31",
        updateTime: "2026-04-24 10:16:09",
        children: [
          {
            key: "tenant-supply-connector",
            tenantName: "森森供应链运营中心",
            product: "跨境连接器（9）",
            period: "2026-04-18 - 2027-01-31",
            updater: "森森",
            updateTime: "2026-04-24 10:16:09",
            creator: "森森",
            status: "生效中",
            productKey: "crossBorderConnector",
            qty: 9,
          },
          {
            key: "tenant-supply-token",
            tenantName: "森森供应链运营中心",
            product: "机器人令牌（5）",
            period: "2026-04-18 - 2026-12-31",
            updater: "森森",
            updateTime: "2026-04-23 22:18:41",
            creator: "森森",
            status: "生效中",
            productKey: "robotToken",
            qty: 5,
          },
        ],
      },
      {
        key: "tenant-live",
        tenantName: "森森直播业务中心",
        ecosystem: "取数宝",
        total: 11,
        period: "2026-04-17 - 2027-04-30",
        updateTime: "2026-04-24 09:42:10",
        children: [
          {
            key: "tenant-live-phone",
            tenantName: "森森直播业务中心",
            product: "手机连接器（7）",
            period: "2026-04-17 - 2027-04-30",
            updater: "森森",
            updateTime: "2026-04-24 09:42:10",
            creator: "森森",
            status: "生效中",
            productKey: "phoneConnector",
            qty: 7,
          },
          {
            key: "tenant-live-bank",
            tenantName: "森森直播业务中心",
            product: "网银连接器（4）",
            period: "2026-05-15 - 2027-05-15",
            updater: "森森",
            updateTime: "2026-04-23 20:11:08",
            creator: "森森",
            status: "待生效",
            productKey: "bankConnector",
            qty: 4,
          },
        ],
      },
      {
        key: "tenant-data",
        tenantName: "森森数据中台",
        ecosystem: "取数宝",
        total: 16,
        period: "2026-04-16 - 2027-03-31",
        updateTime: "2026-04-24 08:35:51",
        children: [
          {
            key: "tenant-data-mall",
            tenantName: "森森数据中台",
            product: "电商连接器（10）",
            period: "2026-04-16 - 2027-03-31",
            updater: "森森",
            updateTime: "2026-04-24 08:35:51",
            creator: "森森",
            status: "生效中",
            productKey: "mallConnector",
            qty: 10,
          },
          {
            key: "tenant-data-clouddesk",
            tenantName: "森森数据中台",
            product: "云桌面（6）",
            period: "2026-04-16 - 2026-12-16",
            updater: "森森",
            updateTime: "2026-04-22 19:54:26",
            creator: "森森",
            status: "生效中",
            productKey: "cloudDesk",
            qty: 6,
          },
        ],
      },
      {
        key: "tenant-service",
        tenantName: "森森客户成功中心",
        ecosystem: "钉钉",
        total: 3,
        period: "2026-04-14 - 2026-12-31",
        updateTime: "2026-04-23 18:20:33",
        children: [
          {
            key: "tenant-service-connector",
            tenantName: "森森客户成功中心",
            product: "连接器（1）",
            period: "2026-04-14 - 2026-12-31",
            updater: "森森",
            updateTime: "2026-04-23 18:20:33",
            creator: "森森",
            status: "生效中",
            productKey: "mallConnector",
            qty: 1,
          },
          {
            key: "tenant-service-token",
            tenantName: "森森客户成功中心",
            product: "机器人令牌（1）",
            period: "2026-04-14 - 2026-12-31",
            updater: "森森",
            updateTime: "2026-04-23 18:18:12",
            creator: "森森",
            status: "生效中",
            productKey: "robotToken",
            qty: 1,
          },
          {
            key: "tenant-service-clouddesk",
            tenantName: "森森客户成功中心",
            product: "云桌面（1）",
            period: "2026-04-14 - 2026-12-31",
            updater: "森森",
            updateTime: "2026-04-23 18:16:54",
            creator: "森森",
            status: "生效中",
            productKey: "cloudDesk",
            qty: 1,
          },
        ],
      },
      {
        key: "tenant-retail",
        tenantName: "森森零售事业部",
        ecosystem: "取数宝",
        total: 13,
        period: "2026-04-13 - 2027-04-13",
        updateTime: "2026-04-23 15:08:20",
        children: [
          {
            key: "tenant-retail-mall",
            tenantName: "森森零售事业部",
            product: "电商连接器（8）",
            period: "2026-04-13 - 2027-04-13",
            updater: "森森",
            updateTime: "2026-04-23 15:08:20",
            creator: "森森",
            status: "生效中",
            productKey: "mallConnector",
            qty: 8,
          },
          {
            key: "tenant-retail-token",
            tenantName: "森森零售事业部",
            product: "机器人令牌（5）",
            period: "2026-04-13 - 2026-10-31",
            updater: "森森",
            updateTime: "2026-04-21 11:34:07",
            creator: "森森",
            status: "生效中",
            productKey: "robotToken",
            qty: 5,
          },
        ],
      },
      {
        key: "tenant-finance",
        tenantName: "森森财务共享中心",
        ecosystem: "取数宝",
        total: 12,
        period: "2026-04-12 - 2027-01-12",
        updateTime: "2026-04-23 11:47:29",
        children: [
          {
            key: "tenant-finance-bank",
            tenantName: "森森财务共享中心",
            product: "网银连接器（6）",
            period: "2026-04-12 - 2027-01-12",
            updater: "森森",
            updateTime: "2026-04-23 11:47:29",
            creator: "森森",
            status: "生效中",
            productKey: "bankConnector",
            qty: 6,
          },
          {
            key: "tenant-finance-clouddesk",
            tenantName: "森森财务共享中心",
            product: "云桌面（6）",
            period: "2026-04-26 - 2027-04-26",
            updater: "森森",
            updateTime: "2026-04-23 10:20:16",
            creator: "森森",
            status: "生效中",
            productKey: "cloudDesk",
            qty: 6,
          },
        ],
      },
      {
        key: "tenant-marketing",
        tenantName: "森森营销增长中心",
        ecosystem: "取数宝",
        total: 8,
        period: "2026-04-11 - 2026-11-30",
        updateTime: "2026-04-22 21:13:08",
        children: [
          {
            key: "tenant-marketing-phone",
            tenantName: "森森营销增长中心",
            product: "手机连接器（4）",
            period: "2026-04-11 - 2026-11-30",
            updater: "森森",
            updateTime: "2026-04-22 21:13:08",
            creator: "森森",
            status: "生效中",
            productKey: "phoneConnector",
            qty: 4,
          },
          {
            key: "tenant-marketing-cross",
            tenantName: "森森营销增长中心",
            product: "跨境连接器（4）",
            period: "2026-04-11 - 2026-09-30",
            updater: "森森",
            updateTime: "2026-04-20 17:06:22",
            creator: "森森",
            status: "生效中",
            productKey: "crossBorderConnector",
            qty: 4,
          },
        ],
      },
    ];

    const authorizationRows: AuthTableRecord[] = tenantSeed
      .map((tenant) => ({
        key: tenant.key,
        tenantName: tenant.tenantName,
        ecosystem: tenant.ecosystem,
        product: String(tenant.total),
        period: tenant.period,
        authType: "电商sass",
        updater: "森森",
        updateTime: tenant.updateTime,
        createTime: tenant.updateTime,
        creator: "森森",
        children: sortAuthChildren(
          tenant.children
            .map(normalizeAuthChildStatus)
            .map((child) => ({
              ...child,
              ecosystem: tenant.ecosystem,
              createTime: child.createTime ?? child.updateTime,
            })),
        ),
      }))
      .sort(
        (left, right) =>
          dayjs(right.updateTime).valueOf() - dayjs(left.updateTime).valueOf(),
      );

    const matchesKeyword = (value: string | undefined, keyword: string) =>
      !keyword.trim() || String(value ?? "").includes(keyword.trim());
    const isInDateRange = (
      value: string | undefined,
      range: [Dayjs | null, Dayjs | null] | null,
    ) => {
      if (!range?.[0] || !range?.[1]) return true;
      const current = dayjs(value);
      if (!current.isValid()) return false;
      return (
        current.valueOf() >= range[0].startOf("day").valueOf() &&
        current.valueOf() <= range[1].endOf("day").valueOf()
      );
    };
    const matchesProduct = (record: AuthTableRecord) => {
      if (!authProductFilter) return true;
      return (
        record.productKey === authProductFilter ||
        record.productKeys?.includes(authProductFilter) ||
        record.products?.some((product) =>
          productFilterOptions
            .find((option) => option.value === authProductFilter)
            ?.label.includes(product.replace(/（.*$/, "")),
        )
      );
    };
    const resetAuthFilters = () => {
      setTenantNameFilter("");
      setEcosystemFilter(undefined);
      setUpdaterFilter("");
      setUpdateDateRange(null);
      setAuthProductFilter(undefined);
      setCreatorFilter("");
      setCreateDateRange(null);
    };
    const filteredAuthorizationRows = authorizationRows.reduce<AuthTableRecord[]>(
      (rows, tenant) => {
        const children = tenant.children ?? [];
        const filteredChildren = children.filter(
          (child) =>
            matchesProduct(child) &&
            matchesKeyword(child.updater, updaterFilter) &&
            matchesKeyword(child.creator, creatorFilter) &&
            isInDateRange(child.updateTime, updateDateRange) &&
            isInDateRange(child.createTime, createDateRange),
        );
        const hasChildLevelFilter = Boolean(
          authProductFilter ||
            updaterFilter.trim() ||
            creatorFilter.trim() ||
            updateDateRange?.[0] ||
            updateDateRange?.[1] ||
            createDateRange?.[0] ||
            createDateRange?.[1],
        );
        const tenantMatches =
          matchesKeyword(tenant.tenantName, tenantNameFilter) &&
          (!ecosystemFilter || tenant.ecosystem === ecosystemFilter);
        const nextChildren = hasChildLevelFilter ? filteredChildren : children;
        const nextTotal = nextChildren.reduce(
          (sum, child) => sum + (child.qty ?? 0),
          0,
        );

        if (tenantMatches && nextChildren.length) {
          rows.push({
            ...tenant,
            product: hasChildLevelFilter ? String(nextTotal) : tenant.product,
            children: nextChildren,
          });
        }

        return rows;
      },
      [],
    );

    type AuthTooltipValue =
      | string
      | {
          name: string;
          period?: string;
          released?: boolean;
          statusLabel?: string;
          statusTip?: string;
          statusColor?: string;
        };
    type AuthTooltipSection = {
      label: string;
      source: string;
      emptyText?: string;
      values: AuthTooltipValue[];
    };

    const authRecordDataMap: Record<string, AuthTooltipSection[]> = {
      "tenant-cnooc-cloud-a": [
        {
          label: "云号",
          source: "云号平台 API",
          values: [
            "186****1024",
            "186****2088",
            "186****3156",
            "186****4210",
            "186****5872",
          ],
        },
        {
          label: "机器人令牌",
          source: "令牌服务 API",
          values: [
            "TOKEN-C005-01",
            "TOKEN-C005-02",
            "TOKEN-C005-03",
            "TOKEN-C005-04",
            "TOKEN-C005-05",
          ],
        },
        {
          label: "云桌面",
          source: "无影云桌面 API",
          values: [
            "ECS-CNOOC-001",
            "ECS-CNOOC-002",
            "ECS-CNOOC-003",
            "ECS-CNOOC-004",
            "ECS-CNOOC-005",
          ],
        },
      ],
      "tenant-cnooc-cloud-b": [
        {
          label: "云号",
          source: "云号平台 API",
          values: ["186****6621", "186****7810"],
        },
      ],
      "tenant-cnooc-connector-b": [
        {
          label: "连接器",
          source: "连接器管理表",
          values: [
            "小红书-笔记查询",
            "钉钉淘宝前台-登录",
            "淘宝前台-关键词搜索查询",
          ],
        },
      ],
      "tenant-supply-connector": [
        {
          label: "连接器",
          source: "连接器管理表",
          values: ["Amazon SP-API 连接器", "Temu 商家后台-订单查询"],
        },
      ],
      "tenant-data-clouddesk": [
        {
          label: "云桌面",
          source: "无影云桌面 API",
          values: ["ECS-DATA-101", "ECS-DATA-102", "ECS-DATA-103"],
        },
      ],
    };

    const renderAuthProductDetail = (record: AuthTableRecord) => {
      const resourceSourceMap: Partial<Record<AuthDrawerProduct, string>> = {
        cloudPhone: "云号平台 API",
        robotToken: "令牌服务 API",
        cloudDesk: "无影云桌面 API",
      };
      const tooltipProductKeys = record.productKeys?.length
        ? record.productKeys
        : record.productKey && resourceProductKeys.includes(record.productKey)
          ? [record.productKey]
          : [];
      const resourceSections = tooltipProductKeys
        .map<AuthTooltipSection | null>((key) => {
          const detail = authRecordResourceMap[record.key]?.[key];
          if (!detail?.values?.length && !detail?.emptyText) {
            return null;
          }

          return {
            label: productConfigs[key].name,
            source: resourceSourceMap[key] ?? "资源平台 API",
            emptyText: detail.emptyText,
            values: detail.values.map((item) => {
              const lifecycleMeta = getResourceLifecycleMeta(key, item);

              return {
                name: item.name,
                period: resourceProductKeys.includes(key)
                  ? item.period.replace(" - ", "～")
                  : undefined,
                released: item.released || item.lifecycleStatus === "released",
                statusLabel: lifecycleMeta?.label,
                statusTip: lifecycleMeta?.tip ?? lifecycleMeta?.reason,
                statusColor: lifecycleMeta?.color,
              };
            }),
          };
        })
        .filter((item): item is AuthTooltipSection => Boolean(item));
      if (tooltipProductKeys.length && !resourceSections.length) {
        return null;
      }
      const sections = resourceSections.length
        ? resourceSections
        : authRecordDataMap[record.key];
      if (!sections) {
        return null;
      }

      return (
        <div className="auth-data-tooltip">
          {sections.map((section) => (
            <div className="auth-data-tooltip-section" key={section.label}>
              <strong>{section.label}</strong>
              {section.values.length ? (
                section.values.map((value) => {
                  const displayValue =
                    typeof value === "string"
                      ? value
                      : `${value.name}${value.period ?? ""}${value.statusLabel ?? ""}`;
                  return (
                    <span key={displayValue}>
                      {typeof value === "string" ? (
                        value
                      ) : (
                        <>
                          <em>{value.name}</em>
                          {value.period && <i>{value.period}</i>}
                          {value.statusLabel && (
                            <Tooltip title={value.statusTip}>
                              <Tag
                                className="auth-resource-status-tag"
                                color={value.statusColor ?? "default"}
                              >
                                {value.statusLabel}
                              </Tag>
                            </Tooltip>
                          )}
                        </>
                      )}
                    </span>
                  );
                })
              ) : (
                <span className="auth-data-tooltip-empty">
                  {section.emptyText || "暂未获取到资源明细"}
                </span>
              )}
            </div>
          ))}
        </div>
      );
    };

    const handleRefreshResourcePeriod = (record: AuthTableRecord) => {
      const tenantName = record.tenantName ?? record.product;
      setRefreshingAuthTenantKey(record.key);
      window.setTimeout(() => {
        setRefreshingAuthTenantKey(null);
        const refreshRows = [
          {
            key: "success-cloud",
            product: "云号",
            status: "成功",
            result: "同步 4 条资源有效期，1 条缓冲期状态",
          },
          {
            key: "success-token",
            product: "机器人令牌",
            status: "成功",
            result: "同步 5 条令牌有效期",
          },
          {
            key: "failed-clouddesk",
            product: "云桌面",
            status: "部分失败",
            result:
              "ECS-CNOOC-003 已释放，保留原状态；requestId=REQ-REFRESH-20260429-001；traceId=TRACE-REFRESH-20260429-001",
          },
          {
            key: "empty-connector",
            product: "连接器",
            status: "空回传",
            result: "资源平台未返回明细，继续展示授权记录有效期",
          },
        ];

        Modal.info({
          title: "资源有效期刷新结果",
          width: 620,
          okText: "我知道了",
          content: (
            <div className="auth-refresh-result">
              <div className="auth-refresh-result-summary">
                <span>租户：{tenantName}</span>
                <Tag color="orange">部分成功</Tag>
                <span>refreshTaskId：REFRESH-20260429-001</span>
                <span>requestId：REQ-REFRESH-20260429-001</span>
                <span>traceId：TRACE-REFRESH-20260429-001</span>
              </div>
              <Table
                columns={[
                  { title: "产品", dataIndex: "product", width: 110 },
                  {
                    title: "结果",
                    dataIndex: "status",
                    width: 100,
                    render: (value: string) => (
                      <Tag
                        color={
                          value === "成功"
                            ? "success"
                            : value === "部分失败"
                              ? "orange"
                              : "default"
                        }
                      >
                        {value}
                      </Tag>
                    ),
                  },
                  { title: "明细", dataIndex: "result" },
                ]}
                dataSource={refreshRows}
                pagination={false}
                rowKey="key"
                size="small"
              />
              <p>
                失败和空回传项不覆盖旧数据，系统已写入 RESOURCE_PERIOD_REFRESH 日志。
              </p>
            </div>
          ),
        });
      }, 500);
    };

    const handleDeleteAuthorization = (record: AuthTableRecord) => {
      if (record.status === "已过期" || record.status === "已删除") {
        messageApi.warning("已过期或已删除授权不可重复删除");
        return;
      }
      const deleteRequestId = "AUTH-DELETE-20260429-001";
      const deleteTraceId = "TRACE-AUTH-DELETE-20260429-001";
      const deleteReason = "运营在编辑授权抽屉手动删除";
      const recordProductKeys = record.productKeys?.length
        ? record.productKeys
        : record.productKey
          ? [record.productKey]
          : [];
      const hasConnectorProduct = recordProductKeys.some(
        (key) => productConfigs[key].category === "connector",
      );
      const impactRows = [
        {
          key: "product",
          label: "授权产品",
          value: record.products?.join("、") ?? record.product,
        },
        {
          key: "total",
          label: "全部授权数",
          value: `${record.quantitySummary?.totalQty ?? record.qty ?? "-"}（保留历史口径）`,
        },
        {
          key: "usable",
          label: "当前可用数",
          value: `${record.quantitySummary?.currentUsableQty ?? record.qty ?? 0} -> 0`,
        },
        {
          key: "status",
          label: "授权状态",
          value: `${record.status ?? "-"} -> 已删除`,
        },
        {
          key: "reason",
          label: "删除原因",
          value: deleteReason,
        },
      ];
      const transferRows = hasConnectorProduct
        ? [
            {
              key: "success",
              connector: "小红书-笔记查询",
              result: "已承接到授权 B",
              reason: "同产品线、范围匹配、额度充足、生效日期最早",
            },
            {
              key: "failed",
              connector: "小红书-博主信息",
              result: "承接失败",
              reason: "不在新授权记录 B 可选连接器池",
            },
            {
              key: "no-candidate",
              connector: "小红书-店铺经营",
              result: "无可承接",
              reason:
                "同产品线下无待生效且范围匹配的授权，进入已过期页签，状态=失效，invalidReason=无可承接授权",
            },
          ]
        : [];
      const toDeletedAuthRecord = (source: AuthTableRecord): AuthTableRecord => ({
        ...source,
        status: "已删除",
        quantitySummary: source.quantitySummary
          ? {
              ...source.quantitySummary,
              currentUsableQty: 0,
              pendingQty: 0,
            }
          : source.qty
            ? {
                totalQty: source.qty,
                currentUsableQty: 0,
              }
            : undefined,
      });

      Modal.confirm({
        title: "确认删除授权",
        content: (
          <div className="auth-delete-confirm">
            <p>删除后该授权立即失效，当前可用数量清零；该操作不可撤销。</p>
            <div className="auth-delete-impact-list">
              {impactRows.map((item) => (
                <div className="auth-delete-impact-row" key={item.key}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
            {hasConnectorProduct && (
              <p>连接器会立即按自动承接规则重新计算归属，结果会写入日志。</p>
            )}
          </div>
        ),
        okText: "确认删除",
        cancelText: "返回",
        okButtonProps: { danger: true },
        onOk: () => {
          return new Promise<void>((resolve) => {
            setTimeout(() => {
              const deletedRecord = toDeletedAuthRecord(record);
              const beforeSnapshot = {
                status: record.status,
                currentUsableQty:
                  record.quantitySummary?.currentUsableQty ?? record.qty ?? 0,
              };
              setDeletedAuthKeys((prev) =>
                prev.includes(record.key) ? prev : [...prev, record.key],
              );
              setDeletedAuthSnapshots((prev) => ({
                ...prev,
                [record.key]: beforeSnapshot,
              }));
              if (hasConnectorProduct) {
                setConnectorNoCandidateKeys((prev) =>
                  prev.includes("connector-xhs-shop-operation")
                    ? prev
                    : [...prev, "connector-xhs-shop-operation"],
                );
                setConnectorStatusTab("expired");
                setConnectorListProductLine("ecommerce");
              }
              setAuthDetailRecord((prev) =>
                prev?.key === record.key ? deletedRecord : prev,
              );
              resetDrawer();
              Modal.success({
                title: "删除授权结果",
                width: 620,
                okText: "我知道了",
                content: (
                  <div className="auth-delete-result">
                    <div className="auth-delete-result-summary">
                      <Tag color={hasConnectorProduct ? "orange" : "success"}>
                        {hasConnectorProduct ? "部分成功" : "成功"}
                      </Tag>
                      <span>requestId：{deleteRequestId}</span>
                      <span>traceId：{deleteTraceId}</span>
                    </div>
                    <p>
                      授权已进入已删除状态，当前可用数已归零，父级全部授权数保留历史授权数；删除原因：{deleteReason}。
                    </p>
                    {hasConnectorProduct && (
                      <Table
                        columns={[
                          { title: "连接器", dataIndex: "connector" },
                          { title: "承接结果", dataIndex: "result", width: 110 },
                          { title: "原因", dataIndex: "reason" },
                        ]}
                        dataSource={transferRows}
                        pagination={false}
                        rowKey="key"
                        size="small"
                      />
                    )}
                  </div>
                ),
              });
              messageApi.success("删除授权结果和自动承接明细已写入变更日志");
              resolve();
            }, 500);
          });
        },
      });
    };

    const renderAuthProductPeriodItems = (record: AuthTableRecord) => {
      const products = record.products?.length ? record.products : [record.product];
      return products.map((product, index) => {
        const period = record.productPeriods?.[index] ?? record.period;
        return (
          <span className="auth-product-period-item" key={`${record.key}-${product}`}>
            {product}（{period}）
          </span>
        );
      });
    };
    const renderAuthProductCell = (
      value: string,
      record: AuthTableRecord,
    ) => {
      if (!record.children) {
        return { children: null, props: { colSpan: 0 } };
      }

      return (
        <span className="auth-parent-product auth-parent-total-product">
          <span className="auth-product-period-list">
            <Tooltip title="父级展示全部授权数，包含生效中、待生效、已过期、缓冲期、已释放和已删除历史授权数量；当前可用数请展开查看子级明细。">
              <span className="auth-parent-total">
                <strong>{value}</strong>
              </span>
            </Tooltip>
          </span>
        </span>
      );
    };

    const renderAuthProductDetailCell = (record: AuthTableRecord) => (
      <span className="auth-product-period-cell">
        <Tooltip
          classNames={{ root: "auth-data-tooltip-popover" }}
          title={renderAuthProductDetail(record)}
        >
          <span className="auth-product-period-list">
            {renderAuthProductPeriodItems(record)}
          </span>
        </Tooltip>
      </span>
    );

    const renderAuthTenantCell = (
      value: string | undefined,
      record: AuthTableRecord,
    ) => {
      if (record.children) {
        return (
          <span className="auth-tenant-name-cell">
            <span className="auth-tenant-name-text" title={value}>
              {value}
            </span>
            <span className="auth-tenant-refresh-cell">
              <Tooltip title="刷新该租户资源有效期">
                <Button
                  aria-label="刷新该租户资源有效期"
                  className="auth-product-refresh-button"
                  icon={<ReloadOutlined />}
                  loading={refreshingAuthTenantKey === record.key}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleRefreshResourcePeriod(record);
                  }}
                  size="small"
                  type="text"
                />
              </Tooltip>
            </span>
          </span>
        );
      }

      return {
        children: renderAuthProductDetailCell(record),
        props: { colSpan: 3 },
      };
    };

    const authorizationColumns: ColumnsType<AuthTableRecord> = [
      {
        title: "租户名称",
        dataIndex: "tenantName",
        width: 220,
        align: "left" as const,
        render: renderAuthTenantCell,
      },
      {
        title: (
          <span className="auth-ecosystem-column-title">
            所属生态
            <InteractionMarker
              noteId="ecosystemColumn"
              className="auth-ecosystem-column-marker"
            />
          </span>
        ),
        dataIndex: "ecosystem",
        width: 90,
        render: (value: EcosystemName | undefined, record) =>
          record.children
            ? <span className="auth-ecosystem-text">{value || "-"}</span>
            : { children: null, props: { colSpan: 0 } },
      },
      {
        title: "授权产品",
        dataIndex: "product",
        width: 640,
        align: "left" as const,
        render: renderAuthProductCell,
      },
      {
        title: "状态",
        dataIndex: "status",
        width: 100,
        render: (value: AuthStatus | undefined) =>
          value ? <Tag color={authStatusColor[value]}>{value}</Tag> : null,
      },
      {
        title: "授权类型",
        dataIndex: "authType",
        width: 80,
        render: (value) => value || null,
      },
      {
        title: "更新人",
        dataIndex: "updater",
        width: 70,
      },
      {
        title: "更新时间",
        dataIndex: "updateTime",
        width: 150,
      },
      {
        title: "创建人",
        dataIndex: "creator",
        width: 70,
      },
      {
        title: "操作",
        key: "operation",
        width: 140,
        align: "left" as const,
        render: (_, record) =>
          record.children ? (
            <Button
              type="link"
              icon={<PlusOutlined />}
              onClick={() => openAddAuthorization(record.tenantName)}
            >
              添加授权
            </Button>
          ) : (
            <div className="auth-operation-cell">
              {record.status !== "已删除" && (
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => openEditAuthorization(record)}
                >
                  编辑
                </Button>
              )}
              <Button
                type="link"
                icon={<EyeOutlined />}
                onClick={() => setAuthDetailRecord(record)}
              >
                详情
              </Button>
            </div>
          ),
      },
    ];

    const authDetailProductKeys = authDetailRecord
      ? authDetailRecord.productKeys?.length
        ? authDetailRecord.productKeys
        : authDetailRecord.productKey
          ? [authDetailRecord.productKey]
          : []
      : [];
    const authDetailHasConnector = authDetailProductKeys.some(
      (key) => productConfigs[key].category === "connector",
    );
    const authDetailHasCloudDesk = authDetailProductKeys.includes("cloudDesk");
    const authDetailCloudDeskDuration = authDetailRecord
      ? getCloudDeskDurationFromRange(
          authDetailRecord.period
            .split(" - ")
            .map((date) => dayjs(date)) as [Dayjs, Dayjs],
        )
      : undefined;
    const authDetailCloudDeskAfter = authDetailCloudDeskDuration
      ? `授权时长=${authDetailCloudDeskDuration} 个月；缓冲期=14 天；自动释放日按结束日 +15 天计算`
      : "授权时长沿用原记录；缓冲期=14 天；自动释放日按结束日 +15 天计算";
    const authDetailHasBatchFailure =
      authDetailRecord?.key === "tenant-cnooc-cloud-a";
    const authDetailWasDeleted = Boolean(
      authDetailRecord &&
        (authDetailRecord.status === "已删除" ||
          deletedAuthKeys.includes(authDetailRecord.key)),
    );
    const authDetailDeleteSnapshot = authDetailRecord
      ? deletedAuthSnapshots[authDetailRecord.key]
      : undefined;

    const authDetailChangeLog: Array<{
      key: string;
      time: string;
      operator: string;
      source: string;
      status: string;
      action: string;
      actionType: string;
      requestId: string;
      traceId: string;
      content: string;
      before: string;
      after: string;
      failReason?: string;
    }> = authDetailRecord
      ? [
          {
            key: `${authDetailRecord.key}-create`,
            time:
              authDetailRecord.updateTime.replace(
                /(\d{2}:\d{2}):\d{2}$/,
                "$1:12",
              ) || authDetailRecord.updateTime,
            operator: authDetailRecord.creator,
            source: "人工",
            status: "成功",
            action: "创建授权",
            actionType: "CREATE_AUTH",
            requestId: `REQ-${authDetailRecord.key}-CREATE`,
            traceId: `TRACE-${authDetailRecord.key}`,
            content: `新增 ${authDetailRecord.products?.join("、") ?? authDetailRecord.product}，有效期 ${authDetailRecord.period}`,
            before: "无",
            after: `产品=${authDetailRecord.products?.join("、") ?? authDetailRecord.product}；全部授权数=${authDetailRecord.quantitySummary?.totalQty ?? authDetailRecord.qty ?? "-"}；有效期=${authDetailRecord.period}`,
          },
          {
            key: `${authDetailRecord.key}-update`,
            time: authDetailRecord.updateTime,
            operator: authDetailRecord.updater,
            source: "人工",
            status: "成功",
            action: "编辑授权",
            actionType: "UPDATE_AUTH",
            requestId: `REQ-${authDetailRecord.key}-UPDATE`,
            traceId: `TRACE-${authDetailRecord.key}`,
            content: "更新原授权记录，刷新父级全部授权数、当前可用数和资源状态",
            before: `当前可用=${authDetailRecord.quantitySummary?.currentUsableQty ?? authDetailRecord.qty ?? "-"}；状态=${authDetailRecord.status}`,
            after:
              authDetailHasCloudDesk
                ? authDetailCloudDeskAfter
                : "资源有效期按自然日闭区间保存；结束日次日 0 点不再计入",
          },
          ...(authDetailWasDeleted
            ? [
                {
                  key: `${authDetailRecord.key}-delete`,
                  time: dayjs(authDetailRecord.updateTime)
                    .add(1, "minute")
                    .format("YYYY-MM-DD HH:mm:ss"),
                  operator: authDetailRecord.updater,
                  source: "人工",
                  status: "成功",
                  action: "删除授权",
                  actionType: "DELETE_AUTH",
                  requestId: "AUTH-DELETE-20260429-001",
                  traceId: "TRACE-AUTH-DELETE-20260429-001",
                  content:
                    "授权立即失效，当前可用数归零，父级全部授权数保留历史授权数；删除原因=运营在编辑授权抽屉手动删除",
                  before: `状态=${authDetailDeleteSnapshot?.status ?? "删除前状态"}；当前可用=${authDetailDeleteSnapshot?.currentUsableQty ?? authDetailRecord.qty ?? "-"}`,
                  after: "状态=已删除；当前可用=0",
                },
                ...(authDetailHasConnector
                  ? [
                      {
                        key: `${authDetailRecord.key}-delete-transfer`,
                        time: dayjs(authDetailRecord.updateTime)
                          .add(2, "minute")
                          .format("YYYY-MM-DD HH:mm:ss"),
                        operator: "系统",
                        source: "系统自动承接",
                        status: "部分成功",
                        action: "连接器自动承接",
                        actionType: "CONNECTOR_AUTO_TRANSFER",
                        requestId: "AUTH-DELETE-20260429-001",
                        traceId: "TRACE-AUTH-DELETE-20260429-001",
                        content:
                          "删除授权后立即重算连接器归属，成功、失败和无可承接原因均回写",
                        before: "currentAuthId=当前授权；nextAuthId=空",
                        after:
                          "部分连接器 nextAuthId=授权 B；无候选连接器 status=失效；invalidReason=无可承接授权",
                        failReason: "小红书-店铺经营无可承接授权",
                      },
                    ]
                  : []),
              ]
            : []),
          {
            key: `${authDetailRecord.key}-refresh`,
            time: dayjs(authDetailRecord.updateTime)
              .add(1, "minute")
              .format("YYYY-MM-DD HH:mm:ss"),
            operator: authDetailRecord.updater,
            source: "资源平台同步",
            status: "部分成功",
            action: "资源有效期刷新",
            actionType: "RESOURCE_PERIOD_REFRESH",
            requestId: "REQ-REFRESH-20260429-001",
            traceId: "TRACE-REFRESH-20260429-001",
            content:
              "按租户刷新云号、机器人令牌、云桌面资源有效期，成功项更新展示，失败和空回传项保留旧数据",
            before: "资源有效期=刷新前记录；部分资源状态未知",
            after: "成功资源写入最新有效期；失败资源保留原值；空回传不生成模拟资源",
            failReason: "ECS-CNOOC-003 已释放；连接器资源平台空回传",
          },
          ...(authDetailHasConnector
            ? [
                {
                  key: `${authDetailRecord.key}-auto-transfer`,
                  time: dayjs(authDetailRecord.updateTime)
                    .add(2, "minute")
                    .format("YYYY-MM-DD HH:mm:ss"),
                  operator: "系统",
                  source: "系统自动承接",
                  status: "成功",
                  action: "连接器自动承接",
                  actionType: "CONNECTOR_AUTO_TRANSFER",
                  requestId: `REQ-${authDetailRecord.key}-TRANSFER`,
                  traceId: `TRACE-${authDetailRecord.key}`,
                  content:
                    "当前授权到期后按同产品线、范围匹配、额度充足、生效日期最早重算连接器归属",
                  before: "currentAuthId=A；nextAuthId=空",
                  after: "nextAuthId=B；invalidReason=空",
                },
              ]
            : []),
          ...(authDetailHasBatchFailure
            ? [
                {
                  key: `${authDetailRecord.key}-partial-fail`,
                  time: dayjs(authDetailRecord.updateTime)
                    .add(4, "minute")
                    .format("YYYY-MM-DD HH:mm:ss"),
                  operator: authDetailRecord.updater,
                  source: "人工",
                  status: "部分成功",
                  action: "批量设置资源有效期",
                  actionType: "RESOURCE_PERIOD_BATCH_UPDATE",
                  requestId: `REQ-${authDetailRecord.key}-BATCH`,
                  traceId: `TRACE-${authDetailRecord.key}`,
                  content:
                    "可续期资源已保存，已销号/已释放资源自动跳过并返回明细",
                  before: "资源明细中存在缓冲期、已释放状态",
                  after: "成功项写入新有效期；失败项保留原状态和失败原因",
                  failReason: "ECS-CNOOC-003 已释放，186****5872 已销号",
                },
              ]
            : []),
        ]
      : [];

    return (
      <div className="authorization-prototype">
        <section className="auth-page-frame auth-admin-frame">
          <div className="auth-filter-row">
            <span className="auth-filter-marker-wrap">
              <Select
                className="auth-filter-select"
                allowClear
                onChange={(value?: EcosystemName) => setEcosystemFilter(value)}
                options={ecosystemOptions.map((value) => ({ label: value, value }))}
                placeholder="所属生态"
                value={ecosystemFilter}
              />
              <InteractionMarker
                noteId="ecosystemFilter"
                className="auth-ecosystem-filter-marker"
              />
            </span>
            <Input
              allowClear
              className="auth-filter-input"
              onChange={(event) => setTenantNameFilter(event.target.value)}
              placeholder="租户名称"
              value={tenantNameFilter}
            />
            <Input
              allowClear
              className="auth-filter-input"
              onChange={(event) => setUpdaterFilter(event.target.value)}
              placeholder="更新人"
              value={updaterFilter}
            />
            <RangePicker
              allowClear
              className="auth-filter-range"
              onChange={(range) => setUpdateDateRange(range)}
              placeholder={["更新日期起", "更新日期止"]}
              value={updateDateRange}
            />
            <Select
              allowClear
              className="auth-filter-select"
              onChange={(value?: AuthDrawerProduct) => setAuthProductFilter(value)}
              options={productFilterOptions}
              placeholder="授权产品"
              value={authProductFilter}
            />
            <Input
              allowClear
              className="auth-filter-input"
              onChange={(event) => setCreatorFilter(event.target.value)}
              placeholder="创建人"
              value={creatorFilter}
            />
            <RangePicker
              allowClear
              className="auth-filter-range"
              onChange={(range) => setCreateDateRange(range)}
              placeholder={["创建日期起", "创建日期止"]}
              value={createDateRange}
            />
            <Button type="link" onClick={resetAuthFilters}>
              重置
            </Button>
            <span className="auth-new-button-wrap">
              <Button type="primary" onClick={() => openAddAuthorization()}>
                + 新增授权
              </Button>
            </span>
          </div>

          <div className="auth-table-panel">
            <Table<AuthTableRecord>
              className="auth-data-table"
              columns={authorizationColumns}
              dataSource={filteredAuthorizationRows}
              expandable={{
                expandedRowKeys: expandedAuthTenantKeys,
                onExpandedRowsChange: (keys) =>
                  setExpandedAuthTenantKeys([...keys]),
                expandIcon: ({ expanded, onExpand, record }) =>
                  record.children ? (
                    <Button
                      aria-label={expanded ? "收起授权记录" : "展开授权记录"}
                      className="auth-expand-button"
                      icon={expanded ? <DownOutlined /> : <RightOutlined />}
                      onClick={(event) => onExpand(record, event)}
                      type="text"
                    />
                  ) : null,
              }}
              pagination={{
                pageSize: 20,
                total: filteredAuthorizationRows.length,
                pageSizeOptions: ["10", "20", "50"],
                showQuickJumper: true,
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 个租户`,
              }}
              rowClassName={(record) =>
                record.children
                  ? "auth-tenant-row"
                  : `auth-child-row${
                      record.status === "已过期" || record.status === "已删除"
                        ? " auth-child-row-expired"
                        : ""
                    }`
              }
              rowKey="key"
              size="middle"
            />
          </div>
        </section>

        <Drawer
          className="auth-real-drawer"
          title={authDrawerTitle}
          width={480}
          open={authDrawerOpen}
          onClose={resetDrawer}
          destroyOnClose
          footer={
            <Space>
              <Button onClick={resetDrawer}>取消</Button>
              <Button
                type="primary"
                onClick={() => {
                  if (!validateAuthDrawerBeforeSubmit()) {
                    messageApi.warning("请先完善必填项和有效期");
                    return;
                  }
                  messageApi.success(
                    authDrawerTitle === "编辑授权"
                      ? "已保存授权编辑"
                      : "已保存新增授权",
                  );
                  resetDrawer();
                }}
              >
                确定
              </Button>
            </Space>
          }
        >
          <div className="auth-drawer-body">
            <div className="auth-field-block">
              <label>
                <em>*</em> 授权租户
              </label>
              <div className="auth-tenant-select-wrap">
                <Select
                  showSearch
                  allowClear
                  disabled={authDrawerTitle === "编辑授权"}
                  value={drawerTenantInput || undefined}
                  options={mockTenants.map((t) => ({
                    value: t.value,
                    label: t.value,
                  }))}
                  filterOption={(input, option) =>
                    String(option?.label ?? "").includes(input)
                  }
                  onChange={(v?: string) => {
                    const t = mockTenants.find((m) => m.value === v);
                    setDrawerTenantInput(v ?? "");
                    setDrawerTenantInfo(
                      t ? { id: t.id, name: t.value, admin: t.admin } : null,
                    );
                    setAuthDrawerErrors((prev) => {
                      const next = { ...prev };
                      delete next.tenant;
                      return next;
                    });
                  }}
                  placeholder="请输入授权租户"
                  status={authDrawerErrors.tenant ? "error" : undefined}
                  style={{ width: "100%" }}
                />
                {authDrawerErrors.tenant && (
                  <span className="auth-field-error">
                    {authDrawerErrors.tenant}
                  </span>
                )}
              </div>
            </div>

            {drawerTenantInfo && (
              <>
                <div className="auth-tenant-info-row">
                  <span className="auth-tenant-info-label">租户ID</span>
                  <span className="auth-tenant-info-value">
                    {drawerTenantInfo.id}
                  </span>
                </div>
                <div className="auth-tenant-info-row">
                  <span className="auth-tenant-info-label">租户管理员</span>
                  <span className="auth-tenant-info-value">
                    {drawerTenantInfo.admin}
                  </span>
                </div>
              </>
            )}

            <div className="auth-field-block">
              <label>授权类型</label>
              <Radio.Group defaultValue="ecommerce">
                <Radio value="ecommerce">电商sass</Radio>
              </Radio.Group>
            </div>

            <div className="auth-field-block">
              <label>可授权权益</label>
              {authDrawerErrors.products && (
                <span className="auth-field-error">
                  {authDrawerErrors.products}
                </span>
              )}
              <div className="auth-product-row-list">
                {visibleDrawerProducts.map(renderProductRow)}
              </div>
              {authDrawerTitle === "编辑授权" && editingAuthRecord && (
                <div className="auth-delete-zone">
                  <div className="auth-delete-zone-copy">
                    <strong>删除授权</strong>
                    <span>立即失效，当前可用数归零，保留审计日志。</span>
                  </div>
                  <div className="auth-delete-zone-action">
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      disabled={
                        editingAuthRecord.status === "已过期" ||
                        editingAuthRecord.status === "已删除"
                      }
                      onClick={() => handleDeleteAuthorization(editingAuthRecord)}
                    >
                      删除授权
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Drawer>
        <Drawer
          className="auth-real-drawer"
          title="授权详情"
          width={520}
          open={Boolean(authDetailRecord)}
          onClose={() => setAuthDetailRecord(null)}
          destroyOnClose
        >
          {authDetailRecord && (
            <div className="auth-detail-content">
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="授权租户">
                  {authDetailRecord.tenantName}
                </Descriptions.Item>
                <Descriptions.Item label="授权产品">
                  {authDetailRecord.products?.join("、") ??
                    authDetailRecord.product}
                </Descriptions.Item>
                <Descriptions.Item label="授权有效期">
                  {authDetailRecord.period}
                </Descriptions.Item>
                <Descriptions.Item label="全部授权数">
                  {authDetailRecord.quantitySummary?.totalQty ??
                    authDetailRecord.qty ??
                    "-"}
                </Descriptions.Item>
                <Descriptions.Item label="当前可用数">
                  {authDetailRecord.quantitySummary?.currentUsableQty ??
                    (authDetailRecord.status === "生效中"
                      ? authDetailRecord.qty
                      : 0) ??
                    "-"}
                </Descriptions.Item>
                <Descriptions.Item label="状态">
                  {authDetailRecord.status}
                </Descriptions.Item>
                <Descriptions.Item label="更新人">
                  {authDetailRecord.updater}
                </Descriptions.Item>
                <Descriptions.Item label="更新时间">
                  {authDetailRecord.updateTime}
                </Descriptions.Item>
                <Descriptions.Item label="创建人">
                  {authDetailRecord.creator}
                </Descriptions.Item>
              </Descriptions>

            <section className="auth-detail-log">
                <h3>
                  变更日志
                </h3>
                <div className="auth-detail-log-list">
                  {authDetailChangeLog.map((item) => (
                    <article className="auth-detail-log-item" key={item.key}>
                      <div className="auth-detail-log-meta">
                        <span>{item.time}</span>
                        <span>{item.action}</span>
                        <span>{item.actionType}</span>
                        <span>{item.operator}</span>
                        <span>{item.source}</span>
                        <span>{item.requestId}</span>
                        <span>{item.traceId}</span>
                        <Tag
                          color={item.status === "部分成功" ? "orange" : "success"}
                        >
                          {item.status}
                        </Tag>
                      </div>
                      <p>{item.content}</p>
                      {item.failReason && (
                        <div className="auth-detail-log-fail">
                          失败原因：{item.failReason}
                        </div>
                      )}
                      <div className="auth-detail-log-diff">
                        <span>Before：{item.before}</span>
                        <span>After：{item.after}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          )}
        </Drawer>

        <Modal
          title={
            batchPeriodTarget
              ? batchPeriodTarget.productKey === "cloudDesk"
                ? "批量设置云桌面授权时长"
                : `批量设置${productConfigs[batchPeriodTarget.productKey].name}有效期`
              : "批量设置时间"
          }
          open={Boolean(batchPeriodTarget)}
          onCancel={() => {
            setBatchPeriodTarget(null);
            setBatchPeriodDates([null, null]);
            setBatchPeriodFailures([]);
            setBatchCloudDeskDuration(12);
          }}
          onOk={() => {
            if (!batchPeriodTarget) {
              return;
            }
            const isCloudDeskBatch =
              batchPeriodTarget.productKey === "cloudDesk";
            const nextBatchDates: [Dayjs | null, Dayjs | null] =
              isCloudDeskBatch
                ? [
                    batchPeriodDates[0],
                    getCloudDeskEndDate(
                      batchPeriodDates[0],
                      batchCloudDeskDuration,
                    ),
                  ]
                : batchPeriodDates;
            if (isCloudDeskBatch && !batchPeriodDates[0]) {
              messageApi.warning("请选择云桌面授权开始日期");
              return;
            }
            if (!isCloudDeskBatch) {
              const batchPeriodError = getAuthorizationDateError(
                nextBatchDates,
                batchPeriodTarget.productKey,
                productConfigs[batchPeriodTarget.productKey].name,
              );
              if (batchPeriodError) {
                messageApi.warning(batchPeriodError);
                return;
              }
            }
            const batchResources =
              authRecordResourceMap[batchPeriodTarget.recordKey]?.[
                batchPeriodTarget.productKey
              ]?.values ?? [];
            const editableResources = batchResources.filter(
              (resource) =>
                !isNonRenewableResource(
                  batchPeriodTarget.productKey,
                  resource,
                ),
            );
            const failedResources = batchResources
              .filter((resource) =>
                isNonRenewableResource(batchPeriodTarget.productKey, resource),
              )
              .map((resource) => {
                const lifecycleMeta = getResourceLifecycleMeta(
                  batchPeriodTarget.productKey,
                  resource,
                );
                return {
                  key: `${batchPeriodTarget.productKey}-${resource.name}`,
                  resourceName: resource.name,
                  currentStatus: lifecycleMeta?.label ?? "不可续期",
                  reason:
                    lifecycleMeta?.reason ??
                    "资源已释放或已销号，不允许覆盖有效期",
                  nextStep:
                    batchPeriodTarget.productKey === "cloudPhone"
                      ? "如需继续使用需重新授权云号"
                      : "如需继续使用需重新开通云桌面实例",
                };
              });
            if (!editableResources.length) {
              setBatchPeriodFailures(failedResources);
              messageApi.warning("当前资源均不可续期，无法批量设置时间");
              return;
            }
            applyGlobalProductDates(
              batchPeriodTarget.recordKey,
              batchPeriodTarget.productKey,
              nextBatchDates,
            );
            if (isCloudDeskBatch) {
              setDrawerCloudDeskDuration((prev) => ({
                ...prev,
                cloudDesk: batchCloudDeskDuration,
              }));
              setDrawerCloudDeskResourceDuration((prev) => {
                const next = { ...prev };
                editableResources.forEach((resource) => {
                  next[
                    buildResourceDateKey(
                      batchPeriodTarget.recordKey,
                      "cloudDesk",
                      resource.name,
                    )
                  ] = batchCloudDeskDuration;
                });
                return next;
              });
            }
            if (failedResources.length) {
              setBatchPeriodFailures(failedResources);
              messageApi.warning(
                `已同步 ${editableResources.length} 个可续期资源，${failedResources.length} 个失败项已保留在弹窗内`,
              );
              return;
            }
            setBatchPeriodFailures([]);
            messageApi.success(
              isCloudDeskBatch
                ? "已批量同步云桌面授权时长"
                : "已批量同步具体资源有效期",
            );
            setBatchPeriodTarget(null);
            setBatchPeriodDates([null, null]);
            setBatchCloudDeskDuration(12);
          }}
          okText="确定"
          cancelText="取消"
          okButtonProps={{
            disabled:
              batchPeriodTarget?.productKey === "cloudDesk"
                ? !batchPeriodDates[0]
                : !batchPeriodDates[0] || !batchPeriodDates[1],
          }}
        >
          <div className="auth-batch-period-modal">
            <p>
              {batchPeriodTarget?.productKey === "cloudDesk"
                ? "设置后会同步覆盖当前产品下全部可续期云桌面的开始日期和授权时长；已释放资源自动跳过，失败项会返回明细并保留在抽屉内。"
                : "设置后会同步覆盖当前产品下全部可续期资源的有效期；已销号/已释放资源自动跳过，失败项会返回明细并保留在抽屉内。"}
            </p>
            {batchPeriodTarget?.productKey === "cloudDesk" ? (
              <div className="auth-cloud-duration-grid">
                <DatePicker
                  value={batchPeriodDates[0]}
                  onChange={(value) => setBatchPeriodDates([value, null])}
                  placeholder="授权开始日期"
                />
                <Select
                  value={batchCloudDeskDuration}
                  options={cloudDeskDurationOptions}
                  onChange={setBatchCloudDeskDuration}
                />
              </div>
            ) : (
              <RangePicker
                value={batchPeriodDates}
                onChange={(vals) =>
                  setBatchPeriodDates(vals ? [vals[0], vals[1]] : [null, null])
                }
                placeholder={["开始日期", "结束日期"]}
                style={{ width: "100%" }}
              />
            )}
            {batchPeriodFailures.length > 0 && (
              <div className="auth-batch-failure-panel">
                <div className="auth-batch-failure-title">
                  <span>失败明细</span>
                  <Tag color="orange">部分成功</Tag>
                </div>
                <Table<BatchPeriodFailure>
                  columns={[
                    { title: "资源", dataIndex: "resourceName" },
                    { title: "当前状态", dataIndex: "currentStatus", width: 90 },
                    { title: "失败原因", dataIndex: "reason" },
                    { title: "处理建议", dataIndex: "nextStep" },
                  ]}
                  dataSource={batchPeriodFailures}
                  pagination={false}
                  rowKey="key"
                  size="small"
                />
              </div>
            )}
          </div>
        </Modal>

        <Modal
          title="添加连接器"
          open={connectorModalOpen}
          onCancel={() => {
            setConnectorModalOpen(false);
            setConnectorModalTarget("");
            setConnectorModalDraftItems([]);
          }}
          onOk={() => {
            setDrawerConnectorItems((prev) => ({
              ...prev,
              [connectorModalTarget]: connectorModalDraftItems,
            }));
            setAuthDrawerErrors((prev) => {
              const next = { ...prev };
              delete next[`connectors:${connectorModalTarget}`];
              return next;
            });
            setConnectorModalOpen(false);
            setConnectorModalTarget("");
            setConnectorModalDraftItems([]);
          }}
          width={680}
          okText="确定"
          cancelText="取消"
          okButtonProps={{ disabled: !connectorModalDraftItems.length }}
        >
          <Table
            size="small"
            rowSelection={{
              selectedRowKeys: connectorModalDraftItems,
              onChange: (keys) =>
                setConnectorModalDraftItems(keys as string[]),
            }}
            columns={[
              { title: "连接器名称", dataIndex: "name" },
              { title: "连接器 ID", dataIndex: "id", width: 180 },
              { title: "平台类型", dataIndex: "platform", width: 90 },
              { title: "平台名称", dataIndex: "platformName", width: 100 },
            ]}
            dataSource={mockConnectorList
              .filter((item) =>
                connectorModalTarget
                  ? item.productKeys.includes(
                      connectorModalTarget as AuthDrawerProduct,
                    )
                  : true,
              )
              .map((item) => ({
                key: item.id,
                id: item.id,
                name: item.name,
                platform: item.platform,
                platformName: item.platformName,
              }))}
            pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条记录` }}
          />
        </Modal>
      </div>
    );
  };

  return (
    <>
      {contextHolder}
      {renderAuthorizationAdminPage()}
    </>
  );
}
