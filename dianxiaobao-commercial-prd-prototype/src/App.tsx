import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  ConfigProvider,
  DatePicker,
  Descriptions,
  Drawer,
  Dropdown,
  Empty,
  Flex,
  Form,
  Input,
  InputNumber,
  Layout,
  Modal,
  Pagination,
  Popover,
  Progress,
  Radio,
  Select,
  Segmented,
  Space,
  Statistic,
  Switch,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  Upload,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  AppstoreOutlined,
  BarChartOutlined,
  BellOutlined,
  CheckOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ContainerOutlined,
  CustomerServiceOutlined,
  CloseOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  DesktopOutlined,
  DownOutlined,
  EditOutlined,
  ExportOutlined,
  FileTextOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  KeyOutlined,
  LineChartOutlined,
  LeftOutlined,
  MessageOutlined,
  MenuFoldOutlined,
  NotificationOutlined,
  PhoneOutlined,
  PlusOutlined,
  ReloadOutlined,
  RightOutlined,
  SearchOutlined,
  SettingOutlined,
  ShopOutlined,
  StarOutlined,
  TableOutlined,
  UploadOutlined,
  UserOutlined,
  MoreOutlined,
  ShoppingCartOutlined,
  TagOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import {
  Box,
  ChevronLeft,
  CircleHelp,
  Database as DatabaseIcon,
  Grid2X2,
  List,
  LogIn,
  MoreVertical,
  Package,
  Search as SearchIcon,
  Sparkles,
  Trash2,
  UserRound,
  X as XIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from "react";
import type { ReactNode } from "react";
import AuthorizationAdmin407Page from "./AuthorizationAdmin407Page";
import { Alert as UiAlert } from "@/components/ui/alert";
import { Avatar as UiAvatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge as UiBadge } from "@/components/ui/badge";
import { Button as UiButton } from "@/components/ui/button";
import {
  Card as UiCard,
  CardContent as UiCardContent,
  CardHeader as UiCardHeader,
  CardTitle as UiCardTitle,
} from "@/components/ui/card";
import { Input as UiInput } from "@/components/ui/input";
import { ScrollArea as UiScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip as UiTooltip,
  TooltipContent as UiTooltipContent,
  TooltipProvider as UiTooltipProvider,
  TooltipTrigger as UiTooltipTrigger,
} from "@/components/ui/tooltip";
import dxbLogoUrl from "@/assets/dianxiaobao-logo.png";

const { Content, Header, Sider } = Layout;
const { Text, Title } = Typography;

function TablerChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "icon icon-tabler icons-tabler-outline icon-tabler-chevron-down"}
      aria-hidden="true"
      focusable="false"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M6 9l6 6l6 -6" />
    </svg>
  );
}

type WorkspaceTab = "prd" | "prototype";
type PrototypeSurface = "backend" | "frontend";
type BackendPage = "platformType" | "tenantManagement" | "dataDashboard" | "resourceManagement" | "orderManagement" | "operationLogs";
type FrontendPage = "plugin" | "dataSource";
type PrototypePage = BackendPage | FrontendPage;
type PrototypeMenuKey = "prd" | "backend" | "plugin" | "dataSource";
type PackageType = "platform" | "device";
type ResourceModalKind = "platformPackage" | "saleCycle" | "devicePackage" | null;

interface ResourceFormValues {
  platformType?: string;
  platform?: string;
  connectors?: string[];
  platformName?: string;
  deviceName?: string;
  deviceType?: string;
  cloudProvider?: string;
  trialDays?: number;
  periodDays?: number;
  originalPrice?: number;
  discount?: number;
  status?: boolean;
}

interface ProductSku {
  key: string;
  name: string;
  type: PackageType;
  description: string;
  cycle: string;
  price: number;
  originalPrice: number;
  trialDays?: number;
  deviceCount?: number;
  status: "已上架" | "未上架";
}

interface OrderRow {
  key: string;
  orderNo: string;
  externalPayNo: string;
  ecosystem: string;
  tenant: string;
  orderType: string;
  product: string;
  memberVersion: string;
  saleCycle: string;
  platformLimit: number;
  selectedPlatforms: string[];
  amount: number;
  paymentStatus: string;
  entitlementStatus: string;
  createdAt: string;
  paidAt: string;
  source: string;
  failureReason?: string;
  callbackInfo: string;
  retryRecords: string[];
}

interface SaleCycle {
  key: string;
  name: string;
  period: string;
  originalPrice: number;
  discount: string;
  price: number;
  status: "已上架" | "未上架";
}

interface ResourceGroup {
  key: string;
  logo: string;
  name: string;
  appId?: string;
  connectorCount?: number;
  connectors?: string[];
  trialDays: number;
  type: PackageType;
  deviceType?: string;
  cloudProvider?: string;
  cycles: SaleCycle[];
}

interface SubscriptionItem {
  key: string;
  product: string;
  tags?: string[];
  status: "未开始" | "使用中" | "已过期";
  period: string;
  source: string;
  orderNo?: string;
  endAt?: string;
}

interface SubscriptionTenant {
  key: string;
  tenant: string;
  ecology: string;
  platformSummary: string;
  deviceSummary: string;
  subscriptions: SubscriptionItem[];
  commercialEntitlement?: {
    memberName: string;
    memberStatus: "未开通" | "试用中" | "已付费" | "已到期" | "发放失败";
    source: string;
    startAt: string;
    endAt: string;
    memberPeriod: string;
    dailyLimit: string;
    concurrency: string;
    platformLimit: number;
    platforms: string;
    selectedPlatforms: string[];
    openedConnectorAuths: string;
    trialStatus: string;
    platformItems: Array<{
      name: string;
      status: string;
      startAt: string;
      endAt: string;
      includedInMember: string;
      purchaseType: string;
      connector: string;
    }>;
    orderSource: string;
    orderNo: string;
    payNo: string;
    amount: string;
    paymentStatus: string;
    grantStatus: string;
    grantTime: string;
    trialDays: string;
    trialStartAt: string;
    trialEndAt: string;
    trialAdjusted: string;
    adjustmentReason: string;
    resourceStatus: string;
    operationLogs: string[];
  };
}

interface OperationLogRow {
  key: string;
  operator: string;
  type: string;
  target: string;
  change: string;
  time: string;
}

interface DashboardTenantStatusRow {
  key: string;
  stage: string;
  tenantCount: number;
  ratio: string;
  definition: string;
}

interface DashboardEcosystemRow {
  key: string;
  ecosystem: string;
  totalTenants: number;
  trialTenants: number;
  paidTenants: number;
  revenue: number;
  cost: number;
  grossMargin: string;
}

interface DashboardPlatformRevenueRow {
  key: string;
  rank: number;
  packageName: string;
  packageType: string;
  paidOrders: number;
  paidTenants: number;
  revenue: number;
  renewalRate: string;
  grossMargin: string;
}

interface DashboardCloudCostRow {
  key: string;
  resourceName: string;
  openedCount: number;
  usageRate: string;
  idleCount: number;
  cost: number;
  revenue: number;
  grossMargin: string;
}

interface DashboardTaskHealthRow {
  key: string;
  taskType: string;
  taskCount: number;
  successRate: string;
  failedCount: number;
  failureReason: string;
  affectedTenants: number;
}

type DashboardPeriod = "day" | "week" | "month";

interface DashboardPeriodSummary {
  ecosystem: string;
  tenantTotal: number;
  tenantTotalCompare: number;
  activeTenants: number;
  trialTenants: number;
  paidTenants: number;
  newTenants: number;
  newTenantsCompare: number;
  trialConversionRate: number;
  trialConversionCompare: number;
  paidRate: number;
  paidRateCompare: number;
  paymentSuccessRate: number;
  paymentSuccessCompare: number;
  expiredTrialUnpaid: number;
  expiredTrialCompare: number;
  periodResourceCost: number;
  resourceCostCompare: number;
  periodRevenue: number;
  revenueCompare: number;
  paidOrders: number;
  paidOrdersCompare: number;
  arpu: number;
  arpuCompare: number;
  grossProfit: number;
  grossProfitCompare: number;
  grossMargin: number;
  grossMarginCompare: number;
  periodTaskCount: number;
  taskCountCompare: number;
  failedTaskCount: number;
  failedTaskCompare: number;
  avgDuration: string;
  avgDurationCompare: string;
  successRate: number;
  successRateCompare: number;
}

interface DashboardFollowUpTenantRow {
  key: string;
  tenant: string;
  ecosystem: string;
  currentStatus: string;
  reason: string;
  suggestedAction: string;
  owner: string;
}

type TenantAuthStatus = "使用中" | "未开始" | "已过期" | "暂无订阅";

interface TenantAuthRecord {
  key: string;
  index?: number;
  tenantName?: string;
  ecology?: string;
  product: string;
  tags?: string[];
  period: string;
  expireAt?: string;
  authType?: string;
  updater: string;
  updateTime: string;
  creator: string;
  createTime: string;
  status?: TenantAuthStatus;
  orderNo?: string;
  children?: TenantAuthRecord[];
  commercialEntitlement?: SubscriptionTenant["commercialEntitlement"];
}

type TenantColumnKey =
  | "index"
  | "tenantName"
  | "product"
  | "authScope"
  | "expireAt"
  | "authType"
  | "memberStatus"
  | "commercialEntitlement"
  | "platformLimit"
  | "selectedPlatforms"
  | "orderNo"
  | "updater"
  | "updateTime"
  | "creator"
  | "createTime"
  | "action";

const defaultTenantColumnWidths: Record<TenantColumnKey, number> = {
  index: 48,
  tenantName: 130,
  product: 100,
  authScope: 120,
  expireAt: 96,
  authType: 96,
  memberStatus: 90,
  commercialEntitlement: 96,
  platformLimit: 104,
  selectedPlatforms: 150,
  orderNo: 132,
  updater: 64,
  updateTime: 112,
  creator: 64,
  createTime: 112,
  action: 72,
};

interface PlatformTypeRow {
  key: string;
  name: string;
  iconText: string;
  iconClass: string;
  platformPackage: string;
  devicePackage: string;
  trial: string;
  status: "已上架" | "未上架";
}

interface RuleRow {
  noteId: keyof typeof interactionNotes;
  title: string;
  rule: string;
  exception: string;
  level?: number;
  parent?: boolean;
  children?: RuleRow[];
}

interface InteractionNote {
  number: string;
  title: string;
  page: PrototypePage;
  placement?: "top" | "bottom" | "left" | "right" | "bottomLeft" | "bottomRight";
  sections: Array<{ label: string; text: string }>;
}

const skuRows: ProductSku[] = [
  {
    key: "sycm-month",
    name: "生意参谋月卡",
    type: "platform",
    description: "店铺经营数据、商品、流量和交易日报",
    cycle: "30 天",
    price: 299,
    originalPrice: 399,
    trialDays: 7,
    status: "已上架",
  },
  {
    key: "alimama-season",
    name: "阿里妈妈季卡",
    type: "platform",
    description: "推广消耗、计划效果、投产分析",
    cycle: "90 天",
    price: 799,
    originalPrice: 999,
    trialDays: 3,
    status: "已上架",
  },
  {
    key: "douyin-year",
    name: "抖店经营年卡",
    type: "platform",
    description: "订单、商品、直播与经营数据",
    cycle: "365 天",
    price: 2999,
    originalPrice: 3999,
    trialDays: 0,
    status: "未上架",
  },
  {
    key: "device-1",
    name: "云设备授权 1 台",
    type: "device",
    description: "适合单店运营，支持 1 台云设备执行登录和取数",
    cycle: "30 天",
    price: 159,
    originalPrice: 199,
    deviceCount: 1,
    status: "已上架",
  },
  {
    key: "device-3",
    name: "云设备授权 3 台",
    type: "device",
    description: "适合多店铺轻团队，支持 3 台云设备并行执行",
    cycle: "30 天",
    price: 399,
    originalPrice: 499,
    deviceCount: 3,
    status: "已上架",
  },
];

const orderRows: OrderRow[] = [
  {
    key: "o1",
    orderNo: "DXB202605060001",
    externalPayNo: "PAY20260506093218",
    ecosystem: "钉钉",
    tenant: "杭州青柚电商",
    orderType: "新购会员",
    product: "高级会员 年付",
    memberVersion: "高级会员",
    saleCycle: "年付",
    platformLimit: 5,
    selectedPlatforms: ["生意参谋", "阿里妈妈", "京东商智"],
    amount: 14999,
    paymentStatus: "支付成功",
    entitlementStatus: "发放成功",
    createdAt: "2026-05-06 10:31",
    paidAt: "2026-05-06 10:36",
    source: "取数宝_钉钉_杭州青柚电商",
    callbackInfo: "支付回调成功 2026-05-06 10:36；会员有效期、可使用平台数和已选平台写入成功；生意参谋、阿里妈妈、京东商智连接器授权发放成功 2026-05-06 10:37",
    retryRecords: [],
  },
  {
    key: "o2",
    orderNo: "DXB202605060002",
    externalPayNo: "PAY20260506101842",
    ecosystem: "钉钉",
    tenant: "小野家居店",
    orderType: "新购会员",
    product: "高级会员 月付",
    memberVersion: "高级会员",
    saleCycle: "月付",
    platformLimit: 5,
    selectedPlatforms: ["阿里妈妈", "生意参谋"],
    amount: 909,
    paymentStatus: "支付失败",
    entitlementStatus: "未发放",
    createdAt: "2026-05-06 10:38",
    paidAt: "-",
    source: "取数宝_钉钉_小野家居店",
    failureReason: "支付系统返回订单超时，未收到支付成功回调。",
    callbackInfo: "支付回调超时 2026-05-06 10:58；未触发权益发放",
    retryRecords: [],
  },
  {
    key: "o3",
    orderNo: "DXB202605060003",
    tenant: "星河服饰",
    externalPayNo: "PAY20260506112207",
    ecosystem: "钉钉",
    orderType: "会员续费",
    product: "高级会员 年付",
    memberVersion: "高级会员",
    saleCycle: "年付",
    platformLimit: 5,
    selectedPlatforms: ["生意参谋", "阿里妈妈", "京东商智", "小红书"],
    amount: 14999,
    paymentStatus: "支付成功",
    entitlementStatus: "发放失败",
    createdAt: "2026-05-06 10:52",
    paidAt: "2026-05-06 10:58",
    source: "取数宝_钉钉_星河服饰",
    failureReason: "写入用户已选平台后，京东商智连接器授权发放超时。",
    callbackInfo: "支付回调成功 2026-05-06 10:58；会员有效期和可使用平台数已写入；按已选平台发放连接器授权失败 2026-05-06 10:59",
    retryRecords: ["2026-05-06 11:04 运营小王重试，京东商智连接器授权仍超时"],
  },
  {
    key: "o4",
    orderNo: "DXB202605060004",
    externalPayNo: "-",
    ecosystem: "钉钉",
    tenant: "上海商贸公司",
    orderType: "试用开通",
    product: "试用权益 7天",
    memberVersion: "试用",
    saleCycle: "试用",
    platformLimit: 1,
    selectedPlatforms: ["京东商智"],
    amount: 0,
    paymentStatus: "无需支付",
    entitlementStatus: "发放成功",
    createdAt: "2026-05-06 11:20",
    paidAt: "2026-05-06 11:21",
    source: "取数宝_钉钉_上海商贸公司",
    callbackInfo: "运营人工开通试用权益，无需支付；京东商智试用平台发放成功 2026-05-06 11:21",
    retryRecords: ["2026-05-06 11:21 运营人工发放 7 天试用权益"],
  },
];

const platformTypeRows: PlatformTypeRow[] = [
  { key: "taobao", name: "淘系", iconText: "淘", iconClass: "taobao", platformPackage: "生意参谋月卡", devicePackage: "1 台 / 3 台", trial: "7 天", status: "已上架" },
  { key: "jd", name: "京东", iconText: "京", iconClass: "jd", platformPackage: "京准通月卡", devicePackage: "1 台", trial: "3 天", status: "已上架" },
  { key: "pdd", name: "拼多多", iconText: "拼", iconClass: "pdd", platformPackage: "多多参谋月卡", devicePackage: "1 台", trial: "7 天", status: "未上架" },
  { key: "douyin", name: "抖音", iconText: "抖", iconClass: "douyin", platformPackage: "抖店经营月卡", devicePackage: "1 台 / 3 台", trial: "0 天", status: "已上架" },
  { key: "vip", name: "唯品会", iconText: "唯", iconClass: "vip", platformPackage: "唯品经营月卡", devicePackage: "1 台", trial: "0 天", status: "未上架" },
  { key: "xiaohongshu", name: "小红书", iconText: "书", iconClass: "xhs", platformPackage: "小红书店铺月卡", devicePackage: "1 台", trial: "5 天", status: "已上架" },
  { key: "kuaishou", name: "快手", iconText: "快", iconClass: "ks", platformPackage: "快手经营月卡", devicePackage: "1 台", trial: "3 天", status: "未上架" },
];

const defaultConnectors = [
  "Beijing",
  "Shanghai",
  "Guangzhou",
  "Qingdao",
  "Chongqing",
  "Hangzhou",
  "Shenyang",
  "Nanjing",
  "Suzhou",
  "Chengdu",
  "Wuhan",
  "Xiamen",
  "Ningbo",
  "Zhengzhou",
  "Tianjin",
  "Jinan",
  "Changsha",
  "Fuzhou",
  "Kunming",
  "Xi'an",
];

const resourcePlatformGroups: ResourceGroup[] = [
  {
    key: "sycm",
    logo: "SY",
    name: "生意参谋",
    appId: "qsb-sycm-001",
    connectorCount: 12,
    connectors: defaultConnectors,
    trialDays: 7,
    type: "platform",
    cycles: [
      { key: "sycm-30", name: "月卡", period: "30天", originalPrice: 399, discount: "7.5折", price: 299, status: "已上架" },
      { key: "sycm-90", name: "季卡", period: "90天", originalPrice: 999, discount: "8折", price: 799, status: "已上架" },
      { key: "sycm-365", name: "年卡", period: "365天", originalPrice: 3999, discount: "7.5折", price: 2999, status: "未上架" },
    ],
  },
  { key: "xhs", logo: "XH", name: "小红书", appId: "qsb-xhs-001", connectorCount: 9, connectors: defaultConnectors.slice(0, 5), trialDays: 7, type: "platform", cycles: [] },
  { key: "tm", logo: "TM", name: "天猫", appId: "qsb-tm-001", connectorCount: 9, connectors: defaultConnectors.slice(0, 4), trialDays: 3, type: "platform", cycles: [] },
  { key: "almm", logo: "AM", name: "阿里妈妈", appId: "qsb-almm-001", connectorCount: 9, connectors: defaultConnectors.slice(0, 6), trialDays: 0, type: "platform", cycles: [] },
  { key: "jdsmart", logo: "JD", name: "京东商智（品牌版）", appId: "qsb-jdsz-001", connectorCount: 9, connectors: defaultConnectors.slice(0, 6), trialDays: 0, type: "platform", cycles: [] },
  { key: "douyin", logo: "DD", name: "抖店商家后台", appId: "qsb-ddsj-001", connectorCount: 9, connectors: defaultConnectors.slice(0, 5), trialDays: 5, type: "platform", cycles: [] },
  { key: "dslp", logo: "DP", name: "电商罗盘", appId: "qsb-dslp-001", connectorCount: 9, connectors: defaultConnectors.slice(0, 4), trialDays: 0, type: "platform", cycles: [] },
  { key: "mflp", logo: "MF", name: "魔方罗盘", appId: "qsb-mflp-001", connectorCount: 9, connectors: defaultConnectors.slice(0, 4), trialDays: 0, type: "platform", cycles: [] },
  { key: "qn", logo: "QN", name: "千牛商家", appId: "qsb-qn-001", connectorCount: 9, connectors: defaultConnectors.slice(0, 4), trialDays: 5, type: "platform", cycles: [] },
];

const resourceDeviceGroups: ResourceGroup[] = [
  {
    key: "robot-token",
    logo: "J",
    name: "机器人令牌",
    trialDays: 7,
    type: "device",
    deviceType: "机器人令牌",
    cycles: [
      { key: "robot-30", name: "月卡", period: "30天", originalPrice: 399, discount: "7.5折", price: 299, status: "已上架" },
      { key: "robot-90", name: "季卡", period: "90天", originalPrice: 999, discount: "8折", price: 799, status: "已上架" },
      { key: "robot-365", name: "年卡", period: "365天", originalPrice: 3999, discount: "7.5折", price: 2999, status: "未上架" },
    ],
  },
  {
    key: "cloud-desktop",
    logo: "Y",
    name: "云桌面",
    trialDays: 7,
    type: "device",
    deviceType: "云桌面",
    cloudProvider: "无影云",
    cycles: [
      { key: "cloud-30", name: "月卡", period: "30天", originalPrice: 399, discount: "7.5折", price: 299, status: "已上架" },
      { key: "cloud-90", name: "季卡", period: "90天", originalPrice: 999, discount: "8折", price: 799, status: "已上架" },
      { key: "cloud-365", name: "年卡", period: "365天", originalPrice: 3999, discount: "7.5折", price: 2999, status: "未上架" },
    ],
  },
];

const subscriptionTenants: SubscriptionTenant[] = [
  {
    key: "beijing-tech",
    tenant: "杭州青柚电商",
    ecology: "钉钉",
    platformSummary: "已选平台：3｜连接器授权：3",
    deviceSummary: "机器人令牌：1｜云电脑：1",
    commercialEntitlement: {
      memberName: "高级会员",
      memberStatus: "已付费",
      source: "自购买",
      startAt: "2026-05-06",
      endAt: "2027-05-05",
      memberPeriod: "2026-05-06 ~ 2027-05-05",
      dailyLimit: "100 次 / 天",
      concurrency: "5 个任务",
      platformLimit: 5,
      platforms: "生意参谋、阿里妈妈、京东商智",
      selectedPlatforms: ["生意参谋", "阿里妈妈", "京东商智"],
      openedConnectorAuths: "钉钉_生参、钉钉_阿里妈妈、钉钉_京东商智",
      trialStatus: "已转付费",
      platformItems: [
        { name: "生意参谋", status: "已发放", startAt: "2026-05-06", endAt: "2027-05-05", includedInMember: "已选平台", purchaseType: "会员购买选择", connector: "钉钉_生参 / 生意参谋连接器" },
        { name: "阿里妈妈", status: "已发放", startAt: "2026-05-06", endAt: "2027-05-05", includedInMember: "已选平台", purchaseType: "会员购买选择", connector: "钉钉_阿里妈妈 / 推广计划连接器" },
        { name: "京东商智", status: "已发放", startAt: "2026-05-06", endAt: "2027-05-05", includedInMember: "已选平台", purchaseType: "会员购买选择", connector: "钉钉_京东商智 / 订单商品连接器" },
      ],
      orderSource: "取数宝_钉钉_杭州青柚电商",
      orderNo: "DXB202605060001",
      payNo: "PAY20260506093218",
      amount: "¥14999",
      paymentStatus: "支付成功",
      grantStatus: "发放成功",
      grantTime: "2026-05-06 10:37",
      trialDays: "7 天",
      trialStartAt: "2026-05-06",
      trialEndAt: "2026-05-13",
      trialAdjusted: "否",
      adjustmentReason: "-",
      resourceStatus: "云电脑：已分配 1 台；机器人令牌：已分配 1 个",
      operationLogs: ["2026-05-06 10:36 支付成功", "2026-05-06 10:37 写入高级会员有效期、5 个可使用平台数和 3 个已选平台", "2026-05-06 10:37 按已选平台发放生意参谋、阿里妈妈、京东商智连接器授权"],
    },
    subscriptions: [
      { key: "bj-sycm", product: "电商连接器", tags: ["钉钉_生参"], status: "使用中", period: "2026-05-06 ~ 2027-05-05", source: "自购买", orderNo: "DXB202605060001" },
      { key: "bj-alimama", product: "电商连接器", tags: ["钉钉_阿里妈妈"], status: "使用中", period: "2026-05-06 ~ 2027-05-05", source: "自购买", orderNo: "DXB202605060001" },
      { key: "bj-jdsz", product: "电商连接器", tags: ["钉钉_京东商智"], status: "使用中", period: "2026-05-06 ~ 2027-05-05", source: "自购买", orderNo: "DXB202605060001" },
      { key: "bj-robot", product: "机器人", status: "使用中", period: "2026-05-06 ~ 2027-05-05", source: "系统开通", orderNo: "DXB202605060001" },
    ],
  },
  {
    key: "shanghai-trade",
    tenant: "上海商贸公司",
    ecology: "钉钉",
    platformSummary: "平台授权：1｜连接器授权：1",
    deviceSummary: "机器人令牌：1｜云电脑：1",
    commercialEntitlement: {
      memberName: "试用",
      memberStatus: "试用中",
      source: "人工开通",
      startAt: "2026-05-10",
      endAt: "2026-05-17",
      memberPeriod: "2026-05-10 ~ 2026-05-17",
      dailyLimit: "20 次 / 天",
      concurrency: "1 个任务",
      platformLimit: 1,
      platforms: "京东商智",
      selectedPlatforms: ["京东商智"],
      openedConnectorAuths: "钉钉_京东商智",
      trialStatus: "试用中",
      platformItems: [
        { name: "京东商智", status: "试用中", startAt: "2026-05-10", endAt: "2026-05-17", includedInMember: "试用平台", purchaseType: "试用资格选择", connector: "钉钉_京东商智 / 订单商品连接器" },
      ],
      orderSource: "后台人工补偿",
      orderNo: "DXB202605060004",
      payNo: "-",
      amount: "¥0",
      paymentStatus: "无需支付",
      grantStatus: "发放成功",
      grantTime: "2026-05-06 11:21",
      trialDays: "7 天",
      trialStartAt: "2026-05-10",
      trialEndAt: "2026-05-17",
      trialAdjusted: "是",
      adjustmentReason: "运营补偿试用",
      resourceStatus: "云电脑：已分配 1 台；机器人令牌：已分配 1 个",
      operationLogs: ["2026-05-06 11:20 运营创建人工开通订单", "2026-05-06 11:21 人工补偿试用权益发放成功"],
    },
    subscriptions: [
      { key: "sh-ecommerce", product: "电商连接器", tags: ["钉钉_京东商智"], status: "使用中", period: "2026-05-10 ~ 2026-05-17", source: "人工开通：森森", orderNo: "DXB202605060004" },
      { key: "sh-cloud-robot", product: "云桌面机器人", status: "使用中", period: "2026-05-10 ~ 2026-05-17", source: "人工开通：森森", orderNo: "DXB202605060004" },
    ],
  },
  {
    key: "qsb-cnooc",
    tenant: "中海油数字化智能门户",
    ecology: "取数宝",
    platformSummary: "连接器：18｜平台授权：8",
    deviceSummary: "机器人令牌：2｜云桌面：3",
    subscriptions: [
      { key: "cnooc-connector", product: "电商连接器", tags: ["老客户"], status: "使用中", period: "2026-01-01 ~ 2026-12-31", source: "原授权", orderNo: "HT202601010001" },
      { key: "cnooc-bank", product: "网银连接器", tags: ["九阳"], status: "使用中", period: "2026-01-01 ~ 2026-12-31", source: "原授权", orderNo: "HT202601010001" },
      { key: "cnooc-cloud", product: "云桌面机器人", status: "使用中", period: "2026-01-01 ~ 2026-12-31", source: "原授权", orderNo: "HT202601010001" },
      { key: "cnooc-robot", product: "机器人", status: "使用中", period: "2026-01-01 ~ 2026-12-31", source: "原授权", orderNo: "HT202601010001" },
      { key: "cnooc-expired", product: "电商连接器", tags: ["视客"], status: "已过期", period: "2025-01-01 ~ 2025-12-31", source: "原授权", orderNo: "HT202501010002" },
    ],
  },
  {
    key: "shanghai-feishu",
    tenant: "上海商贸公司",
    ecology: "飞书",
    platformSummary: "平台授权：0｜连接器授权：0",
    deviceSummary: "机器人令牌：0｜云电脑：0",
    subscriptions: [],
  },
];

const operationLogRows: OperationLogRow[] = [
  { key: "log1", operator: "管理员", type: "商业化开关变更", target: "取数宝", change: "关闭 -> 开启", time: "2026-02-21 14:30" },
  { key: "log2", operator: "运营小王", type: "人工续费", target: "北京科技公司", change: "有效期延长3个月", time: "2026-02-20 10:15" },
  { key: "log3", operator: "产品经理", type: "会员价格变更", target: "普通会员｜月", change: "售价 ¥199 -> ¥219", time: "2026-02-19 16:45" },
];

const dashboardToday = dayjs("2026-05-08");
const dashboardDefaultEcosystem = "钉钉";

const dashboardPeriodMeta: Record<DashboardPeriod, { label: string; currentLabel: string; compareLabel: string }> = {
  day: { label: "日", currentLabel: "今日", compareLabel: "较昨日" },
  week: { label: "周", currentLabel: "本周", compareLabel: "较上周" },
  month: { label: "月", currentLabel: "本月", compareLabel: "较上月" },
};

const dashboardPeriodSummaries: Record<DashboardPeriod, DashboardPeriodSummary> = {
  day: {
    ecosystem: dashboardDefaultEcosystem,
    tenantTotal: 3562,
    tenantTotalCompare: 28,
    activeTenants: 1004,
    trialTenants: 612,
    paidTenants: 84,
    newTenants: 28,
    newTenantsCompare: 5,
    trialConversionRate: 12.06,
    trialConversionCompare: 0.42,
    paidRate: 2.36,
    paidRateCompare: 0.11,
    paymentSuccessRate: 93.4,
    paymentSuccessCompare: 1.2,
    expiredTrialUnpaid: 392,
    expiredTrialCompare: -16,
    periodResourceCost: 4624,
    resourceCostCompare: 320,
    periodRevenue: 12540,
    revenueCompare: 1850,
    paidOrders: 34,
    paidOrdersCompare: 6,
    arpu: 2219,
    arpuCompare: 90,
    grossProfit: 7916,
    grossProfitCompare: 1530,
    grossMargin: 63.1,
    grossMarginCompare: 3.1,
    periodTaskCount: 18426,
    taskCountCompare: 1138,
    failedTaskCount: 590,
    failedTaskCompare: -42,
    avgDuration: "6分42秒",
    avgDurationCompare: "-18秒",
    successRate: 96.8,
    successRateCompare: 0.6,
  },
  week: {
    ecosystem: dashboardDefaultEcosystem,
    tenantTotal: 3562,
    tenantTotalCompare: 136,
    activeTenants: 1004,
    trialTenants: 612,
    paidTenants: 84,
    newTenants: 136,
    newTenantsCompare: 24,
    trialConversionRate: 12.06,
    trialConversionCompare: 0.78,
    paidRate: 2.36,
    paidRateCompare: 0.31,
    paymentSuccessRate: 94.1,
    paymentSuccessCompare: 0.9,
    expiredTrialUnpaid: 392,
    expiredTrialCompare: -38,
    periodResourceCost: 28460,
    resourceCostCompare: 4240,
    periodRevenue: 68420,
    revenueCompare: 12880,
    paidOrders: 186,
    paidOrdersCompare: 32,
    arpu: 2184,
    arpuCompare: 76,
    grossProfit: 39960,
    grossProfitCompare: 8640,
    grossMargin: 58.4,
    grossMarginCompare: 2.0,
    periodTaskCount: 92860,
    taskCountCompare: 8640,
    failedTaskCount: 2864,
    failedTaskCompare: -218,
    avgDuration: "6分36秒",
    avgDurationCompare: "-24秒",
    successRate: 96.9,
    successRateCompare: 0.7,
  },
  month: {
    ecosystem: dashboardDefaultEcosystem,
    tenantTotal: 3562,
    tenantTotalCompare: 426,
    activeTenants: 1004,
    trialTenants: 612,
    paidTenants: 84,
    newTenants: 426,
    newTenantsCompare: 88,
    trialConversionRate: 12.06,
    trialConversionCompare: 1.14,
    paidRate: 2.36,
    paidRateCompare: 0.42,
    paymentSuccessRate: 93.4,
    paymentSuccessCompare: 1.3,
    expiredTrialUnpaid: 392,
    expiredTrialCompare: -74,
    periodResourceCost: 106820,
    resourceCostCompare: 18460,
    periodRevenue: 186430,
    revenueCompare: 36480,
    paidOrders: 512,
    paidOrdersCompare: 96,
    arpu: 2219,
    arpuCompare: 142,
    grossProfit: 79610,
    grossProfitCompare: 18020,
    grossMargin: 42.7,
    grossMarginCompare: 1.6,
    periodTaskCount: 418260,
    taskCountCompare: 48240,
    failedTaskCount: 13186,
    failedTaskCompare: -620,
    avgDuration: "6分42秒",
    avgDurationCompare: "-31秒",
    successRate: 96.8,
    successRateCompare: 0.8,
  },
};

const dashboardTenantRows: DashboardTenantStatusRow[] = [
  { key: "paid", stage: "付费中", tenantCount: 84, ratio: "2.36%", definition: "存在当前有效的付费平台包或设备包订阅。" },
  { key: "trial", stage: "试用中", tenantCount: 612, ratio: "17.18%", definition: "仅存在未过期试用权益，尚未产生付费订单。" },
  { key: "expiredTrial", stage: "试用到期未付费", tenantCount: 392, ratio: "11.00%", definition: "试用权益已到期，当前没有有效付费权益。" },
  { key: "unopened", stage: "未开通", tenantCount: 2474, ratio: "69.46%", definition: "已进入插件但未开通试用或购买权益。" },
];

const dashboardEcosystemRows: DashboardEcosystemRow[] = [
  { key: "qsb", ecosystem: "取数宝", totalTenants: 426, trialTenants: 36, paidTenants: 128, revenue: 286400, cost: 82640, grossMargin: "71.14%" },
  { key: "ding", ecosystem: "钉钉", totalTenants: 3562, trialTenants: 612, paidTenants: 84, revenue: 186430, cost: 106820, grossMargin: "42.70%" },
  { key: "feishu", ecosystem: "飞书", totalTenants: 0, trialTenants: 0, paidTenants: 0, revenue: 0, cost: 0, grossMargin: "-" },
  { key: "wecom", ecosystem: "企微", totalTenants: 0, trialTenants: 0, paidTenants: 0, revenue: 0, cost: 0, grossMargin: "-" },
  { key: "unicom", ecosystem: "联通", totalTenants: 0, trialTenants: 0, paidTenants: 0, revenue: 0, cost: 0, grossMargin: "-" },
  { key: "telecom", ecosystem: "电信", totalTenants: 0, trialTenants: 0, paidTenants: 0, revenue: 0, cost: 0, grossMargin: "-" },
];

const dashboardPlatformRevenueRows: DashboardPlatformRevenueRow[] = [
  { key: "sycm", rank: 1, packageName: "生意参谋", packageType: "平台包", paidOrders: 46, paidTenants: 31, revenue: 68320, renewalRate: "68.00%", grossMargin: "58.30%" },
  { key: "cloud", rank: 2, packageName: "云桌面月卡", packageType: "设备包", paidOrders: 42, paidTenants: 26, revenue: 48620, renewalRate: "61.50%", grossMargin: "39.80%" },
  { key: "almm", rank: 3, packageName: "阿里妈妈", packageType: "平台包", paidOrders: 28, paidTenants: 18, revenue: 41240, renewalRate: "52.90%", grossMargin: "55.10%" },
  { key: "robot", rank: 4, packageName: "机器人令牌月卡", packageType: "设备包", paidOrders: 24, paidTenants: 16, revenue: 35260, renewalRate: "57.40%", grossMargin: "64.20%" },
  { key: "xhs", rank: 5, packageName: "小红书", packageType: "平台包", paidOrders: 19, paidTenants: 14, revenue: 32980, renewalRate: "48.00%", grossMargin: "53.70%" },
];

const dashboardCloudRows: DashboardCloudCostRow[] = [
  { key: "wuying", resourceName: "云桌面｜无影云", openedCount: 92, usageRate: "86.96%", idleCount: 12, cost: 3128, revenue: 8280, grossMargin: "62.22%" },
  { key: "volcano", resourceName: "云桌面｜火山云", openedCount: 31, usageRate: "87.10%", idleCount: 4, cost: 1054, revenue: 2790, grossMargin: "62.22%" },
  { key: "tianyi", resourceName: "云桌面｜天翼云", openedCount: 13, usageRate: "84.62%", idleCount: 2, cost: 442, revenue: 1170, grossMargin: "62.22%" },
  { key: "robot", resourceName: "机器人令牌", openedCount: 136, usageRate: "88.24%", idleCount: 16, cost: 0, revenue: 35260, grossMargin: "100.00%" },
  { key: "cloud-number", resourceName: "云号", openedCount: 0, usageRate: "-", idleCount: 0, cost: 0, revenue: 0, grossMargin: "-" },
];

const dashboardTaskRows: DashboardTaskHealthRow[] = [
  { key: "collect", taskType: "取数任务", taskCount: 12860, successRate: "97.40%", failedCount: 334, failureReason: "连接器登录失效", affectedTenants: 46 },
  { key: "login", taskType: "登录保活", taskCount: 3248, successRate: "95.90%", failedCount: 133, failureReason: "云桌面占用超时", affectedTenants: 18 },
  { key: "subscribe", taskType: "权益校验", taskCount: 2318, successRate: "99.10%", failedCount: 21, failureReason: "订阅状态回写延迟", affectedTenants: 7 },
];

const dashboardFollowUpRows: DashboardFollowUpTenantRow[] = [
  { key: "ft1", tenant: "杭州青柚电商", ecosystem: "钉钉", currentStatus: "试用剩余 2 天", reason: "近 7 天取数 36 次但未付费", suggestedAction: "引导购买生意参谋月卡 + 云桌面月卡", owner: "运营小王" },
  { key: "ft2", tenant: "小野家居店", ecosystem: "钉钉", currentStatus: "支付失败", reason: "支付创建后 30 分钟未成功", suggestedAction: "跟进支付失败原因并保留订单", owner: "运营小王" },
  { key: "ft3", tenant: "森森直播业务中心", ecosystem: "钉钉", currentStatus: "云桌面闲置", reason: "云桌面闲置 3 台且近 7 天无任务消耗", suggestedAction: "确认是否释放闲置云桌面", owner: "产品经理" },
  { key: "ft4", tenant: "上海商贸公司", ecosystem: "钉钉", currentStatus: "付费即将到期", reason: "平台包 5 天后到期且近 7 天任务成功率 98%", suggestedAction: "推送续费提醒并保留续费入口", owner: "运营小王" },
];

const interactionNotes: Record<string, InteractionNote> = {
  backendEntry: {
    number: "1",
    title: "后台先行承接商业化",
    page: "resourceManagement",
    placement: "bottom",
    sections: [
      { label: "页面功能说明", text: "原型交互只保留后台管理，后台负责会员、数据源平台、租户权益、订单和异常补偿。" },
      { label: "元素交互行为", text: "点击顶部需求下拉中的原型交互 / 后台进入当前后台壳；左侧默认高亮资源管理。" },
      { label: "状态表现", text: "顶部一级导航保持取数宝后台截图结构，后台管理高亮；内容区使用后台表格、搜索和橙色新增按钮。" },
      { label: "反馈机制", text: "资源配置保存、订单重试和人工补偿动作均写入操作记录，二期在操作日志页集中展示。" },
      { label: "用户操作流程", text: "运营先配置会员和平台商品，再通过订单管理追踪支付和权益发放，必要时回到租户管理人工补偿。" },
      { label: "边界与异常状态", text: "本期不做经营看板和完整操作日志页；禁用菜单仅提示二期，不进入业务页面。" },
    ],
  },
  dataDashboardOverview: {
    number: "1",
    title: "经营看板",
    page: "dataDashboard",
    placement: "right",
    sections: [
      { label: "页面职责", text: "经营看板用于判断钉钉商业化的规模、转化、收入、成本、利润和任务交付是否健康，并把问题沉淀到待跟进租户。" },
      { label: "周期切换", text: "支持日、周、月三种周期；日对比昨日，周对比上一自然周，月对比上一自然月。" },
      { label: "统计周期", text: "生态默认钉钉；租户类指标取当前周期末快照，新增租户、收入、成本、任务类指标按当前周期汇总。" },
      { label: "异常判断", text: "试用转付费率、毛利率或任务成功率低于运营已配置阈值时才展示异常提示；没有阈值的字段只展示事实，不给风险结论。" },
      { label: "边界", text: "经营看板只读，不直接修改资源、订单或租户权益；真实系统中收入、成本、毛利字段应受权限控制。" },
    ],
  },
  dataDashboardTenantFunnel: {
    number: "1.1",
    title: "租户规模与转化",
    page: "dataDashboard",
    placement: "top",
    sections: [
      { label: "指标定义", text: "总租户为进入过店小宝插件的租户数；有效租户为当前处于试用或付费的租户；新增租户为当前周期首次进入商业化入口的租户。" },
      { label: "计算口径", text: "试用转付费率=付费租户/曾开通过试用的租户；整体付费率=付费租户/总租户；试用到期未付费用于识别运营跟进池。" },
      { label: "场景示例", text: "今日新增租户 28 个，较昨日多 5 个，但付费租户只有 84 个时，产品负责人要优先看试用到期未付费租户和购买入口转化。" },
      { label: "空态异常", text: "没有租户时展示 0 和空表；订阅服务异常时保留上次快照，并标记更新时间，不能把转化率默认展示为 0 或 100%。" },
    ],
  },
  dataDashboardPackageRank: {
    number: "1.3",
    title: "套餐收入排行",
    page: "dataDashboard",
    placement: "top",
    sections: [
      { label: "可见字段", text: "字段包含排名、套餐名称、套餐类型、支付订单数、付费租户数、收入、续费率、毛利率。" },
      { label: "计算口径", text: "收入只统计当前周期支付成功金额；续费率按到期后再次购买同类套餐的租户占比统计；毛利率需扣除资源成本。" },
      { label: "场景示例", text: "生意参谋收入最高但毛利率低于设备包时，应检查平台包定价、试用期和设备资源消耗是否匹配。" },
      { label: "空态异常", text: "无支付订单时展示空表和 0 收入；支付数据缺失时保留套餐行并提示统计延迟。" },
    ],
  },
  dataDashboardEcosystemOverview: {
    number: "1.2",
    title: "生态经营概览",
    page: "dataDashboard",
    placement: "top",
    sections: [
      { label: "可见字段", text: "字段包含所属生态、总租户、试用租户、付费租户、收入、成本、毛利率。" },
      { label: "计算口径", text: "租户按所属生态归属统计；收入和成本按所选周期汇总；未开放生态展示 0 或空值，不参与当前钉钉筛选结果。" },
      { label: "场景示例", text: "钉钉租户量高但毛利率低于取数宝时，产品负责人应优先检查钉钉设备包定价和云桌面成本。" },
      { label: "空态异常", text: "未开放生态保留行但展示 0；如果收入或成本接口失败，需展示上次统计时间，不能只清空表格。" },
    ],
  },
  dataDashboardCloudCost: {
    number: "1.4",
    title: "资源成本分析",
    page: "dataDashboard",
    placement: "top",
    sections: [
      { label: "可见字段", text: "字段包含资源名称、开通数、使用率、闲置数、成本、收入、毛利率；云桌面需展示云电脑类型，机器人令牌和云号按资源类型展示。" },
      { label: "计算口径", text: "成本按所选周期内资源实际占用成本汇总；收入按设备包订单拆分到资源类型；毛利率=（收入-成本）/收入。" },
      { label: "场景示例", text: "云桌面开通 136 台但闲置 18 台时，运营需要判断是否释放闲置资源，避免设备包收入覆盖不了云资源成本。" },
      { label: "空态异常", text: "云号当前没有资源时展示 0，不隐藏行；成本服务不可用时展示上次数据并提示不可作为结算依据。" },
    ],
  },
  dataDashboardTaskHealth: {
    number: "1.5",
    title: "任务健康度",
    page: "dataDashboard",
    placement: "top",
    sections: [
      { label: "可见字段", text: "字段包含任务类型、任务数、成功率、失败数、失败原因 Top、影响租户数。" },
      { label: "计算口径", text: "任务数按所选周期内已结束任务统计；成功率=成功任务数/已结束任务数，运行中任务不进入分母。" },
      { label: "场景示例", text: "登录保活失败集中出现时，产品负责人应判断是云桌面资源、连接器登录还是权益回写导致，并安排对应负责人处理。" },
      { label: "异常态", text: "任务服务不可用时显示上次更新时间和失败提示，不把成功率默认显示为 100%。" },
    ],
  },
  dataDashboardFollowUpTenants: {
    number: "1.6",
    title: "待跟进租户",
    page: "dataDashboard",
    placement: "top",
    sections: [
      { label: "可见字段", text: "字段包含租户名称、所属生态、当前状态、问题原因、建议动作、负责人。" },
      { label: "进入条件", text: "试用即将到期、支付失败、任务高频但未付费、云桌面闲置、付费即将到期的租户进入待跟进列表。" },
      { label: "场景示例", text: "某租户近 7 天任务高频且试用剩余 2 天，应进入跟进列表并建议购买会员。" },
      { label: "空态异常", text: "没有待跟进租户时展示空态；任务或订单数据缺失时保留租户行，并把原因写为数据待确认。" },
    ],
  },
  backendSurface: {
    number: "1",
    title: "后台",
    page: "resourceManagement",
    placement: "right",
    sections: [
      { label: "本期范围", text: "后台只承接租户管理、资源管理、订单管理三类页面。" },
      { label: "页面关系", text: "资源管理配置会员档位和平台池；订单管理记录用户已选平台并承接支付与权益发放；租户管理展示选择结果和发放结果。" },
      { label: "边界", text: "操作日志和经营看板保留为二期菜单，不写入本期业务规则和验收范围。" },
    ],
  },
  resourceOverview: {
    number: "1.1",
    title: "资源管理页定位",
    page: "resourceManagement",
    placement: "right",
    sections: [
      { label: "本页职责", text: "资源管理维护会员售卖配置和数据源平台配置；会员是唯一售卖主体。" },
      { label: "页面字段", text: "页面标题固定为资源管理；上方展示所属生态；中部展示会员配置 / 平台配置 Tab；下方展示当前 Tab 的配置表格。" },
      { label: "默认状态", text: "进入后台原型时默认落在资源管理；默认生态为钉钉，默认 Tab 为会员配置。" },
      { label: "影响范围", text: "会员配置只影响会员名称、周期价格、取数上限、并发数和可使用平台数；新租户试用期只影响试用资格判断，不属于会员档位配置。" },
      { label: "验收重点", text: "会员配置承接售卖并配置可使用平台；平台配置只负责数据源展示、连接器和上架。" },
    ],
  },
  resourceEcologyData: {
    number: "1.1.1",
    title: "生态 Tab 展示规则",
    page: "resourceManagement",
    placement: "bottomLeft",
    sections: [
      { label: "字段", text: "所属生态展示钉钉、飞书、企微、联通、电信；本期只开放钉钉配置，其余为禁用态。" },
      { label: "点击规则", text: "点击钉钉保持当前资源列表；点击禁用生态不切换选中态、不刷新列表，只展示暂未开放提示。" },
      { label: "资源隔离", text: "会员、平台和试用期都按生态隔离；钉钉配置不能混到取数宝原授权体系。" },
      { label: "异常态", text: "生态资源加载失败时保留当前列表，不允许保存新增或编辑结果，避免写入错误生态。" },
    ],
  },
  commercialSwitch: {
    number: "1.1.2",
    title: "生态级商业化开关",
    page: "resourceManagement",
    placement: "bottom",
    sections: [
      { label: "控制范围", text: "商业化开关控制当前生态的前台新购和续费入口，也控制资源管理页内所有新增、编辑、删除操作是否可用。" },
      { label: "开启态", text: "开关开启时，会员、月季年价格和平台配置操作可点击。" },
      { label: "关闭态", text: "开关关闭后，资源表格仍可查看，但新增平台、编辑会员、编辑价格和编辑平台操作全部禁用。" },
      { label: "关闭确认", text: "从开启切换为关闭时必须弹出二次确认；用户取消则保持开启，用户确认后才进入关闭态。" },
      { label: "不影响项", text: "关闭商业化不删除资源，不影响存量订阅，不阻断后台人工续费，只冻结当前生态的售卖配置变更。" },
    ],
  },
  resourceCreateEntry: {
    number: "1.1.3",
    title: "会员 / 平台配置入口",
    page: "resourceManagement",
    placement: "left",
    sections: [
      { label: "字段", text: "资源类型 Tab 包含会员配置、平台配置；当前先预置普通会员、高级会员两个会员名称，后续可继续新增和编辑。" },
      { label: "会员入口", text: "会员配置支持新增会员、编辑会员和新增售卖周期；新增售卖周期只能从月、季、年中选择。" },
      { label: "平台入口", text: "在平台配置 Tab 点击新增平台，打开平台配置弹窗，填写平台名称、连接器、上架状态和前台文案；Logo 可上传，APPID 保存后由系统生成。" },
      { label: "新增态", text: "新增弹窗只展示取消、保存，不展示删除；未保存前不生成资源记录。" },
      { label: "禁用态", text: "当前生态未开放时新增按钮禁用，不能打开新增弹窗。" },
    ],
  },
  platformPackageTable: {
    number: "1.1.4",
    title: "平台配置表格",
    page: "resourceManagement",
    placement: "left",
    sections: [
      { label: "可见字段", text: "平台配置展示 Logo、平台名称、APPID、关联连接器、上架状态和前台展示文案。" },
      { label: "权益口径", text: "平台只是数据源配置；会员名称下的可使用平台数控制用户购买时可选择几个平台。" },
      { label: "空态", text: "当前生态没有平台配置时展示空态，不自动生成默认平台。" },
      { label: "操作规则", text: "点击编辑回填平台配置；保存后前台数据源列表读取最新配置。" },
      { label: "禁用规则", text: "未上架平台不进入前台数据源列表；平台配置不维护最低可用会员档位，也不决定哪个会员能用。" },
    ],
  },
  appIdGenerationRule: {
    number: "1.1.4.1",
    title: "APPID 生成规则",
    page: "resourceManagement",
    placement: "bottom",
    sections: [
      { label: "生成规则", text: "APPID 按固定前缀 + 平台拼音缩写 + 三位序号生成，格式为 qsb-{平台缩写}-{三位序号}。" },
      { label: "示例", text: "生意参谋：qsb-sycm-001；小红书：qsb-xhs-001；天猫：qsb-tm-001。" },
    ],
  },
  devicePackageTable: {
    number: "1.1.5",
    title: "会员配置表格",
    page: "resourceManagement",
    placement: "left",
    sections: [
      { label: "可见字段", text: "会员配置展示会员名称、状态、每日取数上限、并发任务数、可使用平台数；子级固定展示月、季、年的原价、折扣、售价和操作。" },
      { label: "会员权益", text: "会员只定义最多可用几个平台；购买会员后由用户在前台选择具体平台，后台不在会员配置里指定平台名单。" },
      { label: "空态", text: "当前预置普通会员、高级会员两个名称；当某个会员没有月、季、年价格时，展开后展示暂无售卖周期。" },
      { label: "操作规则", text: "编辑会员维护权益字段；会员父级支持新增售卖周期；新增时只能选月、季、年，并校验同会员下不能重复。" },
      { label: "禁用规则", text: "未上架会员不进入前台新购入口，但不影响已生效会员权益。" },
    ],
  },
  packageDialog: {
    number: "1.1.6",
    title: "资源配置弹窗保存规则",
    page: "resourceManagement",
    placement: "top",
    sections: [
      { label: "新增态", text: "新增会员或新增平台弹窗只显示取消、保存；未保存前不生成资源记录。" },
      { label: "编辑态", text: "编辑会员、编辑月季年价格或编辑平台时回填当前字段，保存后只影响后续新购、续费或前台展示。" },
      { label: "会员字段", text: "会员弹窗维护会员名称、每日取数上限、并发任务数、可使用平台数、会员版本描述和上架状态，不出现具体平台选择字段。" },
      { label: "平台字段", text: "平台弹窗维护 Logo、平台名称、APPID、关联连接器、上架状态、前台标题和前台描述；Logo 非必填，APPID 只读。" },
      { label: "保存校验", text: "所有必填字段不能为空；生态全局试用期只允许 0-365 整数；原价必须大于等于 0；售价由原价和折扣自动计算，不允许手填。" },
    ],
  },
  packageSourceFields: {
    number: "1.1.7",
    title: "平台配置字段",
    page: "resourceManagement",
    placement: "right",
    sections: [
      { label: "平台名称", text: "必填文本，决定前台展示的数据源名称，例如生意参谋、阿里妈妈、京东商智。" },
      { label: "平台 Logo", text: "非必填；未上传图片时按平台名称首字生成默认头像，背景色由系统生成。" },
      { label: "APPID", text: "新增平台后系统自动生成，后台只读展示，不允许运营手动编辑。" },
      { label: "关联连接器", text: "必选多选，至少选择 1 个；保存后购买会员的租户可按该平台发放对应连接器授权。" },
      { label: "展示名称", text: "平台名称作为前台和后台列表展示名称；不允许用 APPID 或技术编码替代。" },
      { label: "试用规则", text: "平台不再单独维护试用开关；新租户试用期由当前生态全局配置控制，只用于试用资格判断。" },
    ],
  },
  memberStatusToggle: {
    number: "1.1.6.1",
    title: "会员上架状态",
    page: "resourceManagement",
    placement: "right",
    sections: [
      { label: "字段位置", text: "会员上架状态放在会员版本描述下方，不放在会员名称同一行。" },
      { label: "默认状态", text: "新增会员默认未上架；运营确认权益和价格后再手动切换为上架。" },
      { label: "影响范围", text: "未上架会员不进入前台购买入口，但不影响已生效会员权益。" },
    ],
  },
  connectorSelectRule: {
    number: "1.1.8",
    title: "连接器搜索与多选展示",
    page: "resourceManagement",
    placement: "right",
    sections: [
      { label: "搜索规则", text: "连接器多选必须支持输入搜索，按连接器名称过滤结果，适配连接器数量很多的情况。" },
      { label: "展示规则", text: "已选连接器超过 3 个时，输入框只展示前 3 个标签和 +N 个，避免撑高弹窗。" },
      { label: "保存规则", text: "折叠展示不影响保存；保存时提交完整连接器数组，不只提交可见的前 3 个。" },
      { label: "校验规则", text: "未选择连接器时保存被阻断，并在字段下方提示请选择至少 1 个连接器。" },
      { label: "空结果", text: "搜索无匹配时展示空结果；不能因为搜索为空自动清空已选连接器。" },
    ],
  },
  packageDeleteRule: {
    number: "1.1.9",
    title: "资源删除高风险确认",
    page: "resourceManagement",
    placement: "top",
    sections: [
      { label: "会员周期", text: "已有支付订单的会员周期不允许直接删除，只允许改为未上架。" },
      { label: "平台配置", text: "平台未上架后前台不展示，但后台保留配置和历史授权追溯。" },
      { label: "存量权益", text: "未上架不自动回滚已支付订单和已生效权益；存在未处理订单时真实系统应阻断或提示先处理依赖。" },
    ],
  },
  deviceTypeCascade: {
    number: "1.1.10",
    title: "平台关联连接器范围",
    page: "resourceManagement",
    placement: "right",
    sections: [
      { label: "字段范围", text: "平台配置维护关联连接器，支持搜索多选，例如生意参谋、阿里妈妈、京东商智和小红书。" },
      { label: "授权范围", text: "钉钉生态租户的连接器授权范围展示平台标签，例如钉钉_生参、钉钉_小红书。" },
      { label: "云资源规则", text: "机器人令牌、联通虚拟云号和云桌面机器人属于底层运行资源，不作为平台授权范围展示。" },
      { label: "保存校验", text: "平台上架前至少选择 1 个关联连接器；未选择时保存被阻断。" },
      { label: "展示规则", text: "表格展示已选连接器名称，数量较多时折叠为标签组，完整范围在编辑弹窗中查看。" },
    ],
  },
  saleCycleDialog: {
    number: "1.1.11",
    title: "售卖周期编辑上下文",
    page: "resourceManagement",
    placement: "top",
    sections: [
      { label: "顶部信息", text: "弹窗顶部展示当前会员名称和价格周期，必须和表格可见信息一致。" },
      { label: "平台摘要", text: "平台配置不出现价格编辑入口，只展示数据源、连接器和上架状态。" },
      { label: "会员摘要", text: "会员展示每日取数上限、默认并发任务数和可使用平台数。" },
      { label: "编辑态", text: "编辑月、季、年周期时回填周期、原价和折扣；售价由原价和折扣自动计算，保存后只刷新当前会员名称下的对应周期行。" },
      { label: "新增校验", text: "新增售卖周期只允许选择月、季、年；如果该会员下已存在同周期，保存时提示重复并阻止创建。" },
    ],
  },
  saleCycleFieldRule: {
    number: "1.1.12",
    title: "售卖周期字段与校验",
    page: "resourceManagement",
    placement: "right",
    sections: [
      { label: "固定周期", text: "会员价格只支持月、季、年三档；同一会员名称下不允许重复创建同一周期。" },
      { label: "原价", text: "必填数字，必须大于等于 0，单位为元；用于前台原价展示。" },
      { label: "是否有折扣", text: "0% 表示没有折扣，表格展示 -；大于 0 时展示折扣百分比，售价按原价和折扣自动计算。" },
      { label: "售价", text: "售价由原价和折扣自动计算；没有折扣时售价等于原价，不允许运营手填。" },
      { label: "适用范围", text: "价格字段只出现在会员配置；平台配置不维护价格、周期或单独购买入口。" },
      { label: "保存校验", text: "任一必填项为空、数值越界或周期重复时不能保存；失败时保留输入并在对应字段下提示。" },
    ],
  },
  saleCycleStatusRule: {
    number: "1.1.13",
    title: "售卖周期上下架状态",
    page: "resourceManagement",
    placement: "left",
    sections: [
      { label: "字段", text: "上架状态控制会员价格周期是否在前台购买和续费入口展示。" },
      { label: "默认值", text: "售卖周期默认未上架，运营确认价格后再上架。" },
      { label: "前台表现", text: "开启后前台展示该会员周期；关闭后前台隐藏该周期，但后台表格仍展示为未上架。" },
      { label: "后台表现", text: "已上架用绿色 Tag，未上架用灰色 Tag；状态变化保存成功后写入操作日志。" },
      { label: "边界", text: "未上架不影响已支付订单和已生效会员权益；仅影响后续新购和续费入口。" },
    ],
  },
  saleCycleEditEntry: {
    number: "1.1.14",
    title: "售卖周期编辑入口",
    page: "resourceManagement",
    placement: "left",
    sections: [
      { label: "入口位置", text: "会员固定周期行展示编辑价格；会员父级行展示编辑会员和新增售卖周期；平台行只展示编辑平台。" },
      { label: "打开结果", text: "编辑价格回填月、季、年周期、原价、折扣和上架状态；售价自动计算；编辑平台不出现价格或周期字段。" },
      { label: "弹窗标注", text: "编辑弹窗内继续标资源上下文、字段校验、上下架状态和删除风险。" },
      { label: "禁用态", text: "当前生态未开放时编辑按钮禁用，不能打开弹窗；禁用状态不改变已有配置数据。" },
      { label: "边界", text: "编辑保存失败时保留原输入并提示字段错误；取消关闭弹窗不回写表格。" },
    ],
  },
  productConfig: {
    number: "1.1",
    title: "平台配置",
    page: "platformType",
    placement: "left",
    sections: [
      { label: "页面功能说明", text: "平台配置承接前台数据源展示和连接器关系，不承接单独售卖。" },
      { label: "元素交互行为", text: "点击新增平台打开配置流程；编辑行内配置时维护平台名称、Logo、连接器、上架状态和前台文案。" },
      { label: "状态表现", text: "已上架展示绿色状态并进入前台；未上架展示灰色状态，仅后台保留。" },
      { label: "反馈机制", text: "保存成功后表格原地刷新并提示成功；保存失败保留输入并展示字段错误。" },
      { label: "用户操作流程", text: "选择生态 Tab -> 搜索或新增平台 -> 配置展示和连接器 -> 上架后同步到前台数据源列表。" },
      { label: "边界与异常状态", text: "平台池或连接器池加载失败时禁止保存；已被存量订阅引用的平台未上架不影响存量权益。" },
    ],
  },
  trialConfig: {
    number: "1.1.2.1",
    title: "试用期配置",
    page: "resourceManagement",
    placement: "left",
    sections: [
      { label: "页面功能说明", text: "试用期按生态全局配置，不挂在单个会员名称下，只影响新租户是否具备试用资格。" },
      { label: "元素交互行为", text: "运营在会员配置 / 平台配置 Tab 右侧配置新租户试用期，前台据此判断试用资格、试用平台和到期时间。" },
      { label: "状态表现", text: "新租户试用期只允许 0-365 的整数，当前示例为 3 天；0 即代表无试用期。" },
      { label: "反馈机制", text: "字段失焦后校验，保存时二次校验，错误展示在字段下方。" },
      { label: "用户操作流程", text: "进入资源管理 -> 设置当前生态新租户试用期 -> 保存 -> 新租户首次进入时读取该配置。" },
      { label: "边界与异常状态", text: "有效试用期内只允许使用试用平台；试用期不改变会员档位、可使用平台数或已选平台。" },
    ],
  },
  deviceConfig: {
    number: "1.3",
    title: "底层运行资源",
    page: "platformType",
    placement: "left",
    sections: [
      { label: "页面功能说明", text: "底层运行资源只作为权益发放后的后台分配结果，不作为前台售卖主体。" },
      { label: "元素交互行为", text: "订单发放成功后系统分配运行资源；运营在租户详情里查看分配状态。" },
      { label: "状态表现", text: "资源不足时订单发放失败并展示失败原因；不在资源管理里配置售卖价格。" },
      { label: "反馈机制", text: "分配成功、失败和人工重试写入操作记录。" },
      { label: "用户操作流程", text: "用户购买会员 -> 按可使用平台数选择平台 -> 支付成功 -> 系统写入会员有效期、可使用平台数和已选平台 -> 按已选平台发放连接器授权。" },
      { label: "边界与异常状态", text: "运行资源异常只影响发放结果，不改变会员有效期和订单金额。" },
    ],
  },
  tenantManagement: {
    number: "1.2",
    title: "租户管理",
    page: "tenantManagement",
    placement: "bottomLeft",
    sections: [
      { label: "页面功能说明", text: "租户管理保持租户授权管理主表，商业化生态增量展示会员状态、会员版本、可使用平台数、已选平台和关联合同/订单。" },
      { label: "元素交互行为", text: "运营先按生态 Tab 切换分表，再按租户名称、会员状态、授权产品和合同/订单号筛选；详情里区分已选平台和连接器授权范围。" },
      { label: "状态表现", text: "已选平台是用户购买会员时选择的平台；连接器授权范围是后台实际发放出来的资源结果，两者必须分开展示。" },
      { label: "反馈机制", text: "人工开通、续费、补发已选平台连接器授权或调整试用期后，页面提示成功并写入操作记录。" },
      { label: "用户操作流程", text: "进入租户管理 -> 筛选租户授权记录 -> 查看授权详情 -> 查看会员权益、已选平台、已开通数据源、订单来源、试用信息、底层资源和操作日志。" },
      { label: "边界与异常状态", text: "权益来源需区分自购买、人工开通和试用；过期权益保留历史记录，不从列表中直接删除。" },
    ],
  },
  tenantEcosystemFilter: {
    number: "1.2.1",
    title: "所属生态 Tab",
    page: "tenantManagement",
    placement: "bottomLeft",
    sections: [
      { label: "规则说明", text: "所属生态使用 Tab 分表展示，包含取数宝、钉钉、飞书、企微、联通、电信；每个 Tab 下只展示该生态授权记录。" },
      { label: "示例", text: "运营切到钉钉 Tab 后，再输入合同/订单号定位订单发放出的授权记录；切到取数宝 Tab 后只看原授权记录。" },
      { label: "边界", text: "清空筛选后恢复全部授权记录；无匹配记录时展示表格空态，不改动授权数据。" },
    ],
  },
  tenantEcosystemColumn: {
    number: "1.2.2",
    title: "授权主表增量字段",
    page: "tenantManagement",
    placement: "top",
    sections: [
      { label: "规则说明", text: "商业化生态主表展示租户名称、会员状态、会员版本、有效期至、可使用平台数、已选平台、连接器授权范围和关联合同/订单；所属生态由上方 Tab 表达。" },
      { label: "示例", text: "钉钉租户已选平台展示 3/5：生意参谋、阿里妈妈、京东商智；连接器授权范围展示钉钉_生参、钉钉_阿里妈妈、钉钉_京东商智。" },
      { label: "边界", text: "机器人令牌、联通虚拟云号、云桌面机器人属于云资源，连接器授权范围展示空占位。" },
    ],
  },
  tenantAuthScope: {
    number: "1.2.2.1",
    title: "连接器授权范围",
    page: "tenantManagement",
    placement: "top",
    sections: [
      { label: "字段来源", text: "连接器授权范围来自订单权益发放结果，不直接等同于已选平台；例如钉钉_生参、钉钉_阿里妈妈。" },
      { label: "空值规则", text: "机器人令牌、联通虚拟云号、云桌面机器人属于云资源，没有连接器授权范围，展示 -；连接器授权未配置标签时也展示 -。" },
    ],
  },
  tenantCompensation: {
    number: "1.2.3",
    title: "人工补偿操作",
    page: "tenantManagement",
    placement: "left",
    sections: [
      { label: "操作范围", text: "钉钉生态租户支持人工开通会员、续费会员、补发已选平台连接器授权和调整试用期。" },
      { label: "记录要求", text: "人工操作必须写入操作记录，记录操作人、租户、权益、前后值、原因和操作时间。" },
      { label: "边界", text: "取数宝生态租户不展示会员补偿动作，避免和原授权体系混用。" },
    ],
  },
  orderManagementPage: {
    number: "1.3",
    title: "订单管理",
    page: "orderManagement",
    placement: "top",
    sections: [
      { label: "页面职责", text: "订单管理承接前台购买会员后的平台选择结果，记录用户本次选择的平台列表、支付结果和权益发放结果。" },
      { label: "生态分表", text: "所属生态使用 Tab 分表展示，不放在订单表格列里；当前订单集中在钉钉生态。" },
      { label: "默认排序", text: "订单列表默认按创建时间倒序展示，最新创建的订单在前；切换生态和筛选条件后仍保持该排序。" },
      { label: "订单来源", text: "前台生成订单时写入会员版本、售卖周期、可使用平台数和用户已选平台，业务来源按取数宝_钉钉_租户名称写入。" },
      { label: "边界", text: "订单管理不直接编辑价格；会员价格、周期和上下架来自资源管理最新配置。" },
    ],
  },
  orderDetail: {
    number: "1.3.1",
    title: "订单详情",
    page: "orderManagement",
    placement: "left",
    sections: [
      { label: "可见字段", text: "订单详情展示订单号、外部支付单号、租户、会员版本、售卖周期、可使用平台数、用户本次选择的平台列表、支付状态、权益发放状态、重试记录和失败原因。" },
      { label: "发放逻辑", text: "支付成功后依次写入会员有效期、会员可使用平台数和用户选择的平台，再按已选平台发放连接器授权。" },
      { label: "列表排序", text: "订单列表按创建时间倒序，最新订单在最上方，方便优先处理刚支付或刚失败的订单。" },
      { label: "失败原因", text: "发放失败时必须展示失败原因，不能只展示失败状态。" },
      { label: "边界", text: "支付失败订单不允许发放权益；无需支付的人工订单仍要保留来源和操作记录。" },
    ],
  },
  orderRetry: {
    number: "1.3.2",
    title: "人工重试发放",
    page: "orderManagement",
    placement: "top",
    sections: [
      { label: "出现条件", text: "仅权益发放失败的订单展示人工重试发放入口。" },
      { label: "重试结果", text: "点击后按订单已选平台重新发放连接器授权；成功后改为发放成功，失败时保留原因并追加重试记录。" },
      { label: "幂等要求", text: "支付成功回调和人工重试都必须幂等，不能重复写入会员有效期、已选平台或重复发放连接器授权。" },
    ],
  },
  operationLogPage: {
    number: "1.3",
    title: "操作日志",
    page: "operationLogs",
    placement: "top",
    sections: [
      { label: "规则说明", text: "操作日志用于追溯商业化开关、会员价格、平台配置、订单重试和租户权益调整。" },
      { label: "示例", text: "运营把普通会员 1 个月售价从 ¥199 改为 ¥219 后，日志必须记录操作人、对象、前后值和操作时间。" },
      { label: "边界", text: "日志只读，不提供删除；字段缺失时保留整条记录并展示空占位。" },
    ],
  },
  exceptionCompensation: {
    number: "1.3.1",
    title: "操作日志筛选",
    page: "operationLogs",
    placement: "left",
    sections: [
      { label: "页面功能说明", text: "操作日志记录商业化开关、会员配置、会员价格、人工续费、订阅编辑等后台关键操作。" },
      { label: "元素交互行为", text: "筛选区必须使用真实 Ant Design Select、DatePicker.RangePicker 和图标按钮；操作类型和日期范围变化后立即刷新当前列表。" },
      { label: "状态表现", text: "默认查询 2026-02-15 至 2026-02-21 的全部操作；点击刷新图标恢复默认类型和默认日期范围。" },
      { label: "反馈机制", text: "筛选失败时保留原列表并展示错误提示；空结果展示空状态而不是隐藏表格。" },
      { label: "用户操作流程", text: "进入操作日志 -> 选择操作类型或日期范围 -> 查询变更记录 -> 追溯具体配置变化。" },
      { label: "边界与异常状态", text: "日志只记录可追溯操作，不提供删除；商业化开关失败回滚也必须记录失败结果。" },
    ],
  },
  operationLogFields: {
    number: "1.3.2",
    title: "操作日志字段说明",
    page: "operationLogs",
    placement: "top",
    sections: [
      { label: "记录时机", text: "商业化开关变更、会员配置编辑、会员价格上下架、平台配置编辑、人工续费、租户权益调整成功或失败回滚时，都必须写入日志。" },
      { label: "字段口径", text: "操作人记录触发账号；操作类型记录业务分类；操作对象记录生态、租户或资源名称；操作时间取服务端完成时间并按倒序展示。" },
      { label: "变更内容", text: "必须记录前后值或明确动作，例如关闭 -> 开启、售价 ¥199 -> ¥219、有效期延长 3 个月；不能只写“已修改”。" },
      { label: "状态表现", text: "表格使用 Ant Design Table；字段说明用表头 Info Tooltip 展示；分页使用 Ant Design Pagination，统计数量必须等于当前筛选结果。" },
      { label: "边界与异常状态", text: "日志不允许删除；字段缺失时该单元格展示空占位但保留整条日志，便于定位数据回写问题。" },
    ],
  },
  frontendSurface: {
    number: "2",
    title: "前台",
    page: "plugin",
    placement: "bottom",
    sections: [
      { label: "本期范围", text: "前台承接钉钉 AI 表格内的插件入口和数据源入口，分别处理购买权益与数据同步。" },
      { label: "页面关系", text: "插件页面负责会员购买、支付开通和权益校验；数据源页面负责数据连接、授权、同步配置和任务结果反馈。" },
      { label: "边界", text: "前台宿主仍是钉钉 AI 表格；关闭弹窗后必须回到宿主页面，不能跳出到独立站点。" },
    ],
  },
  frontEntry: {
    number: "2.1",
    title: "生态插件前台首页",
    page: "plugin",
    placement: "bottom",
    sections: [
      { label: "页面功能说明", text: "前台嵌入钉钉 AI 表格右侧插件栏，平台页作为取数入口，帮助用户选择电商数据来源并同步到当前 AI 表格。" },
      { label: "元素交互行为", text: "左侧主导航为平台、店铺、任务；底部为帮助和头像设置。点击平台入口进入对应取数配置，续费入口只在会员临期时出现。" },
      { label: "状态表现", text: "平台入口只用轻量圆点表达可用、试用、未开通状态，避免把购买状态作为首页核心指标。" },
      { label: "反馈机制", text: "会员临期只展示一条轻提示；未开通会员点击数据源后引导购买，已可用数据源点击后进入取数流程。" },
      { label: "用户操作流程", text: "打开 AI 表格侧栏插件 -> 选择取数平台 -> 进入取数配置 -> 写回当前 AI 表格。" },
      { label: "边界与异常状态", text: "截图里的淘系店铺登录只是当前插件位置示意，不作为本页内容；红框外 AI 表格只作低保真承载。" },
    ],
  },
  packageSelection: {
    number: "2.1.1",
    title: "会员购买入口",
    page: "plugin",
    placement: "bottomLeft",
    sections: [
      { label: "页面功能说明", text: "前台只销售会员，用户选择普通会员或高级会员后再选择购买月份。" },
      { label: "元素交互行为", text: "用户选择会员名称和购买月份后，底部结算区域实时更新商品明细和合计金额。" },
      { label: "状态表现", text: "已选择项展示橙色描边；会员卡片展示取数上限和并发任务数，试用期读取生态全局配置。" },
      { label: "反馈机制", text: "点击商品卡不弹 Toast，直接刷新结算信息；提交订单后进入支付状态。" },
      { label: "用户操作流程", text: "选择会员名称 -> 选择购买月份 -> 查看金额 -> 提交订单并支付。" },
      { label: "边界与异常状态", text: "未购买会员时不能创建正式取数任务；未上架会员周期不可选。" },
    ],
  },
  selfCheckout: {
    number: "2.1.2",
    title: "自助支付与自动开通",
    page: "plugin",
    placement: "top",
    sections: [
      { label: "页面功能说明", text: "用户在店小宝内完成订单提交、支付、开通和权益刷新，减少人工销售和人力服务介入。" },
      { label: "元素交互行为", text: "点击提交订单后生成订单号；支付成功后进入自动开通，开通成功后刷新已购状态。" },
      { label: "状态表现", text: "支付中、开通中、已开通、支付失败、开通失败分开展示，不把支付成功等同于开通成功。" },
      { label: "反馈机制", text: "支付成功 Toast 提示，开通中展示处理中；开通失败生成后台异常任务。" },
      { label: "用户操作流程", text: "提交订单 -> 扫码支付 -> 自动开通权益 -> 首页展示已购态。" },
      { label: "边界与异常状态", text: "支付取消停留在结算页；重复支付回调必须幂等，不重复写入会员权益、已选平台或重复发放连接器授权。" },
    ],
  },
  entitlementGate: {
    number: "2.1.3",
    title: "任务创建前权益校验",
    page: "plugin",
    placement: "bottomRight",
    sections: [
      { label: "页面功能说明", text: "创建或运行取数任务前先看有效试用期；试用无效再看有效会员、会员到期状态和当前平台是否在已选平台内。" },
      { label: "元素交互行为", text: "用户点击取数时按顺序判断：有效试用期 -> 有效会员 -> 会员是否到期 -> 当前平台是否在已选平台内；购买完成后不再判断可使用平台数是否还有余量。" },
      { label: "状态表现", text: "试用平台、有效会员且平台已选时允许登录/授权/取数；会员无效、到期或当前平台未开通时展示对应阻断提示。" },
      { label: "反馈机制", text: "阻断提示明确缺失项、当前已购权益和可执行动作，并保留用户任务草稿。" },
      { label: "用户操作流程", text: "点击取数 -> 校验权益 -> 通过则创建任务，未通过则进入购买或续费。" },
      { label: "边界与异常状态", text: "权益接口失败时不默认放行，展示重试和联系客服兜底入口。" },
    ],
  },
  dataSourceSurface: {
    number: "2.2",
    title: "前台数据源入口",
    page: "dataSource",
    placement: "right",
    sections: [
      { label: "触发位置", text: "用户在钉钉 AI 表格左下角点击“数据源”入口，打开居中的数据连接中心弹窗；默认进入数据源原型时也直接展示该弹窗。" },
      { label: "弹层形态", text: "数据连接中心、数据源详情、授权、订阅、同步配置、登录校验、任务执行和结果态都使用弹窗承接，不使用侧边抽屉。" },
      { label: "状态变化", text: "弹窗关闭后回到 AI 表格宿主，左下角入口保持可点击；再次点击重新进入数据连接中心，不保留上一次的详情或配置中间态。" },
      { label: "场景示例", text: "运营专员正在表格里做商品分析，点击数据源后选择淘宝生意参谋，把商品排行同步到当前数据表。" },
      { label: "边界与异常", text: "数据源入口只负责打开弹窗，不直接创建任务；宿主表格加载失败时不展示数据源弹窗。" },
    ],
  },
  dataSourceConnectionCenter: {
    number: "2.2.1",
    title: "数据连接中心",
    page: "dataSource",
    placement: "top",
    sections: [
      { label: "字段与布局", text: "居中弹窗顶部包含标题、搜索框和关闭按钮；左侧为分类导航；右侧以三列卡片展示数据源名称、提供方、图标和一句话说明。" },
      { label: "交互规则", text: "搜索框按数据源名称和说明模糊筛选；鼠标 hover 淘宝生意参谋卡片时展示“使用”按钮，其他卡片只展示信息不进入完整链路。" },
      { label: "状态变化", text: "点击“使用”在同一弹窗链路内切换到数据源详情；关闭按钮回到 AI 表格宿主；搜索无结果时展示空态但不清空搜索词。" },
      { label: "边界与异常", text: "本期只有淘宝生意参谋可进入完整配置；其他数据源不展示不可用报错，避免误以为资源配置失败。" },
    ],
  },
  dataSourceDetail: {
    number: "2.2.2",
    title: "数据源详情",
    page: "dataSource",
    placement: "right",
    sections: [
      { label: "页面字段", text: "详情页展示数据源图标、名称、取数宝标签、能力说明、分享链接、立即使用、功能概述、功能价值、客户 logo、开发者、更新时间和发布时间。" },
      { label: "交互规则", text: "点击“立即使用”进入授权确认；点击“分享链接”提示复制链接成功；详情页只保留关闭入口，不展示额外回退导航。" },
      { label: "场景示例", text: "用户想确认生意参谋能同步哪些数据，先看功能概述和功能价值，再决定是否授权使用。" },
      { label: "边界与异常", text: "详情页不展示套餐价格；价格和订阅只在同步配置缺少订阅时出现，避免把详情页做成购买页。" },
    ],
  },
  dataSourceAuthSubscribe: {
    number: "2.2.3",
    title: "授权确认",
    page: "dataSource",
    placement: "right",
    sections: [
      { label: "授权规则", text: "首次使用淘宝生意参谋前展示授权清单，用户必须同意服务协议、隐私协议和企业协议后才能进入同步配置。" },
      { label: "状态变化", text: "点击“同意协议并立即启用”进入同步配置；点击“拒绝”关闭授权弹窗并回到详情页。" },
      { label: "边界与异常", text: "授权确认只处理应用授权，不包含套餐、订阅、支付或账号登录校验说明。" },
    ],
  },
  dataSourceConfig: {
    number: "2.2.4",
    title: "同步配置",
    page: "dataSource",
    placement: "right",
    sections: [
      { label: "配置步骤", text: "左侧步骤为选择数据源、设置账号、设置参数；右侧默认展示数据模块卡、账号下拉/添加账号和日期范围，更多参数收起在高级设置中。" },
      { label: "按钮状态", text: "未订阅或未添加账号时“开始获取”禁用；订阅成功且账号登录校验通过后按钮可用，点击后进入任务运行。" },
      { label: "账号规则", text: "账号下拉展示已保存账号，并提供添加账号入口；添加账号只收集平台、账号和密码，密码加密传输，不在前端明文存储。" },
      { label: "边界与异常", text: "日期范围为空、未选择数据模块或账号未通过登录校验时不能开始获取；关闭弹窗后回到宿主，不自动提交草稿。" },
    ],
  },
  dataSourceLoginCheck: {
    number: "2.2.5",
    title: "登录校验",
    page: "dataSource",
    placement: "top",
    sections: [
      { label: "触发条件", text: "添加账号后或订阅成功后进入登录校验，系统尝试登录生意参谋账号并展示倒计时。" },
      { label: "验证码规则", text: "如果登录触发验证码，弹窗切换为验证码输入态；提交按钮在验证码为空时禁用，输入后可提交。" },
      { label: "状态变化", text: "验证码提交成功后回到同步配置页，并把账号状态改为已添加；失败时保留验证码输入框并提示重试。" },
      { label: "边界与异常", text: "用户关闭登录校验弹窗时不保存账号；倒计时结束仍未通过时提示登录失败，不创建取数任务。" },
    ],
  },
  dataSourceTaskResult: {
    number: "2.2.6",
    title: "任务执行与结果",
    page: "dataSource",
    placement: "top",
    sections: [
      { label: "任务规则", text: "开始获取后展示任务运行弹窗，步骤包含获取数据和数据入库；运行期间可收起弹窗，但任务继续执行。" },
      { label: "成功反馈", text: "任务完成后展示数据获取成功弹窗，提示可前往数据表查看；点击确定关闭弹窗回到 AI 表格宿主。" },
      { label: "异常反馈", text: "获取失败时应展示失败原因、重试和联系客服入口；本原型只展示成功态，但研发需预留失败态。" },
      { label: "场景示例", text: "用户配置商品排行并点击开始获取，系统先登录校验，再获取数据并写入当前数据表，最后提示数据获取成功。" },
    ],
  },
};

const ruleRows: RuleRow[] = [
  {
    noteId: "backendSurface",
    title: "后台",
    rule: "本期只做后台管理，范围收敛到租户管理、资源管理和订单管理。",
    exception: "操作日志完整页面、经营看板、加速包前台售卖、独立云资源售卖和独立资源池菜单均为二期或不做范围。",
    parent: true,
    children: [
      {
        noteId: "resourceOverview",
        title: "资源管理",
        rule: "资源管理配置前台会员售卖和数据源展示，包含会员配置和平台配置。",
        exception: "平台不配置价格和售卖周期；试用期、会员价格、会员周期和上下架状态必须后台可配置。",
        level: 1,
        children: [
          {
            noteId: "resourceEcologyData",
            title: "所属生态",
            rule: "资源按生态隔离，本期只开放钉钉；飞书、企微、联通、电信展示暂未开放。",
            exception: "钉钉生态权益不得和取数宝原授权体系混用。",
            level: 2,
          },
          {
            noteId: "devicePackageTable",
            title: "会员配置",
            rule: "会员配置当前预置普通会员、高级会员，支持新增和编辑会员名称，并维护取数上限、并发任务数、可使用平台数、售卖周期、原价、售价、折扣和上架状态。",
            exception: "会员配置只定义最多可用几个平台，不指定具体平台；新租户试用期只影响试用资格判断。",
            level: 2,
          },
          {
            noteId: "platformPackageTable",
            title: "平台配置",
            rule: "平台配置维护 Logo、平台名称、APPID、关联连接器、上架状态和前台文案。",
            exception: "平台只是平台池配置，不出现价格、售卖周期、最低可用会员档位或会员关联关系。",
            level: 2,
          },
          {
            noteId: "resourceCreateEntry",
            title: "新增/编辑配置",
            rule: "新增或编辑会员、平台时打开配置弹窗，会员保存后前台订阅配置读取最新配置，平台保存后前台数据源列表读取最新配置。",
            exception: "新增态不展示删除；编辑态删除必须二次确认且不回滚已支付订单和已生效权益。",
            level: 2,
          },
        ],
      },
      {
        noteId: "tenantManagement",
        title: "租户管理",
        rule: "租户管理复用现有取数宝租户授权管理，通过所属生态 Tab 分表，并新增会员状态、会员版本、可使用平台数、已选平台、连接器授权范围和合同/订单追踪信息。",
        exception: "取数宝生态租户继续展示原授权体系，不受会员 / 数据源模型影响。",
        level: 1,
        children: [
          {
            noteId: "tenantEcosystemFilter",
            title: "所属生态 Tab",
            rule: "所属生态改为 Tab 分表，包含取数宝、钉钉、飞书、企微、联通、电信；筛选区保留租户名称、更新人、更新日期、授权产品、创建人、创建日期；钉钉分表补充会员状态和合同/订单号。",
            exception: "筛选只影响展示结果，不修改租户授权和权益数据。",
            level: 2,
          },
          {
            noteId: "tenantEcosystemColumn",
            title: "授权主表增量字段",
            rule: "主表保留原授权字段；商业化生态增量展示会员状态、会员版本、可使用平台数、已选平台和关联合同/订单。",
            exception: "已选平台是购买时选择结果；连接器授权范围是后台发放结果，两者不能混为同一个字段。",
            level: 2,
          },
          {
            noteId: "tenantCompensation",
            title: "人工补偿",
            rule: "支持人工开通会员、续费会员、补发已选平台连接器授权和调整试用期。",
            exception: "人工操作必须写入操作记录，二期在操作日志页面集中展示。",
            level: 2,
          },
        ],
      },
      {
        noteId: "orderManagementPage",
        title: "订单管理",
        rule: "订单管理承接前台会员订单、用户已选平台和权益发放结果，表格展示订单号、租户、会员版本、售卖周期、可使用平台数、本次开通平台、支付状态和权益发放状态。",
        exception: "支付成功不等于权益发放成功；发放失败必须展示失败原因。",
        level: 1,
        children: [
          {
            noteId: "orderDetail",
            title: "订单详情",
            rule: "详情页展示外部支付单号、支付时间、业务来源、用户已选平台、失败原因、重试记录和权益发放过程。",
            exception: "支付失败订单不允许发放权益；无需支付的人工订单仍保留来源。",
            level: 2,
          },
          {
            noteId: "orderRetry",
            title: "人工重试发放",
            rule: "权益发放失败时支持人工重试发放。",
            exception: "支付回调和人工重试都必须幂等，避免重复写入会员有效期、已选平台或重复发放连接器授权。",
            level: 2,
          },
        ],
      },
    ],
  },
];

const prototypePageMeta: Record<PrototypePage, { nav: string; title: string; side: string; surface: PrototypeSurface }> = {
  platformType: { nav: "平台类型管理", title: "平台类型管理", side: "平台类型管理", surface: "backend" },
  tenantManagement: { nav: "租户管理", title: "租户管理", side: "租户管理", surface: "backend" },
  dataDashboard: { nav: "经营看板", title: "经营看板", side: "经营看板", surface: "backend" },
  resourceManagement: { nav: "资源管理", title: "资源管理", side: "资源管理", surface: "backend" },
  orderManagement: { nav: "订单管理", title: "订单管理", side: "订单管理", surface: "backend" },
  operationLogs: { nav: "操作日志", title: "操作日志", side: "操作日志", surface: "backend" },
  plugin: { nav: "插件", title: "插件前台", side: "插件", surface: "frontend" },
  dataSource: { nav: "数据源", title: "数据源前台", side: "数据源", surface: "frontend" },
};

function readInitialTab(): WorkspaceTab {
  return new URLSearchParams(window.location.search).get("tab") === "prd" ? "prd" : "prototype";
}

function readInitialPage(): PrototypePage {
  const params = new URLSearchParams(window.location.search);
  const surface = params.get("surface");
  const page = params.get("page");

  if (surface === "backend") {
    if (page === "resourceManagement") return "resourceManagement";
    if (page === "orderManagement" || page === "backendOrders" || page === "orders") return "orderManagement";
    if (page === "tenantManagement") return "tenantManagement";
    return "resourceManagement";
  }
  if (surface === "frontend") {
    if (page === "dataSource") return "dataSource";
    return "plugin";
  }

  if (page === "platformType" || page === "admin") return "resourceManagement";
  if (page === "dataDashboard") return "resourceManagement";
  if (page === "orderManagement" || page === "backendOrders" || page === "orders") return "orderManagement";
  if (page === "tenantManagement") return "tenantManagement";
  if (page === "resourceManagement") return "resourceManagement";
  if (page === "operationLogs") return "resourceManagement";
  if (page === "dataSource") return "dataSource";
  if (page === "plugin" || page === "storefront" || page === "entitlement") return "plugin";
  return "resourceManagement";
}

function updateUrl(tab: WorkspaceTab, page: PrototypePage) {
  const next = new URL(window.location.href);
  next.searchParams.set("requirement", "commercial");
  next.searchParams.set("tab", tab);
  if (tab === "prototype") {
    next.searchParams.set("surface", prototypePageMeta[page].surface);
    next.searchParams.set("page", page);
  } else {
    next.searchParams.delete("surface");
    next.searchParams.delete("page");
  }
  window.history.replaceState(null, "", `${next.pathname}${next.search}`);
}

function getPrototypeSurface(page: PrototypePage): PrototypeSurface {
  return prototypePageMeta[page].surface;
}

function PortalLogoMark() {
  return (
    <div className="portal-logo-mark" aria-hidden="true">
      <span className="portal-logo-primary" />
      <span className="portal-logo-orange" />
    </div>
  );
}

function PriorityCell({ value }: { value: string }) {
  const colorMap: Record<string, string> = { P0: "red", P1: "orange", P2: "blue", P3: "green" };
  return <Tag color={colorMap[value] || "default"}>{value}</Tag>;
}

function InteractionMarker({ noteId, className }: { noteId: keyof typeof interactionNotes; className?: string }) {
  const note = interactionNotes[noteId];
  if (!note) return null;

  return (
    <Popover
      trigger={["hover", "click"]}
      placement={note.placement || "top"}
      overlayClassName="interaction-tooltip-popover"
      content={
        <div className="interaction-tooltip">
          <div className="interaction-tooltip-title">
            <Badge className="interaction-marker" count={note.number} />
            <strong>{note.title}</strong>
          </div>
          {note.sections.map((section) => (
            <div className="interaction-tooltip-section" key={section.label}>
              <div className="interaction-tooltip-section-label">{section.label}</div>
              <div className="interaction-tooltip-section-body">
                <p>{section.text}</p>
              </div>
            </div>
          ))}
        </div>
      }
    >
      <button className={`interaction-marker-trigger ${className || ""}`} type="button" aria-label={`${note.number} ${note.title}`}>
        <Badge className="interaction-marker" count={note.number} />
      </button>
    </Popover>
  );
}

function Annotated({ noteId, children, className }: { noteId: keyof typeof interactionNotes; children: ReactNode; className?: string }) {
  return (
    <div className={`annotated-control ${className || ""}`}>
      {children}
      <InteractionMarker noteId={noteId} />
    </div>
  );
}

function getActiveMenuKey(activeTab: WorkspaceTab, activePage: PrototypePage): PrototypeMenuKey {
  if (activeTab === "prd") return "prd";
  if (getPrototypeSurface(activePage) === "backend") return "backend";
  return activePage === "dataSource" ? "dataSource" : "plugin";
}

function getActiveViewLabel(activeTab: WorkspaceTab, activePage: PrototypePage) {
  if (activeTab === "prd") return "PRD";
  if (getPrototypeSurface(activePage) === "backend") return "后台";
  return activePage === "dataSource" ? "前台 / 数据源" : "前台 / 插件";
}

function IterationBar({
  activeTab,
  activePage,
  onSelectMenu,
}: {
  activeTab: WorkspaceTab;
  activePage: PrototypePage;
  onSelectMenu: (key: PrototypeMenuKey) => void;
}) {
  const activeMenuKey = getActiveMenuKey(activeTab, activePage);
  return (
    <div className="iteration-bar">
      <span className="iteration-title">店小宝商业化改版需求</span>
      <div className="iteration-requirements" role="tablist" aria-label="迭代需求切换">
        <Dropdown
          trigger={["click"]}
          menu={{
            selectedKeys: [activeMenuKey],
            items: [
              { key: "prd", label: "PRD" },
              {
                key: "prototype",
                label: "原型交互",
                children: [
                  { key: "plugin", label: "前台 / 插件" },
                  { key: "dataSource", label: "前台 / 数据源" },
                  { key: "backend", label: "后台" },
                ],
              },
            ],
            onClick: ({ key }) => {
              if (key === "prd" || key === "backend" || key === "plugin" || key === "dataSource") {
                onSelectMenu(key);
              }
            },
          }}
        >
          <button className="iteration-requirement active" type="button" role="tab" aria-selected>
            <span>商业化改版</span>
            <Tag className="iteration-view-tag" color="volcano" bordered>
              {getActiveViewLabel(activeTab, activePage)}
            </Tag>
            <DownOutlined className="iteration-dropdown-icon" />
          </button>
        </Dropdown>
      </div>
    </div>
  );
}

function BackendPortalHeader({ hideBackendMarker = false }: { hideBackendMarker?: boolean }) {
  const navItems: Array<{ label: string; active?: boolean }> = [
    { label: "市场" },
    { label: "电商取数宝" },
    { label: "跨境取数宝(旧)" },
    { label: "跨境取数宝" },
    { label: "网银取数宝" },
    { label: "电商取数宝(新)" },
    { label: "手机取数宝" },
    { label: "餐饮取数宝" },
    { label: "资源管理" },
    { label: "后台管理", active: true },
    { label: "告警规则设置" },
    { label: "权限管理" },
  ];

  return (
    <Header className="portal-header">
      <div className="portal-brand">
        <PortalLogoMark />
        <span className="portal-brand-name">智能门户平台</span>
      </div>
      <button className="portal-collapse" type="button" aria-label="折叠菜单">
        <MenuFoldOutlined />
      </button>
      <nav className="portal-primary-nav" aria-label="一级导航">
        {navItems.map((item) => (
          <span className="portal-nav-item" key={item.label}>
            <button className={`portal-nav-button${item.active ? " active" : ""}`} type="button">
              {item.label}
            </button>
            {item.label === "后台管理" && !hideBackendMarker && (
              <InteractionMarker noteId="backendEntry" className="nav-marker" />
            )}
          </span>
        ))}
      </nav>
      <div className="portal-tools">
        <PhoneOutlined />
        <span className="portal-bell">
          <BellOutlined />
          <span />
        </span>
        <span className="portal-avatar">
          <UserOutlined />
        </span>
        <button className="portal-tenant" type="button">
          全域电商 <DownOutlined />
        </button>
      </div>
    </Header>
  );
}

function BackendSideNav({ activePage, onSwitchPage }: { activePage: PrototypePage; onSwitchPage: (page: PrototypePage) => void }) {
  const screenshotItems: Array<{ icon: ReactNode; label: string }> = [
    { icon: <FileTextOutlined />, label: "平台类型管理" },
    { icon: <FileTextOutlined />, label: "连接器管理（后台）" },
    { icon: <FileTextOutlined />, label: "无影云管理" },
    { icon: <FileTextOutlined />, label: "机器人令牌管理" },
    { icon: <DatabaseOutlined />, label: "数据巡检" },
  ];
  const ecosystemItems: Array<{ page?: PrototypePage; label: string; disabled?: boolean }> = [
    { page: "tenantManagement", label: "租户管理" },
    { page: "resourceManagement", label: "资源管理" },
    { page: "orderManagement", label: "订单管理" },
  ];
  const ecosystemActive = ecosystemItems.some((item) => item.page === activePage);

  return (
    <div className="portal-side-list auth-side-list">
      {screenshotItems.map((item, index) => (
        <button
          className="portal-side-root"
          type="button"
          key={`${item.label}-${index}`}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
      <div className="portal-side-group">
        <button className={`portal-side-root${ecosystemActive ? " active" : ""}`} type="button">
          <AppstoreOutlined />
          <span>生态管理</span>
          <span className="portal-side-caret">⌃</span>
        </button>
        {ecosystemItems.map((item) => (
          <button
            className={`portal-side-child${item.page && activePage === item.page ? " current" : ""}${item.disabled ? " disabled" : ""}`}
            type="button"
            key={item.label}
            disabled={item.disabled}
            onClick={() => item.page && onSwitchPage(item.page)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function renderTable(rows: ReactNode[][], className = "") {
  return (
    <table className={`prd-table ${className}`}>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={`${rowIndex}-${row.length}`}>
            {row.map((cell, cellIndex) =>
              rowIndex === 0 ? (
                <th key={`${rowIndex}-${cellIndex}`}>{cell}</th>
              ) : (
                <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>
              ),
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PrdSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="prd-section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

type PrdScopeGroup = {
  module: string;
  side: string;
  product: string;
  priority: string;
  children: Array<{
    changeType: string;
    feature: string;
    item: string;
  }>;
};

function renderScopeTreeTable(groups: PrdScopeGroup[]) {
  return (
    <table className="prd-table scope-table scope-tree-table">
      <tbody>
        <tr>
          <th>功能模块</th>
          <th>页面/事项</th>
          <th>改动类型</th>
          <th>功能点</th>
          <th>端</th>
          <th>产品线</th>
          <th>优先级</th>
        </tr>
        {groups.flatMap((group) =>
          group.children.map((child, childIndex) => (
            <tr key={`${group.module}-${child.item}`}>
              {childIndex === 0 && <td rowSpan={group.children.length}>{group.module}</td>}
              <td>{child.item}</td>
              <td>{child.changeType}</td>
              <td>{child.feature}</td>
              {childIndex === 0 && <td rowSpan={group.children.length}>{group.side}</td>}
              {childIndex === 0 && <td rowSpan={group.children.length}>{group.product}</td>}
              {childIndex === 0 && <td rowSpan={group.children.length}>{group.priority}</td>}
            </tr>
          )),
        )}
      </tbody>
    </table>
  );
}

function MermaidChart({ title, chart }: { title: string; chart: string }) {
  const chartId = `prd-mermaid-${useId().replace(/:/g, "")}`;
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");
  const source = chart.trim();

  useEffect(() => {
    let mounted = true;
    import("mermaid")
      .then(({ default: mermaid }) => {
        mermaid.initialize({
          flowchart: {
            curve: "basis",
            htmlLabels: true,
            nodeSpacing: 40,
            rankSpacing: 52,
          },
          fontFamily: "Geist Variable, Arial, sans-serif",
          securityLevel: "strict",
          startOnLoad: false,
          theme: "base",
          themeVariables: {
            background: "#ffffff",
            edgeLabelBackground: "#ffffff",
            fontFamily: "Geist Variable, Arial, sans-serif",
            lineColor: "#94a3b8",
            primaryBorderColor: "#ff7a45",
            primaryColor: "#fff7ed",
            primaryTextColor: "#1f2937",
            secondaryBorderColor: "#93c5fd",
            secondaryColor: "#eff6ff",
            tertiaryBorderColor: "#c4b5fd",
            tertiaryColor: "#f5f3ff",
          },
        });
        return mermaid.render(chartId, source);
      })
      .then(({ svg: renderedSvg }) => {
        if (!mounted) return;
        setSvg(renderedSvg);
        setError("");
      })
      .catch((renderError: unknown) => {
        if (!mounted) return;
        setSvg("");
        setError(renderError instanceof Error ? renderError.message : String(renderError));
      });
    return () => {
      mounted = false;
    };
  }, [chartId, source]);

  return (
    <div className="prd-mermaid-block">
      <h4>{title}</h4>
      {svg ? (
        <div className="prd-mermaid-visual" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <div className="prd-mermaid-loading">{error ? "流程图渲染失败，请查看 Mermaid 源码" : "流程图渲染中..."}</div>
      )}
      <details className="prd-mermaid-source">
        <summary>Mermaid 源码</summary>
        <pre className="prd-mermaid-code">
          <code>{source}</code>
        </pre>
      </details>
    </div>
  );
}

function PrdContent(props: { onJump: (page: PrototypePage) => void }) {
  const { onJump } = props;
  const overallFlow = `
flowchart TD
  A["后台：配置会员名称、周期价格、可使用平台数"] --> B["后台：配置平台名称、Logo、连接器、上架和前台文案"]
  B --> C["后台：配置新租户试用期"]
  C --> D["前台：用户进入数据连接中心并选择数据源"]
  D --> E["前台：授权并进入同步配置"]
  E --> F{"点击登录校验或开始获取"}
  F --> G{"是否存在有效试用期，且当前平台在试用平台内？"}
  G -- "是" --> H["允许登录/授权/取数"]
  G -- "否" --> I{"是否存在有效会员？"}
  I -- "否" --> J["拦截：试用期已到期或暂无有效会员，引导购买"]
  I -- "是" --> K{"会员是否到期？"}
  K -- "是" --> L["拦截：会员已到期，引导续费"]
  K -- "否" --> M{"当前平台是否为购买时已选平台？"}
  M -- "否" --> N["拦截：当前会员未开通该平台，引导购买/变更"]
  M -- "是" --> H
  J --> O["前台：选择会员和可使用平台，平台数不能超过会员配置"]
  L --> O
  N --> O
  O --> P["前台：提交订单并完成支付"]
  P --> Q["后台：订单管理记录会员版本、周期、可使用平台数、本次选择平台"]
  Q --> R["后台：写入会员有效期、可使用平台数和已选平台"]
  R --> S{"按已选平台发放连接器授权是否成功？"}
  S -- "成功" --> T["前台刷新会员和已选平台，继续登录/取数"]
  S -- "失败" --> U["后台订单展示发放失败原因，支持人工重试发放"]
`;
  const backendFlow = `
flowchart TD
  A["进入后台资源管理"] --> B["选择生态：默认钉钉"]
  B --> C{"资源管理 Tab"}
  C -- "会员配置" --> D["维护会员名称、上架状态、每日取数上限、并发任务数、可使用平台数"]
  D --> E["维护月/季/年售卖周期、原价、折扣和售价"]
  C -- "平台配置" --> F["维护平台 Logo、平台名称、APPID、关联连接器、上架状态、前台展示文案"]
  F --> G["平台配置不维护最低可用会员档位，也不指定会员关联平台"]
  B --> H["配置新租户试用期：只影响试用资格判断"]
  E --> I["前台订阅计划读取会员配置"]
  G --> J["前台数据源列表读取上架平台和展示文案"]
  H --> K["前台权益校验读取试用期"]
  I --> L["订单管理：接收前台支付订单"]
  J --> L
  L --> M["记录订单号、租户、会员版本、售卖周期、可使用平台数、本次开通平台、支付状态"]
  M --> N{"支付是否成功？"}
  N -- "否" --> O["保留支付失败订单，不发放权益"]
  N -- "是" --> P["写入会员有效期、可使用平台数和用户已选平台"]
  P --> Q{"连接器授权发放是否成功？"}
  Q -- "成功" --> R["订单状态：发放成功"]
  Q -- "失败" --> S["订单状态：发放失败，展示失败原因和重试入口"]
  S --> T["运营点击重试发放"]
  T --> Q
  R --> U["租户管理展示会员状态、版本、有效期、可使用平台数、已选平台、连接器授权范围和订单来源"]
`;
  const frontendFlow = `
flowchart TD
  A["打开钉钉 AI 表格数据源入口"] --> B["数据连接中心弹窗"]
  B --> C["选择淘宝生意参谋并进入详情"]
  C --> D{"是否已完成数据源授权？"}
  D -- "否" --> E["授权确认弹窗"]
  E --> F["进入生意参谋同步配置"]
  D -- "是" --> F
  F --> G["选择数据源、设置账号、设置参数"]
  G --> H{"点击登录校验"}
  G --> I{"点击开始获取"}
  H --> J["执行权益校验"]
  I --> J
  J --> K{"有效试用期内，且当前平台在试用平台内？"}
  K -- "是" --> L["允许登录校验或启动取数"]
  K -- "否" --> M{"是否有有效会员？"}
  M -- "否" --> N["弹窗拦截：试用期已到期/暂无有效会员"]
  M -- "是" --> O{"会员是否到期？"}
  O -- "是" --> P["弹窗拦截：会员已到期"]
  O -- "否" --> Q{"当前平台是否为购买时已选平台？"}
  Q -- "否" --> R["弹窗拦截：当前会员未开通生意参谋"]
  Q -- "是" --> L
  N --> S["进入订阅计划"]
  P --> S
  R --> S
  S --> T["默认选中推荐会员和当前平台"]
  T --> U["用户可按可使用平台数调整平台选择"]
  U --> V["扫码支付"]
  V --> W{"支付结果"}
  W -- "失败/取消" --> S
  W -- "成功" --> X["刷新会员状态和已选平台"]
  X --> F
  L --> Y{"登录校验是否通过？"}
  Y -- "否" --> Z["展示账号/验证码错误并保留配置草稿"]
  Y -- "是" --> AA["填写参数并开始获取"]
  AA --> AB{"取数是否成功？"}
  AB -- "成功" --> AC["数据获取成功，可前往数据表查看"]
  AB -- "失败" --> AD["数据获取失败，展示失败原因并允许重试"]
`;

  return (
    <div className="prd-page">
      <Title className="prd-title" level={2}>
        店小宝商业化改版 PRD
      </Title>
      <div className="prd-layout">
        <section className="prd-info-panel">
          <PrdSection title="版本信息">
            {renderTable([
              ["字段", "内容"],
              ["需求名称", "店小宝商业化改版"],
              ["版本", "V1.0"],
              ["范围", "钉钉生态下的后台商业化配置、前台会员购买、钉钉数据源商业化与用户体验改版"],
              ["页面", "后台：资源管理、租户管理、订单管理；前台：钉钉数据源入口、数据连接中心、生意参谋同步配置、订阅计划、支付结果"],
            ])}
          </PrdSection>
          <PrdSection title="变更日志">
            {renderTable([
              ["版本", "变更内容"],
              ["V1.0", "新增后台会员配置、平台配置、订单追踪、租户权益展示；改版现有钉钉数据源插件的购买、平台选择、权益校验和取数结果链路。"],
            ])}
          </PrdSection>
          <PrdSection title="文档说明">
            {renderTable([
              ["名词", "说明"],
              ["会员", "前台唯一售卖主体，定义取数上限、并发任务数、可使用平台数和售卖周期。"],
              ["可使用平台数", "用户购买会员时最多可选择的平台数量，不是运行时剩余额度。"],
              ["已选平台", "用户购买会员时实际选择的平台列表，决定后续哪些平台可登录和取数。"],
              ["平台配置", "后台维护数据源平台展示和连接器关系，不维护最低可用会员档位。"],
            ])}
          </PrdSection>
          <PrdSection title="需求背景">
            <p className="prd-one-line">
              钉钉 AI 表格给店小宝提供数据源入口，但试用、会员购买、平台可用范围和权益发放缺少统一配置与追踪，本期需要把后台配置、前台购买和取数校验闭环。
            </p>
          </PrdSection>
          <PrdSection title="目标">
            <p className="prd-one-line">
              建立会员售卖为主体、平台由用户购买时选择、取数动作按试用和会员权益拦截的商业化链路，并让后台可配置、可追踪、可补偿。
            </p>
          </PrdSection>
          <PrdSection title="用户故事">
            {renderTable([
              ["角色", "用户故事"],
              ["运营", "我需要在后台配置会员、价格、试用期和平台展示，让前台能按配置售卖并发放权益。"],
              ["用户", "我需要在钉钉数据源使用过程中知道当前是否可用，不可用时能直接购买会员并选择要使用的平台。"],
              ["运营", "我需要在订单和租户里看到支付结果、已选平台和权益发放结果，失败时可以重试发放。"],
            ])}
          </PrdSection>
          <PrdSection title="需求范围">
            {renderScopeTreeTable([
              {
                module: "后台商业化配置",
                side: "后台",
                product: "店小宝",
                priority: "P0",
                children: [
                  {
                    item: "资源管理 / 会员配置",
                    changeType: "新增",
                    feature: "维护会员名称、上架状态、每日取数上限、并发任务数、可使用平台数、售卖周期、原价、折扣和售价。",
                  },
                  {
                    item: "资源管理 / 平台配置",
                    changeType: "新增",
                    feature: "维护平台 Logo、平台名称、APPID、关联连接器、上架状态和前台展示文案；不配置最低可用会员档位。",
                  },
                  {
                    item: "资源管理 / 新租户试用期",
                    changeType: "新增",
                    feature: "按生态配置试用天数，作为前台试用资格和试用到期判断来源。",
                  },
                ],
              },
              {
                module: "后台订单与租户追踪",
                side: "后台",
                product: "店小宝",
                priority: "P0",
                children: [
                  {
                    item: "订单管理 / 商业化订单",
                    changeType: "新增",
                    feature: "记录会员订单、售卖周期、可使用平台数、本次开通平台、支付状态、权益发放状态、失败原因和重试记录。",
                  },
                  {
                    item: "租户管理 / 商业化权益",
                    changeType: "优化",
                    feature: "在租户授权主表和详情中展示会员状态、会员版本、有效期、可使用平台数、已选平台、连接器授权范围和订单来源。",
                  },
                ],
              },
              {
                module: "前台钉钉数据源商业化与体验改版",
                side: "前台",
                product: "店小宝",
                priority: "P0",
                children: [
                  {
                    item: "钉钉数据源入口 / 弹窗链路",
                    changeType: "改版",
                    feature: "沿用现有钉钉数据源插件入口，将数据连接中心、数据源详情、授权确认、同步配置、登录校验、任务执行和结果态统一收进弹窗链路。",
                  },
                  {
                    item: "订阅计划 / 会员购买",
                    changeType: "改版",
                    feature: "用户购买会员时按会员的可使用平台数选择平台，支付成功后写入会员有效期、可使用平台数和已选平台。",
                  },
                  {
                    item: "同步配置 / 权益校验",
                    changeType: "改版",
                    feature: "登录校验和开始获取时按有效试用期、有效会员、会员到期、当前平台是否已选的顺序拦截。",
                  },
                ],
              },
            ])}
          </PrdSection>
          <PrdSection title="本期不做">
            {renderTable([
              ["事项", "说明"],
              ["平台单独售卖", "平台不是售卖 SKU，本期只卖会员，平台只在购买会员时由用户选择。"],
              ["平台最低可用会员档位", "平台配置不维护最低档位，也不决定哪个会员可用。"],
              ["运行时平台余量判断", "可使用平台数只在购买时限制选择数量，登录和取数时只判断当前平台是否已选。"],
              ["经营看板和完整操作日志", "本期保留后台菜单或标注，不纳入本次 PRD 验收范围。"],
            ])}
          </PrdSection>
          <PrdSection title="非功能需求">
            {renderTable([
              ["类型", "要求"],
              ["-", "-"],
            ])}
          </PrdSection>
          <PrdSection title="埋点">
            {renderTable([
              ["事件 ID", "触发时机", "关键属性"],
              ["dxb_datasource_use", "用户在数据连接中心点击使用数据源", "platform、source、tenant_id、ecosystem"],
              ["dxb_datasource_login_check", "用户点击登录校验", "platform、member_status、trial_status、gate_reason"],
              ["dxb_datasource_config_submit", "用户点击开始获取", "platform、dataset、member_status、selected_platforms"],
              ["dxb_order_submit", "用户提交会员订单", "member_level、cycle、platform_limit、selected_platforms、amount"],
              ["dxb_pay_result", "支付完成、失败或取消", "order_no、pay_status、grant_status、selected_platforms"],
              ["dxb_datasource_task_result", "取数任务成功或失败", "platform、dataset、result、failure_reason"],
            ])}
          </PrdSection>
        </section>
        <section className="prd-interaction-panel">
          <PrdSection title="用户场景与交互说明">
            {renderTable([
              ["模块", "规则说明"],
              [
                <button className="prd-rule-jump" type="button" onClick={() => onJump("resourceManagement")}>后台 / 资源管理</button>,
                "会员配置只维护会员名称、周期价格、取数上限、并发任务数和可使用平台数；平台配置只维护数据源展示、连接器和上架状态。平台配置不出现最低可用会员档位，也不和会员档位绑定。",
              ],
              [
                <button className="prd-rule-jump" type="button" onClick={() => onJump("orderManagement")}>后台 / 订单管理</button>,
                "前台支付成功后，订单写入会员版本、售卖周期、可使用平台数和用户本次选择的平台；后台再按已选平台发放连接器授权，失败时保留失败原因并支持重试。",
              ],
              [
                <button className="prd-rule-jump" type="button" onClick={() => onJump("tenantManagement")}>后台 / 租户管理</button>,
                "租户管理保留原授权主表，在商业化生态下增量展示会员状态、会员版本、有效期、可使用平台数、已选平台、连接器授权范围和订单来源。",
              ],
              [
                <button className="prd-rule-jump" type="button" onClick={() => onJump("dataSource")}>前台 / 数据源入口</button>,
                "无效会员不在进入页面时拦截，用户仍可查看数据连接中心、详情和已有配置；拦截点放在登录校验和开始获取两个动作上。",
              ],
              [
                <button className="prd-rule-jump" type="button" onClick={() => onJump("dataSource")}>前台 / 权益校验</button>,
                "动作触发后先判断是否存在有效试用期；试用无效再判断是否有有效会员、会员是否到期、当前平台是否为购买时已选平台。购买完成后不再判断平台数量是否还有余量。",
              ],
              [
                <button className="prd-rule-jump" type="button" onClick={() => onJump("dataSource")}>前台 / 会员购买</button>,
                "购买页默认选中推荐会员和当前触发购买的平台；用户可在可使用平台数范围内调整平台选择，支付成功后刷新会员状态和已选平台。",
              ],
            ], "prd-rule-table")}
          </PrdSection>
          <PrdSection title="用户操作流程">
            <ol className="prd-flow">
              <li>运营在后台资源管理配置会员、平台和新租户试用期。</li>
              <li>用户在前台进入数据连接中心，选择生意参谋并完成授权。</li>
              <li>用户点击登录校验或开始获取时，系统按试用期、会员、到期、已选平台顺序判断。</li>
              <li>未通过时进入购买或续费；用户按会员可使用平台数选择平台并支付。</li>
              <li>支付成功后后台写入权益并按已选平台发放连接器授权，前台刷新后继续登录和取数。</li>
            </ol>
          </PrdSection>
          <PrdSection title="流程图（Mermaid）">
            <MermaidChart title="1. 前后台整体流程" chart={overallFlow} />
            <MermaidChart title="2. 后台流程" chart={backendFlow} />
            <MermaidChart title="3. 前台流程" chart={frontendFlow} />
          </PrdSection>
        </section>
      </div>
    </div>
  );
}

function BackendPlatformTypePage() {
  const columns: ColumnsType<PlatformTypeRow> = [
    { title: "平台类型", dataIndex: "name", width: 160 },
    {
      title: "图标",
      dataIndex: "iconText",
      width: 110,
      render: (value: string, row) => <span className={`platform-logo ${row.iconClass}`}>{value}</span>,
    },
    {
      title: (
        <span className="table-title-with-marker">
          平台包配置
          <InteractionMarker noteId="productConfig" className="label-marker" />
        </span>
      ),
      dataIndex: "platformPackage",
      render: (value: string, row) => (
        <Space direction="vertical" size={0}>
          <Text strong>{value}</Text>
          <Text type="secondary">
            试用期 {row.trial}
            <InteractionMarker noteId="trialConfig" className="inline-mini-marker" />
          </Text>
        </Space>
      ),
    },
    {
      title: (
        <span className="table-title-with-marker">
          设备包配置
          <InteractionMarker noteId="deviceConfig" className="label-marker" />
        </span>
      ),
      dataIndex: "devicePackage",
      render: (value: string) => <Tag color="blue">云设备 {value}</Tag>,
    },
    {
      title: "前台状态",
      dataIndex: "status",
      width: 110,
      render: (value: PlatformTypeRow["status"]) => <Tag color={value === "已上架" ? "green" : "default"}>{value}</Tag>,
    },
    {
      title: "操作",
      width: 180,
      render: () => (
        <Space size={10}>
          <Button type="link" size="small">
            编辑
          </Button>
          <Button type="link" size="small" danger>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="backend-page backend-platform-page">
      <div className="backend-product-card">
        <div className="backend-product-tabs">
          {["电商取数宝", "跨境取数宝", "网银取数宝", "餐饮取数宝", "手机取数宝"].map((item, index) => (
            <button className={index === 0 ? "active" : ""} type="button" key={item}>
              {item}
            </button>
          ))}
        </div>
        <div className="backend-product-toolbar">
          <Input.Search className="backend-search" placeholder="请输入平台类型名称" allowClear />
          <Annotated noteId="productConfig">
            <Button className="backend-add-button" type="primary" icon={<PlusOutlined />}>
              新增平台类型
            </Button>
          </Annotated>
        </div>
        <Table
          className="backend-platform-table"
          size="small"
          rowKey="key"
          columns={columns}
          dataSource={platformTypeRows}
          pagination={false}
        />
      </div>
    </div>
  );
}

type PencilPlatformStatus = "可用" | "试用" | "未开通" | "即将到期";
type PencilPlatformTone = "ink" | "orange" | "blue" | "green" | "rose" | "pink";
type PencilNavKey = "platform" | "shop" | "task" | "help";
type PencilNavIconName = PencilNavKey;

const authorizedOrganization = {
  name: "森森的店铺空间",
  initial: "S",
  avatarTone: "lime",
};

const pencilPlatformCards: Array<{
  key: string;
  name: string;
  status: PencilPlatformStatus;
  logoFallback: string;
  logoUrl: string;
  connectorCount: number;
  tone: PencilPlatformTone;
}> = [
  {
    key: "alimama",
    name: "阿里妈妈",
    status: "即将到期",
    logoFallback: "阿",
    logoUrl: "https://www.alimama.com/favicon.ico",
    connectorCount: 8,
    tone: "orange",
  },
  {
    key: "qianniu",
    name: "千牛",
    status: "试用",
    logoFallback: "千",
    logoUrl: "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/f5/d4/80/f5d4806c-76ad-fa85-634b-97c2f30d3345/Icon.png/120x120bb.png",
    connectorCount: 12,
    tone: "orange",
  },
  { key: "sycm", name: "生意参谋", status: "未开通", logoFallback: "生", logoUrl: "https://www.taobao.com/favicon.ico", connectorCount: 6, tone: "orange" },
  { key: "customer", name: "客户之声", status: "可用", logoFallback: "客", logoUrl: "https://www.tmall.com/favicon.ico", connectorCount: 5, tone: "green" },
  {
    key: "jd",
    name: "京东",
    status: "即将到期",
    logoFallback: "京",
    logoUrl: "https://www.jd.com/favicon.ico",
    connectorCount: 10,
    tone: "rose",
  },
  {
    key: "douyin",
    name: "抖系",
    status: "未开通",
    logoFallback: "抖",
    logoUrl: "https://www.douyin.com/favicon.ico",
    connectorCount: 15,
    tone: "ink",
  },
  { key: "vip", name: "唯品会", status: "可用", logoFallback: "唯", logoUrl: "https://www.vip.com/favicon.ico", connectorCount: 7, tone: "pink" },
  { key: "jst", name: "聚水潭", status: "未开通", logoFallback: "聚", logoUrl: "https://www.jushuitan.com/favicon.ico", connectorCount: 9, tone: "blue" },
];

function getPencilStatusClass(status: PencilPlatformStatus) {
  if (status === "即将到期") return "is-expiring";
  if (status === "未开通") return "is-unowned";
  return "is-unowned";
}

function getPencilStatusLabel(status: PencilPlatformStatus) {
  if (status === "即将到期") return "即将到期";
  if (status === "未开通") return "未开通";
  return null;
}

function StreamlineNavIcon({ name }: { name: PencilNavIconName }) {
  const props = {
    "aria-hidden": true,
    className: "dxb-rail-svg",
    fill: "none",
    focusable: false,
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    viewBox: "0 0 24 24",
  } as const;

  if (name === "platform") {
    return (
      <svg {...props}>
        <rect height="5" rx="1.5" width="5" x="5" y="5" />
        <rect height="5" rx="1.5" width="5" x="14" y="5" />
        <rect height="5" rx="1.5" width="5" x="5" y="14" />
        <rect height="5" rx="1.5" width="5" x="14" y="14" />
      </svg>
    );
  }

  if (name === "shop") {
    return (
      <svg {...props}>
        <path d="M5.5 10.5h13L17.2 6H6.8L5.5 10.5Z" />
        <path d="M7 10.5v7.5h10v-7.5" />
        <path d="M9.5 18v-4h5v4" />
        <path d="M5.5 10.5c.6 1.4 2.6 1.4 3.2 0 .6 1.4 2.6 1.4 3.2 0 .6 1.4 2.6 1.4 3.2 0 .6 1.4 2.6 1.4 3.2 0" />
      </svg>
    );
  }

  if (name === "task") {
    return (
      <svg {...props}>
        <path d="M8 7h10" />
        <path d="M8 12h10" />
        <path d="M8 17h6" />
        <path d="m4.5 7 1 1 1.8-2" />
        <path d="m4.5 12 1 1 1.8-2" />
        <path d="M5.5 17h.1" />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <circle cx="12" cy="12" r="7" />
      <path d="M9.8 9.6a2.2 2.2 0 0 1 4.2.9c0 1.8-2 1.9-2 3.2" />
      <path d="M12 16.8h.1" />
    </svg>
  );
}

function PencilPluginNav({
  active,
  onChange,
  onToggleSettings,
  settingsOpen,
}: {
  active: PencilNavKey;
  onChange: (key: PencilNavKey) => void;
  onToggleSettings: () => void;
  settingsOpen: boolean;
}) {
  const mainItems = [
    { key: "platform", label: "平台", icon: "platform" },
    { key: "shop", label: "店铺", icon: "shop" },
    { key: "task", label: "任务", icon: "task" },
  ] as const;

  return (
    <aside className="pencil-plugin-nav dxb-plugin-rail">
      <div className="dxb-rail-main">
        {mainItems.map((item) => (
          <UiButton
            aria-label={item.label}
            className={`dxb-rail-button${active === item.key ? " is-active" : ""}`}
            key={item.key}
            onClick={() => onChange(item.key)}
            variant="ghost"
          >
            <span className="dxb-rail-icon">
              <StreamlineNavIcon name={item.icon} />
            </span>
            <span className="dxb-rail-label">{item.label}</span>
          </UiButton>
        ))}
      </div>

      <div className="dxb-rail-bottom">
        <UiButton
          aria-label="帮助"
          className={`dxb-rail-button${active === "help" ? " is-active" : ""}`}
          onClick={() => onChange("help")}
          variant="ghost"
        >
          <span className="dxb-rail-icon">
            <StreamlineNavIcon name="help" />
          </span>
          <span className="dxb-rail-label">帮助</span>
        </UiButton>
        <UiButton
          aria-label="设置"
          className={`dxb-rail-avatar-button${settingsOpen ? " is-active" : ""}`}
          onClick={onToggleSettings}
          variant="ghost"
        >
          <UiAvatar className={`dxb-rail-avatar tone-${authorizedOrganization.avatarTone}`}>
            <AvatarFallback>{authorizedOrganization.initial}</AvatarFallback>
          </UiAvatar>
        </UiButton>
        {settingsOpen && (
          <div className="dxb-settings-menu" role="dialog" aria-label="设置">
            <div className="dxb-settings-profile">
              <UiAvatar className={`dxb-settings-avatar tone-${authorizedOrganization.avatarTone}`}>
                <AvatarFallback>{authorizedOrganization.initial}</AvatarFallback>
              </UiAvatar>
              <div>
                <strong>{authorizedOrganization.name}</strong>
              </div>
            </div>
            <div className="dxb-membership-card" aria-label="服务状态">
              <div className="dxb-membership-copy">
                <span>服务状态</span>
                <strong>平台与设备可用</strong>
              </div>
              <div className="dxb-membership-metrics">
                <span>
                  <em>3</em>
                  平台
                </span>
                <span>
                  <em>3天</em>
                  设备
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

function DxbPlatformView() {
  return (
    <main className="dxb-plugin-main dxb-platform-page">
      <header className="pencil-plugin-head dxb-plugin-head dxb-platform-hero">
        <h2>你好👋，我是你的店铺运营助理</h2>
        <p>我可以胜任多平台、多店铺全量数据取数工作哦～</p>
      </header>

      <UiAlert className="pencil-expire-alert dxb-expire-alert" variant="destructive">
        <div className="dxb-expire-row">
          <span className="dxb-expire-dot" aria-hidden />
          <span className="dxb-expire-title">设备包剩余 3 天，到期后将无法执行取数任务</span>
          <UiButton className="dxb-renew-button" size="xs" variant="ghost">
            续费
          </UiButton>
        </div>
      </UiAlert>

      <section className="dxb-platform-panel" aria-labelledby="dxb-platform-panel-title">
        <div className="dxb-platform-panel-head">
          <h3 id="dxb-platform-panel-title">选择你需要的平台</h3>
        </div>
        <div className="pencil-platform-grid dxb-platform-grid" aria-label="可选取数平台">
          {pencilPlatformCards.map((item) => (
            <PencilPlatformCard item={item} key={item.key} />
          ))}
        </div>
      </section>
    </main>
  );
}

function DxbShopView() {
  type DxbShopAccountStatus = "正常" | "异常";

  type DxbShopAccount = {
    key: string;
    email: string;
    shops: string;
    status: DxbShopAccountStatus;
  };

  type DxbShopAccountGroup = {
    key: string;
    name: string;
    tone: PencilPlatformTone;
    logoFallback: string;
    logoUrl: string;
    accounts: Array<DxbShopAccount>;
  };

  type DxbShopFlow =
    | {
        step: "add";
        group: DxbShopAccountGroup;
      }
    | {
        step: "verify";
        group: DxbShopAccountGroup;
        account: string;
      }
    | null;

  const [shopFlow, setShopFlow] = useState<DxbShopFlow>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ groupName: string; account: DxbShopAccount } | null>(null);
  const [removedAccountKeys, setRemovedAccountKeys] = useState<Array<string>>([]);
  const [accountDraft, setAccountDraft] = useState("");
  const [passwordDraft, setPasswordDraft] = useState("demo1234");

  const accountGroups: Array<DxbShopAccountGroup> = [
    {
      key: "alimama",
      name: "阿里妈妈",
      tone: "orange",
      logoFallback: "阿",
      logoUrl: "https://www.alimama.com/favicon.ico",
      accounts: [
        { key: "alimama-zhang", email: "zhang@taobao.com", shops: "旗舰店A · 专营店B · 海外店C", status: "正常" },
        { key: "alimama-wang", email: "wang@taobao.com", shops: "折扣店D", status: "异常" },
      ],
    },
    {
      key: "sycm",
      name: "生意参谋",
      tone: "blue",
      logoFallback: "生",
      logoUrl: "https://www.taobao.com/favicon.ico",
      accounts: [
        { key: "sycm-main", email: "sycm@taobao.com", shops: "XX品牌旗舰店 · XX品牌专营店", status: "正常" },
      ],
    },
    {
      key: "qianniu",
      name: "千牛",
      tone: "orange",
      logoFallback: "千",
      logoUrl: "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/f5/d4/80/f5d4806c-76ad-fa85-634b-97c2f30d3345/Icon.png/120x120bb.png",
      accounts: [
        { key: "qianniu-zhang", email: "zhang@taobao.com", shops: "旗舰店A · 专营店B", status: "正常" },
      ],
    },
    {
      key: "jd",
      name: "京东",
      tone: "rose",
      logoFallback: "京",
      logoUrl: "https://www.jd.com/favicon.ico",
      accounts: [],
    },
  ];

  function openAddAccount(group: DxbShopAccountGroup) {
    setAccountDraft("");
    setPasswordDraft("demo1234");
    setShopFlow({ step: "add", group });
  }

  function closeShopFlow() {
    setShopFlow(null);
  }

  function beginAccountLogin() {
    if (!shopFlow || shopFlow.step !== "add") return;
    setShopFlow({
      step: "verify",
      group: shopFlow.group,
      account: accountDraft.trim() || "shop-owner@demo.com",
    });
  }

  function openDeleteAccount(groupName: string, account: DxbShopAccount) {
    setDeleteTarget({ groupName, account });
  }

  function confirmDeleteAccount() {
    if (!deleteTarget) return;
    setRemovedAccountKeys((keys) => (keys.includes(deleteTarget.account.key) ? keys : [...keys, deleteTarget.account.key]));
    setDeleteTarget(null);
  }

  return (
    <main className="dxb-plugin-main dxb-shop-page">
      <header className="dxb-shop-head">
        <h2>账号管理</h2>
      </header>

      <div className="dxb-shop-groups">
        {accountGroups.map((group) => {
          const visibleAccounts = group.accounts.filter((account) => !removedAccountKeys.includes(account.key));

          return (
            <section className={`dxb-shop-account-card${visibleAccounts.length === 0 ? " is-empty" : ""}`} key={group.key}>
              <div className="dxb-shop-account-head">
                <UiAvatar className={`dxb-shop-platform-logo tone-${group.tone}`}>
                  <AvatarImage alt={group.name} src={group.logoUrl} />
                  <AvatarFallback>{group.logoFallback}</AvatarFallback>
                </UiAvatar>
                <strong>{group.name}</strong>
                <UiBadge className={`dxb-account-count${visibleAccounts.length === 0 ? " is-empty" : ""}`} variant="secondary">
                  {visibleAccounts.length > 0 ? `${visibleAccounts.length} 个账号` : "未配置"}
                </UiBadge>
                <UiButton className="dxb-account-add" size="sm" variant="outline" onClick={() => openAddAccount(group)}>
                  + 添加
                </UiButton>
              </div>

              {visibleAccounts.length > 0 && (
                <div className="dxb-shop-account-list">
                  {visibleAccounts.map((account) => (
                    <div className="dxb-shop-account-row" key={account.key}>
                      <span className="dxb-shop-user-icon" aria-hidden>
                        <UserRound />
                      </span>
                      <div className="dxb-shop-account-copy">
                        <span>{account.email}</span>
                        <p>{account.shops}</p>
                      </div>
                      <UiBadge className={`dxb-account-status ${account.status === "正常" ? "is-normal" : "is-error"}`} variant="secondary">
                        <span />
                        {account.status}
                      </UiBadge>
                      <button aria-label={`删除 ${account.email}`} className="dxb-account-delete" type="button" onClick={() => openDeleteAccount(group.name, account)}>
                        <Trash2 />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {shopFlow?.step === "add" && (
        <div className="dxb-shop-flow-layer" role="dialog" aria-modal="true" aria-label={`添加账号 - ${shopFlow.group.name}`}>
          <section className="dxb-shop-flow-card">
            <div className="dxb-shop-flow-header">
              <h3>添加账号 - {shopFlow.group.name}</h3>
              <button className="dxb-shop-flow-close" type="button" aria-label="关闭添加账号" onClick={closeShopFlow}>
                <XIcon aria-hidden />
              </button>
            </div>
            <form
              className="dxb-shop-form"
              onSubmit={(event) => {
                event.preventDefault();
                beginAccountLogin();
              }}
            >
              <label className="dxb-shop-field">
                <span>账号</span>
                <UiInput value={accountDraft} onChange={(event) => setAccountDraft(event.target.value)} placeholder="请输入账号" />
              </label>
              <label className="dxb-shop-field">
                <span>密码</span>
                <UiInput value={passwordDraft} onChange={(event) => setPasswordDraft(event.target.value)} type="password" />
              </label>
              <UiButton className="dxb-shop-login-button" type="submit">
                <LogIn aria-hidden />
                登录
              </UiButton>
            </form>
          </section>
        </div>
      )}

      {shopFlow?.step === "verify" && (
        <div className="dxb-shop-flow-layer" role="dialog" aria-modal="true" aria-label="登录与安全验证">
          <section className="dxb-shop-flow-card dxb-shop-verify-card">
            <div className="dxb-shop-flow-header">
              <h3>登录与安全验证</h3>
              <button className="dxb-shop-flow-close" type="button" aria-label="关闭登录验证" onClick={closeShopFlow}>
                <XIcon aria-hidden />
              </button>
            </div>
            <div className="dxb-verify-stage" aria-live="polite">
              <span className="dxb-live-badge">
                <span />
                LIVE
              </span>
              <div className="dxb-verify-center">
                <span className="dxb-verify-spinner" aria-hidden />
                <strong>正在自动执行账号登录</strong>
                <p>登录页正在无影云中实时执行</p>
              </div>
            </div>
            <div className="dxb-verify-info">
              <p>平台：{shopFlow.group.name}</p>
              <p>账号：{shopFlow.account}</p>
            </div>
          </section>
        </div>
      )}

      {deleteTarget && (
        <div className="dxb-shop-flow-layer dxb-shop-delete-layer" role="dialog" aria-modal="true" aria-label="删除账号">
          <section className="dxb-shop-flow-card dxb-shop-delete-card">
            <div className="dxb-shop-flow-header">
              <h3>删除账号</h3>
              <button className="dxb-shop-flow-close" type="button" aria-label="关闭删除确认" onClick={() => setDeleteTarget(null)}>
                <XIcon aria-hidden />
              </button>
            </div>
            <p className="dxb-delete-copy">
              确定删除 {deleteTarget.account.email} 吗？删除后，{deleteTarget.groupName} 下该账号的定时取数任务将停止。
            </p>
            <div className="dxb-delete-actions">
              <UiButton className="dxb-delete-cancel" size="sm" variant="outline" onClick={() => setDeleteTarget(null)}>
                取消
              </UiButton>
              <UiButton className="dxb-delete-confirm" size="sm" onClick={confirmDeleteAccount}>
                删除
              </UiButton>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function DxbTaskView() {
  const tasks = [
    { key: "running", title: "客户之声评价同步", status: "取数中", meta: "写回：当前表格 · 预计 2 分钟", tone: "blue" },
    { key: "done", title: "阿里妈妈推广日报", status: "已完成", meta: "写回：推广数据视图 · 128 条记录", tone: "green" },
    { key: "failed", title: "千牛订单明细", status: "失败可重试", meta: "原因：账号登录过期 · 需重新授权", tone: "orange" },
  ];

  return (
    <main className="dxb-plugin-main dxb-simple-page">
      <header className="dxb-simple-head">
        <h2>任务</h2>
        <p>查看取数执行、写回位置和失败重试。</p>
      </header>
      <div className="dxb-card-list">
        {tasks.map((task) => (
          <UiCard className="dxb-info-card" key={task.key}>
            <UiCardHeader className="dxb-info-card-head">
              <span className={`dxb-task-dot tone-${task.tone}`} />
              <div className="dxb-info-card-title">
                <UiCardTitle>{task.title}</UiCardTitle>
                <span>{task.meta}</span>
              </div>
              <UiBadge className={`dxb-status-badge ${task.tone === "green" ? "is-owned" : task.tone === "orange" ? "is-trial" : "is-device"}`} variant="secondary">
                {task.status}
              </UiBadge>
            </UiCardHeader>
          </UiCard>
        ))}
      </div>
      <UiButton className="dxb-secondary-action" variant="outline">查看全部任务</UiButton>
    </main>
  );
}

function DxbHelpView() {
  return (
    <main className="dxb-plugin-main dxb-simple-page">
      <header className="dxb-simple-head">
        <h2>帮助</h2>
        <p>取数、授权和写回遇到问题时从这里处理。</p>
      </header>
      <div className="dxb-help-grid">
        {[
          ["使用指南", "了解平台授权、取数范围和写回规则"],
          ["联系客服", "设备到期、支付失败或授权异常可联系支持"],
          ["常见问题", "查看登录过期、写回失败、重复取数处理方式"],
        ].map(([title, desc]) => (
          <UiCard className="dxb-help-card" key={title}>
            <UiCardHeader>
              <UiCardTitle>{title}</UiCardTitle>
            </UiCardHeader>
            <UiCardContent>{desc}</UiCardContent>
          </UiCard>
        ))}
      </div>
    </main>
  );
}

function DxbPluginView({ activeNav }: { activeNav: PencilNavKey }) {
  if (activeNav === "shop") return <DxbShopView />;
  if (activeNav === "task") return <DxbTaskView />;
  if (activeNav === "help") return <DxbHelpView />;
  return <DxbPlatformView />;
}

function PencilPlatformCard({ item }: { item: (typeof pencilPlatformCards)[number] }) {
  const statusLabel = getPencilStatusLabel(item.status);

  return (
    <button
      aria-label={`${item.name}，${item.connectorCount} 个数据源${statusLabel ? `，${statusLabel}` : ""}`}
      className={`pencil-platform-entry dxb-platform-entry tone-${item.tone}`}
      type="button"
    >
      <UiAvatar className="dxb-platform-icon">
        <AvatarFallback>
          {item.logoFallback}
        </AvatarFallback>
      </UiAvatar>
      <span className="dxb-platform-copy">
        <span className="dxb-platform-name">{item.name}</span>
        <span className="dxb-platform-meta">{item.connectorCount} 个数据源</span>
      </span>
      {statusLabel && (
        <span className={`dxb-platform-state ${getPencilStatusClass(item.status)}`} title={statusLabel}>
          <span aria-hidden />
          {statusLabel}
        </span>
      )}
    </button>
  );
}

function PluginSidebar({ active }: { active: "home" | "data" | "buy" }) {
  const items = [
    { key: "home", icon: <TableOutlined />, label: "首页" },
    { key: "data", icon: <DatabaseOutlined />, label: "数据" },
    { key: "buy", icon: <AppstoreOutlined />, label: "应用" },
  ] as const;

  return (
    <aside className="plugin-sidebar">
      <div className="plugin-logo">D</div>
      <span className="plugin-nav-divider" />
      {items.map((item) => (
        <Button
          aria-label={item.label}
          className={`plugin-nav-button${active === item.key ? " active" : ""}`}
          icon={item.icon}
          key={item.key}
          shape="circle"
          type="text"
        />
      ))}
    </aside>
  );
}

function FrontendFrame({ active, children, className = "" }: { active: "home" | "data" | "buy"; children: ReactNode; className?: string }) {
  return (
    <div className="frontend-stage">
      <div className={`plugin-canvas ${className}`}>
        <PluginSidebar active={active} />
        <main className="plugin-main">{children}</main>
      </div>
    </div>
  );
}

type PluginPanelState = "closed" | "store" | "detail";

const nativePluginItems: Array<{
  key: string;
  name: string;
  description: string;
  icon?: LucideIcon;
  tone?: PencilPlatformTone;
  isDxb?: boolean;
}> = [
  { key: "delete-duplicate", name: "删除重复记录", description: "查找并删除重复记录，支持灵活规则配置", icon: Grid2X2, tone: "pink" },
  { key: "batch-upload", name: "批量上传附件", description: "批量上传附件至新记录或现有记录", icon: Package, tone: "green" },
  { key: "find-table", name: "查找替换", description: "查找替换表格数据，高亮标记快速定位", icon: SearchIcon, tone: "blue" },
  { key: "csv-import", name: "CSV 文件导入", description: "导入 CSV 数据，智能解析并自动创建表格", icon: DatabaseIcon, tone: "green" },
  { key: "preview", name: "预览全能王", description: "预览文本、Markdown、HTML、JSON、图片等", icon: Sparkles, tone: "ink" },
  { key: "group-member", name: "群聊成员进表", description: "一键将自己管理的群成员导入到 AI 表格", icon: UserRound, tone: "blue" },
  { key: "contacts", name: "通讯录人员导入", description: "从钉钉通讯录导入人员信息到表格", icon: List, tone: "green" },
  { key: "school-contacts", name: "家校通讯录学生家长进表", description: "导入学校家校通讯录，自动生成学生、家长数据", icon: Box, tone: "orange" },
  { key: "dxb", name: "店小宝", description: "多平台、多店铺全量数据自动取数，支持定时同步。", isDxb: true, tone: "ink" },
  { key: "mark-duplicate", name: "标记重复项", description: "标记表格中的重复记录", icon: Grid2X2, tone: "blue" },
];

const lowFiRows = [
  { key: "1", title: "" },
  { key: "2", title: "" },
  { key: "3", title: "" },
];

function LowFiAiTableArea({
  entryMode = "plugin",
  pluginOpen,
  onOpenPlugin,
  onOpenDataSource,
  pluginPanel,
}: {
  entryMode?: "plugin" | "dataSource";
  pluginOpen: boolean;
  onOpenPlugin: () => void;
  onOpenDataSource?: () => void;
  pluginPanel?: ReactNode;
}) {
  const columns: ColumnsType<(typeof lowFiRows)[number]> = [
    {
      title: (
        <Space size={5}>
          <TableOutlined />
          标题
        </Space>
      ),
      dataIndex: "title",
      width: 268,
      render: () => <FileTextOutlined className="ai-table-file-icon" />,
    },
    {
      title: <Button aria-label="新增字段" icon={<PlusOutlined />} size="small" type="text" />,
      dataIndex: "extra",
      width: 46,
      render: () => null,
    },
  ];

  return (
    <main className="ai-table-main">
      <div className="ai-sheet-topbar">
        <Space size={8}>
          <Avatar className="ai-table-doc-icon" shape="square" size={24}>
            S
          </Avatar>
          <Text strong>无标题 AI 表格(1)</Text>
          <StarOutlined className="ai-muted-icon" />
        </Space>
        <Segmented
          className="ai-top-tabs"
          options={["数据", "自动化", "应用", "表单"]}
          size="small"
          value="数据"
        />
        <Space className="ai-top-actions" size={8}>
          <Text className="ai-last-edit">上次编辑：今天 18:08</Text>
          <Button size="small" type="primary">分享</Button>
          <Button size="small">高级权限</Button>
          <MoreOutlined className="ai-muted-icon" />
          {entryMode === "plugin" && !pluginOpen && (
            <>
              <span className="ai-top-action-divider" />
              <Button
                className="ai-plugin-entry"
                icon={<AppstoreOutlined />}
                onClick={onOpenPlugin}
                size="small"
                type="text"
              >
                插件
              </Button>
            </>
          )}
        </Space>
      </div>
      <Layout className="ai-sheet-body">
        <aside className="ai-sheet-sider">
          <div className="ai-side-section-head">
            <Text strong>数据</Text>
            <Space size={8}>
              <SearchOutlined />
              <PlusOutlined />
            </Space>
          </div>
          <Button block className="ai-side-selected" size="small" type="text">数据表</Button>
          <Button block size="small" type="text">仪表盘</Button>
          <div className="ai-side-bottom">
            <Text type="secondary">添加/导入</Text>
            {entryMode === "dataSource" && onOpenDataSource && (
              <Button
                block
                className="ai-data-source-entry"
                icon={<DatabaseOutlined />}
                onClick={onOpenDataSource}
                size="small"
                type="text"
              >
                数据源
              </Button>
            )}
            {["导入 Excel", "数据表", "收集表", "仪表盘", "说明文档", "文件夹"].map((item) => (
              <Button block key={item} size="small" type="text">
                {item}
              </Button>
            ))}
          </div>
        </aside>
        <section className="ai-sheet-content">
          <div className="ai-view-tabs">
            <Button size="small" type="text">
              表格
            </Button>
            <Button size="small" type="text">
              添加视图
            </Button>
          </div>
          <div className="ai-toolbar">
            <Space size={2}>
              {["添加记录", "字段管理", "筛选", "分组", "排序", "行高", "填色"].map((item) => (
                <Button key={item} size="small" type="text">
                  {item}
                </Button>
              ))}
            </Space>
            <Space size={2}>
              <Button icon={<ReloadOutlined />} size="small" type="text" />
              <Button icon={<SearchOutlined />} size="small" type="text" />
              <Button icon={<SettingOutlined />} size="small" type="text" />
              <Button size="small">分享视图</Button>
            </Space>
          </div>
          <div className="ai-table-card">
            <Table
              className="ai-grid-table"
              columns={columns}
              dataSource={lowFiRows}
              pagination={false}
              rowKey="key"
              rowSelection={{ columnWidth: 34 }}
              scroll={{ x: 314 }}
              showHeader
              size="small"
            />
          </div>
          <div className="ai-sheet-empty-hint">粘贴文本或图片<br />内容秒变表格</div>
        </section>
        {pluginPanel}
      </Layout>
    </main>
  );
}

function NativePluginAvatar({ item }: { item: (typeof nativePluginItems)[number] }) {
  if (item.isDxb) {
    return (
      <span className="native-plugin-avatar dxb dxb-logo-image" aria-hidden>
        <img alt="店小宝" src={dxbLogoUrl} />
      </span>
    );
  }

  const Icon = item.icon ?? Grid2X2;

  return (
    <UiAvatar className={`native-plugin-avatar tone-${item.tone ?? "ink"}`}>
      <AvatarFallback>
        <Icon aria-hidden />
      </AvatarFallback>
    </UiAvatar>
  );
}

function PluginStorePanel({ onClose, onOpenDetail }: { onClose: () => void; onOpenDetail: () => void }) {
  return (
    <aside className="native-plugin-panel shadcn-plugin-store">
      <UiTooltipProvider>
        <header className="native-plugin-header">
          <div className="native-plugin-title">
            <Grid2X2 aria-hidden />
            <strong>插件</strong>
            <UiTooltip>
              <UiTooltipTrigger asChild>
                <UiButton aria-label="插件说明" className="native-plugin-help-button" size="icon-xs" variant="ghost">
                  <CircleHelp aria-hidden data-icon="inline-start" />
                </UiButton>
              </UiTooltipTrigger>
              <UiTooltipContent>插件可扩展 AI 表格能力</UiTooltipContent>
            </UiTooltip>
          </div>
          <UiButton aria-label="关闭插件列表" onClick={onClose} size="icon-sm" variant="ghost">
            <XIcon aria-hidden data-icon="inline-start" />
          </UiButton>
        </header>
      </UiTooltipProvider>
      <div className="native-plugin-search">
        <SearchIcon aria-hidden />
        <UiInput placeholder="搜索插件" />
      </div>
      <UiScrollArea className="native-plugin-body">
        <div className="native-plugin-section-title">精选推荐</div>
        <div className="native-plugin-list">
          {nativePluginItems.map((item) => (
            <UiButton
              className={`native-plugin-list-button${item.isDxb ? " is-dxb" : ""}`}
              key={item.key}
              onClick={item.isDxb ? onOpenDetail : undefined}
              variant="ghost"
            >
              <span className="native-plugin-list-inner">
                <NativePluginAvatar item={item} />
                <span className="native-plugin-copy">
                  <strong className="native-plugin-name">{item.name}</strong>
                  <span className="native-plugin-desc">{item.description}</span>
                </span>
              </span>
            </UiButton>
          ))}
        </div>
      </UiScrollArea>
      <footer className="native-plugin-footer">
        <UiButton className="native-plugin-market" size="sm" variant="outline">
          <Grid2X2 aria-hidden data-icon="inline-start" />
          插件市场
        </UiButton>
        <UiButton aria-label="更多插件操作" size="icon-sm" variant="outline">
          <MoreVertical aria-hidden data-icon="inline-start" />
        </UiButton>
      </footer>
    </aside>
  );
}

function DingPluginHostHeader({
  logo,
  onBack,
  onClose,
  title,
}: {
  logo: string;
  onBack: () => void;
  onClose: () => void;
  title: string;
}) {
  return (
    <header className="dxb-plugin-host-header">
      <UiButton aria-label="返回插件列表" className="dxb-plugin-host-icon" onClick={onBack} size="icon-sm" variant="ghost">
        <ChevronLeft aria-hidden data-icon="inline-start" />
      </UiButton>
      <UiAvatar className="dxb-plugin-host-logo">
        <AvatarImage alt={title} src={logo} />
        <AvatarFallback>{title.slice(0, 1)}</AvatarFallback>
      </UiAvatar>
      <strong className="dxb-plugin-host-title">{title}</strong>
      <UiButton aria-label="更多插件操作" className="dxb-plugin-host-icon" size="icon-sm" variant="ghost">
        <MoreVertical aria-hidden data-icon="inline-start" />
      </UiButton>
      <UiButton aria-label="关闭插件" className="dxb-plugin-host-icon" onClick={onClose} size="icon-sm" variant="ghost">
        <XIcon aria-hidden data-icon="inline-start" />
      </UiButton>
    </header>
  );
}

function EcologyPluginPanel({ onBack, onClose }: { onBack: () => void; onClose: () => void }) {
  const [activeNav, setActiveNav] = useState<PencilNavKey>("platform");
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <aside className="ecosystem-plugin-panel dxb-shadcn-panel">
      <DingPluginHostHeader logo={dxbLogoUrl} onBack={onBack} onClose={onClose} title="店小宝" />
      <div className="dxb-plugin-shell-body">
        <UiTooltipProvider>
          <PencilPluginNav
            active={activeNav}
            onChange={(key) => {
              setActiveNav(key);
              setSettingsOpen(false);
            }}
            onToggleSettings={() => setSettingsOpen((open) => !open)}
            settingsOpen={settingsOpen}
          />
        </UiTooltipProvider>
        <UiScrollArea className="pencil-plugin-content dxb-plugin-content">
          <DxbPluginView activeNav={activeNav} />
        </UiScrollArea>
      </div>
    </aside>
  );
}

function PluginFrontendPage() {
  const [pluginPanelState, setPluginPanelState] = useState<PluginPanelState>("closed");
  const pluginOpen = pluginPanelState !== "closed";
  const pluginPanel =
    pluginPanelState === "store" ? (
      <PluginStorePanel onClose={() => setPluginPanelState("closed")} onOpenDetail={() => setPluginPanelState("detail")} />
    ) : pluginPanelState === "detail" ? (
      <EcologyPluginPanel onBack={() => setPluginPanelState("store")} onClose={() => setPluginPanelState("closed")} />
    ) : null;

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1677ff",
          colorInfo: "#1677ff",
          colorLink: "#1677ff",
          borderRadius: 6,
        },
      }}
    >
      <div className="ding-ai-table-mock">
        <LowFiAiTableArea pluginOpen={pluginOpen} onOpenPlugin={() => setPluginPanelState("store")} pluginPanel={pluginPanel} />
      </div>
    </ConfigProvider>
  );
}

type DataSourceFlowView =
  | "closed"
  | "connectionCenter"
  | "detail"
  | "auth"
  | "config"
  | "membershipGate"
  | "subscribe"
  | "paymentSuccess"
  | "loginChecking"
  | "captcha"
  | "running"
  | "runFailed"
  | "success";

type DataSourceConfigStep = "select" | "account" | "params";
type SourceDataScope = "all" | "custom";
type SourceAvailability = "available" | "unauthorized" | "notPurchased" | "down";
type CommerceMembershipGrantStatus = "none" | "active" | "expired" | "grantFailed";
type MembershipGateReason = "trialExpired" | "memberMissing" | "memberExpired" | "platformNotSelected" | "grantFailed";
type DataSourcePermissionAction = "login" | "run";
type DataSourcePermissionResult = {
  allowed: boolean;
  reason?: MembershipGateReason;
};
type DataSourceTrialEntitlement = {
  endAt?: string;
  platforms: string[];
  status: "none" | "active" | "expired";
};

type DataSourceConfigDraft = {
  selectedDataset: string;
  hasDateRange: boolean;
  dateRange: [Dayjs | null, Dayjs | null] | null;
  moreSettingsOpen: boolean;
  dataScope: SourceDataScope;
  shopAccount: string;
  shopPassword: string;
  selectedFields: string[];
  outputLocation: string;
  scheduled: boolean;
  scheduleCycle: string;
};

const defaultDataSourceConfigDraft: DataSourceConfigDraft = {
  selectedDataset: "rank",
  hasDateRange: false,
  dateRange: null,
  moreSettingsOpen: false,
  dataScope: "all",
  shopAccount: "",
  shopPassword: "",
  selectedFields: [],
  outputLocation: "当前数据表",
  scheduled: false,
  scheduleCycle: "日",
};

interface AiDataSourceCard {
  key: string;
  name: string;
  provider: string;
  category: string;
  description: string;
  logo: string;
  iconSrc?: string;
  tone: string;
  actionable?: boolean;
}

const dataSourceCategories: Array<{ label: string; icon: ReactNode; separated?: boolean }> = [
  { label: "全部数据源", icon: <HomeOutlined /> },
  { label: "最近使用", icon: <ContainerOutlined /> },
  { label: "销售管理", icon: <ShopOutlined /> },
  { label: "实用工具", icon: <TagOutlined /> },
  { label: "效率工具", icon: <LineChartOutlined /> },
  { label: "团队协作", icon: <UserOutlined /> },
  { label: "共享数据源", icon: <DatabaseOutlined />, separated: true },
  { label: "提交需求", icon: <EditOutlined /> },
];

const dataSourceIconUrls: Record<string, string> = {
  "ai-table": new URL("./assets/data-source-icons/ai-table.png", import.meta.url).href,
  oa: new URL("./assets/data-source-icons/oa.png", import.meta.url).href,
  contacts: new URL("./assets/data-source-icons/contacts.png", import.meta.url).href,
  school: new URL("./assets/data-source-icons/school.png", import.meta.url).href,
  attendance: new URL("./assets/data-source-icons/attendance.png", import.meta.url).href,
  "sycm-ding": new URL("./assets/data-source-icons/sycm-ding.png", import.meta.url).href,
  teambition: new URL("./assets/data-source-icons/teambition.png", import.meta.url).href,
  calendar: new URL("./assets/data-source-icons/calendar.png", import.meta.url).href,
  todo: new URL("./assets/data-source-icons/todo.png", import.meta.url).href,
  mysql: new URL("./assets/data-source-icons/mysql.png", import.meta.url).href,
  qingliu: new URL("./assets/data-source-icons/qingliu.png", import.meta.url).href,
  fx: new URL("./assets/data-source-icons/fx.png", import.meta.url).href,
  xiaolanben: new URL("./assets/data-source-icons/xiaolanben.png", import.meta.url).href,
  jindata: new URL("./assets/data-source-icons/jindata.png", import.meta.url).href,
  jiandao: new URL("./assets/data-source-icons/jiandao.png", import.meta.url).href,
  fund: new URL("./assets/data-source-icons/fund.png", import.meta.url).href,
  weather: new URL("./assets/data-source-icons/weather.png", import.meta.url).href,
  aqi: new URL("./assets/data-source-icons/aqi.png", import.meta.url).href,
  farm: new URL("./assets/data-source-icons/farm.png", import.meta.url).href,
  jd: new URL("./assets/data-source-icons/jd.png", import.meta.url).href,
  "douyin-shop": new URL("./assets/data-source-icons/douyin-shop.png", import.meta.url).href,
  almm: new URL("./assets/data-source-icons/almm.png", import.meta.url).href,
  doudian: new URL("./assets/data-source-icons/doudian.png", import.meta.url).href,
  "taobao-sycm": new URL("./assets/data-source-icons/taobao-sycm.png", import.meta.url).href,
  vip: new URL("./assets/data-source-icons/vip.png", import.meta.url).href,
  postgres: new URL("./assets/data-source-icons/postgres.png", import.meta.url).href,
  sqlserver: new URL("./assets/data-source-icons/sqlserver.png", import.meta.url).href,
};

const sourceAuthLogoImage = new URL("./assets/figma-source-detail/auth-tao-logo.png", import.meta.url).href;

const aiDataSourceCards: AiDataSourceCard[] = ([
  { key: "ai-table", name: "AI 表格", provider: "钉钉", category: "效率工具", description: "实现 AI 表格间的数据同步，支持定时同步更新", logo: "S", tone: "blue" },
  { key: "oa", name: "OA 审批", provider: "钉钉", category: "效率工具", description: "同步钉钉审批数据到 AI 表格，支持定时同步更新", logo: "审", tone: "orange" },
  { key: "contacts", name: "通讯录", provider: "钉钉", category: "团队协作", description: "同步通讯录数据到 AI 表格，支持定时或手动同步更新", logo: "通", tone: "green" },
  { key: "school", name: "家校通讯录", provider: "钉钉", category: "团队协作", description: "同步家校通讯录数据到 AI 表格，支持定时或手动同步更新", logo: "校", tone: "coral" },
  { key: "attendance", name: "考勤打卡", provider: "钉钉", category: "效率工具", description: "同步钉钉考勤打卡统计数据、打卡结果列表等数据到 AI 表格", logo: "勤", tone: "sky" },
  { key: "sycm-ding", name: "生意参谋", provider: "钉钉", category: "销售管理", description: "同步淘宝生意参谋数据到 AI 表格，支持定时同步更新", logo: "生", tone: "blue" },
  { key: "teambition", name: "Teambition", provider: "Teambition", category: "团队协作", description: "同步指定项目中任务标题、任务进度等数据到 AI 表格，支持定时同步更新", logo: "T", tone: "cyan" },
  { key: "calendar", name: "日程", provider: "钉钉", category: "效率工具", description: "同步钉钉日程数据至 AI 表格，支持定时同步更新", logo: "日", tone: "green" },
  { key: "todo", name: "待办", provider: "钉钉", category: "效率工具", description: "同步待办任务数据到 AI 表格，支持定时或手动同步更新", logo: "待", tone: "sky" },
  { key: "mysql", name: "MySQL", provider: "三只犀牛鸟科技", category: "实用工具", description: "将 MySQL 的数据内容同步到 AI 表格", logo: "My", tone: "plain" },
  { key: "qingliu", name: "轻流", provider: "钉钉", category: "效率工具", description: "同步工作区应用列表等数据到 AI 表格，支持定时同步最新的数据", logo: "Q", tone: "purple" },
  { key: "fx", name: "外汇牌价数据", provider: "钉钉", category: "实用工具", description: "同步十大银行外汇牌价数据等到 AI 表格，支持定时同步更新", logo: "$", tone: "slate" },
  { key: "xiaolanben", name: "小蓝本", provider: "钉钉", category: "实用工具", description: "同步企业关系等数据到 AI 表格，支持定时同步更新", logo: "蓝", tone: "blue" },
  { key: "jindata", name: "金数据", provider: "钉钉", category: "效率工具", description: "同步金数据表单列表等数据，支持定时同步更新", logo: "金", tone: "orange" },
  { key: "jiandao", name: "简道云", provider: "钉钉", category: "效率工具", description: "同步当前组织应用列表等数据，支持定时同步更新", logo: "简", tone: "plain" },
  { key: "fund", name: "基金历史净值数据", provider: "钉钉", category: "实用工具", description: "同步基金代码、累计净值、日涨幅等数据到 AI 表格，支持定时同步更新", logo: "基", tone: "gold" },
  { key: "weather", name: "天气预报", provider: "钉钉", category: "实用工具", description: "同步指定区域未来 24 小时天气、风力、风向等数据到 AI 表格，支持定时同步更新", logo: "天", tone: "purple" },
  { key: "aqi", name: "国控空气质量数据", provider: "钉钉", category: "实用工具", description: "同步指定时间的国控空气质量等数据到 AI 表格，支持定时同步更新", logo: "AQ", tone: "green" },
  { key: "farm", name: "农产品价格数据", provider: "钉钉", category: "实用工具", description: "同步指定地区农产品最新平均价格等行情数据到 AI 表格，支持定时同步更新", logo: "农", tone: "gold" },
  { key: "jd", name: "京东商智(品牌版)", provider: "实在智能", category: "销售管理", description: "一键同步京东商智(品牌版)数据", logo: "京", tone: "red" },
  { key: "douyin-shop", name: "抖店商家后台", provider: "实在智能", category: "销售管理", description: "一键同步抖店商家后台数据", logo: "抖", tone: "blue" },
  { key: "almm", name: "阿里妈妈", provider: "实在智能", category: "销售管理", description: "一键同步淘系阿里妈妈数据", logo: "阿", tone: "blue" },
  { key: "doudian", name: "电商罗盘", provider: "实在智能", category: "销售管理", description: "一键同步抖音电商罗盘数据", logo: "抖", tone: "black" },
  { key: "taobao-sycm", name: "淘系生意参谋", provider: "取数宝", category: "销售管理", description: "一键获取生意参谋运营、商品等数据到 AI 表格，支持定时同步更新", logo: "淘", tone: "tao", actionable: true },
  { key: "vip", name: "魔方罗盘", provider: "实在智能", category: "销售管理", description: "一键同步唯品会魔方罗盘数据", logo: "唯", tone: "pink" },
  { key: "postgres", name: "PostgreSQL", provider: "三只犀牛鸟科技", category: "实用工具", description: "连接客户 PostgreSQL 数据库，结合用户的配置将数据定时同步到 AI 表格", logo: "Pg", tone: "plain" },
  { key: "sqlserver", name: "SQLServer", provider: "三只犀牛鸟科技", category: "实用工具", description: "连接客户 SQLServer 数据库，结合用户的配置将数据定时同步到 AI 表格", logo: "SQ", tone: "plain" },
] as Omit<AiDataSourceCard, "iconSrc">[]).map((card) => ({ ...card, iconSrc: dataSourceIconUrls[card.key] }));

const sycmDatasetCards = [
  { key: "rank", title: "（新版）商品排行", description: "获取商品支付金额、退款额、支付件数等单品交易数据" },
  { key: "category", title: "品类 360 标准类目", description: "获取品类支付金额占比、退款额等品类维度交易数据" },
  { key: "operation", title: "运营视窗", description: "获取首页运营视窗整体数据如支付金额、访客数、支付转化率等核心数据" },
  { key: "traffic", title: "店铺流量来源", description: "获取店铺各流量渠道的来源构成及趋势数据" },
];

const sourceTrustLogos = [
  "中国电信",
  "中国移动",
  "中国联通",
  "中国建筑集团",
  "国家电网",
  "中国烟草",
  "东航物流",
  "中国种子",
  "华夏银行",
  "京东物流",
  "菜鸟",
  "中核集团",
  "吉利汽车",
  "杭州银行",
  "DONNER",
  "深圳宝安机场",
  "周黑鸭",
  "Johnson Controls",
  "妙洁",
  "纽源股份",
  "邮储银行",
  "青岛啤酒",
  "中国农业发展银行",
  "裕同科技",
];

const sycmPlans = [
  { key: "trial", days: "3 天", price: "1", originalPrice: "49", tag: "专属优惠，限首次" },
  { key: "week", days: "7 天", price: "159", originalPrice: "199" },
  { key: "month", days: "30 天", price: "159", originalPrice: "199" },
];

type CommerceMemberCycle = "月付" | "季付" | "年付";
type CommerceMembershipLevel = "free" | "normal" | "advanced" | "enterprise";
type CommercePaidMembershipLevel = Exclude<CommerceMembershipLevel, "free" | "enterprise">;
type CommercePendingAction = "run" | null;

type CommercePaymentSelection = {
  cycle: CommerceMemberCycle;
  level: CommercePaidMembershipLevel;
  planName: string;
  platforms: string[];
  price: number;
};

type CommerceMemberPlan = {
  key: CommercePaidMembershipLevel;
  level: CommercePaidMembershipLevel;
  displayName: string;
  listed: boolean;
  dailyLimit: string;
  concurrency: string;
  platformLimit: number;
  benefit: string;
  cycles: Record<CommerceMemberCycle, { originalPrice: number; discountPercent?: number; status?: "上架" | "下架" }>;
};

const commerceMemberCycles: CommerceMemberCycle[] = ["月付", "季付", "年付"];
const sourceScheduleTimeOptions = Array.from({ length: 24 }, (_, hour) => {
  const value = `${String(hour).padStart(2, "0")}:00`;
  return { value, label: value };
});
const sourceScheduleWeekOptions = ["每周一", "每周二", "每周三", "每周四", "每周五", "每周六", "每周日"].map((value) => ({
  value,
  label: value,
}));
const sourceScheduleMonthOptions = Array.from({ length: 31 }, (_, index) => {
  const value = `每月${index + 1}日`;
  return { value, label: value };
});

const commerceMembershipNameMap: Record<CommerceMembershipLevel, string> = {
  free: "免费版",
  normal: "普通会员",
  advanced: "高级会员",
  enterprise: "企业会员",
};

const commerceMembershipRank: Record<CommerceMembershipLevel, number> = {
  free: 0,
  normal: 1,
  advanced: 2,
  enterprise: 3,
};

const commerceMemberPlans: CommerceMemberPlan[] = [
  {
    key: "normal",
    level: "normal",
    displayName: "普通会员",
    listed: true,
    dailyLimit: "20",
    concurrency: "1",
    platformLimit: 1,
    benefit: "适合单平台轻量取数",
    cycles: {
      月付: { originalPrice: 199, discountPercent: 0, status: "上架" },
      季付: { originalPrice: 599, discountPercent: 0, status: "上架" },
      年付: { originalPrice: 1999, discountPercent: 0, status: "上架" },
    },
  },
  {
    key: "advanced",
    level: "advanced",
    displayName: "高级会员",
    listed: true,
    dailyLimit: "100",
    concurrency: "5",
    platformLimit: 5,
    benefit: "适合多店铺稳定取数",
    cycles: {
      月付: { originalPrice: 1299, discountPercent: 70, status: "上架" },
      季付: { originalPrice: 3899, discountPercent: 0, status: "上架" },
      年付: { originalPrice: 14999, discountPercent: 0, status: "上架" },
    },
  },
];

function getCommerceMembershipName(level: CommerceMembershipLevel) {
  return commerceMembershipNameMap[level];
}

function calculateCommerceCyclePrice(originalPrice: number, discountPercent = 0) {
  if (discountPercent > 0) return Math.round((originalPrice * discountPercent) / 100);
  return originalPrice;
}

function formatCommerceDiscount(discountPercent = 0) {
  if (discountPercent <= 0) return "";
  const value = discountPercent / 10;
  return Number.isInteger(value) ? `${value}折` : `${value.toFixed(1)}折`;
}

function formatCommerceCycleUnit(cycle: CommerceMemberCycle) {
  if (cycle === "月付") return "月";
  if (cycle === "季付") return "季";
  return "年";
}

function getCommerceCycleDiscountTag(cycle: CommerceMemberCycle) {
  const discountValues = commerceMemberPlans
    .map((plan) => plan.cycles[cycle]?.discountPercent || 0)
    .filter((value) => value > 0);
  if (!discountValues.length) return "";
  return `低至${formatCommerceDiscount(Math.min(...discountValues))}`;
}

function formatCommerceDailyLimit(value: string) {
  return `${value}/次`;
}

function formatCommerceConcurrency(value: string) {
  return `${value}/个`;
}

function formatCommercePlatformLimit(value: number) {
  return `${value}/个`;
}

function getCommerceMembershipEntitlement(level: CommerceMembershipLevel) {
  const plan = commerceMemberPlans.find((item) => item.level === level);
  if (!plan) {
    return {
      dailyLimit: "20",
      concurrency: "1",
      platformLimit: 1,
    };
  }
  return {
    dailyLimit: plan.dailyLimit,
    concurrency: plan.concurrency,
    platformLimit: plan.platformLimit,
  };
}

function getDatasetAvailability(datasetKey: string, baseStatus: SourceAvailability): SourceAvailability {
  if (datasetKey === "traffic") return "down";
  return baseStatus;
}

type SourcePlatformOptionItem = {
  label: string;
  logoText: string;
  logoUrl?: string;
  tone: "tao" | "blue" | "red" | "black" | "pink";
  value: string;
};

const sourcePlatformOptionItems: SourcePlatformOptionItem[] = [
  { value: "生意参谋", label: "生意参谋", logoText: "生", logoUrl: dataSourceIconUrls["taobao-sycm"], tone: "tao" },
  { value: "阿里妈妈", label: "阿里妈妈", logoText: "阿", logoUrl: dataSourceIconUrls.almm, tone: "blue" },
  { value: "京东商智", label: "京东商智", logoText: "京", logoUrl: dataSourceIconUrls.jd, tone: "red" },
  { value: "抖店罗盘", label: "抖店罗盘", logoText: "抖", logoUrl: dataSourceIconUrls.doudian, tone: "black" },
  { value: "小红书", label: "小红书", logoText: "书", tone: "pink" },
];

const currentSourcePlatform = "生意参谋";
const sourceCaptchaMockCode = "123";
const defaultDataSourceTrialEntitlement: DataSourceTrialEntitlement = {
  endAt: "2026-05-13",
  platforms: [currentSourcePlatform],
  status: "expired",
};

function formatTrialRemainingDays(trialEntitlement: DataSourceTrialEntitlement) {
  if (getTrialEntitlementStatus(trialEntitlement).expired) return "试用已到期";
  if (trialEntitlement.status === "none") return "-";
  if (!trialEntitlement.endAt) return "-";
  const remainingDays = Math.max(0, dayjs(trialEntitlement.endAt).endOf("day").diff(dayjs(), "day") + 1);
  return `${remainingDays}`;
}

function getTrialEntitlementStatus(trialEntitlement: DataSourceTrialEntitlement, platform?: string) {
  const expiredByDate = Boolean(trialEntitlement.endAt && dayjs(trialEntitlement.endAt).endOf("day").isBefore(dayjs()));
  const expired = trialEntitlement.status === "expired" || expiredByDate;
  const platformMatched = platform ? trialEntitlement.platforms.includes(platform) : true;
  const active = trialEntitlement.status === "active" && !expired && platformMatched;
  return { active, expired };
}

function MembershipBenefitList({ items }: { items: Array<{ label: string; value: string }> }) {
  return (
    <ul className="source-membership-benefits">
      {items.map((item) => (
        <li key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </li>
      ))}
    </ul>
  );
}

function getSourcePlatformOption(value: unknown) {
  return sourcePlatformOptionItems.find((item) => item.value === String(value));
}

function SourcePlatformSelectLabel({ item }: { item: SourcePlatformOptionItem }) {
  return (
    <span className="source-platform-select-option">
      <span className={`source-platform-select-logo tone-${item.tone}`} aria-hidden="true">
        {item.logoUrl ? <img alt="" src={item.logoUrl} /> : item.logoText}
      </span>
      <span className="source-platform-select-name">{item.label}</span>
    </span>
  );
}

function BowlingIcon() {
  return (
    <svg
      aria-hidden="true"
      className="source-membership-buy-icon"
      fill="none"
      height="24"
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0 0h24v24H0z" fill="none" stroke="none" />
      <path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
      <path d="M11 9l0 .01" />
      <path d="M15 8l0 .01" />
      <path d="M14 12l0 .01" />
    </svg>
  );
}

function RollingPriceDigit({
  active,
  current,
  direction,
  rolling,
  previous,
}: {
  active: boolean;
  current: string;
  direction: "down" | "up";
  rolling: boolean;
  previous?: string;
}) {
  const previousDigit = previous ?? "";
  const digits = !rolling
    ? [current]
    : current === previousDigit
      ? [current, current]
      : direction === "down" ? [current, previousDigit] : [previousDigit, current];
  const startOffset = direction === "down" && rolling ? -40 * (digits.length - 1) : 0;
  const endOffset = direction === "up" && rolling ? -40 * (digits.length - 1) : 0;
  const stackStyle = {
    "--price-roll-end": `${endOffset}px`,
    "--price-roll-start": `${startOffset}px`,
  } as CSSProperties;

  return (
    <span className={`source-price-digit-roll is-${direction}${rolling && active ? " is-active" : ""}`}>
      <span className="source-price-digit-stack" style={stackStyle}>
        {digits.map((digit, index) => (
          <span key={`${digit}-${index}`}>{digit}</span>
        ))}
      </span>
    </span>
  );
}

function AnimatedCommercePrice({ pulseKey, value }: { value: number; pulseKey?: string }) {
  const formattedValue = value.toLocaleString("zh-CN");
  const normalizedPulseKey = pulseKey || formattedValue;
  const [priceState, setPriceState] = useState({
    active: false,
    from: formattedValue,
    key: normalizedPulseKey,
    rolling: false,
    to: formattedValue,
  });
  const hasPendingChange = priceState.to !== formattedValue || priceState.key !== normalizedPulseKey;
  const renderFrom = hasPendingChange ? priceState.to : priceState.from;
  const renderTo = hasPendingChange ? formattedValue : priceState.to;
  const isRolling = hasPendingChange || priceState.rolling;
  const isActive = !hasPendingChange && priceState.active;

  useLayoutEffect(() => {
    let startTimer: number | undefined;
    let doneTimer: number | undefined;

    setPriceState((current) => {
      if (current.to === formattedValue && current.key === normalizedPulseKey) return current;

      const nextFrom = current.to;
      const nextKey = normalizedPulseKey;
      const nextTo = formattedValue;

      startTimer = window.setTimeout(() => {
        setPriceState((latest) => {
          if (latest.key !== nextKey || latest.to !== nextTo) return latest;
          return { ...latest, active: true };
        });
      }, 16);
      doneTimer = window.setTimeout(() => {
        setPriceState((latest) => {
          if (latest.key !== nextKey || latest.to !== nextTo) return latest;
          return { active: false, from: nextTo, key: nextKey, rolling: false, to: nextTo };
        });
      }, 520);

      return { active: false, from: nextFrom, key: nextKey, rolling: true, to: nextTo };
    });

    return () => {
      if (startTimer) window.clearTimeout(startTimer);
      if (doneTimer) window.clearTimeout(doneTimer);
    };
  }, [formattedValue, normalizedPulseKey]);

  const previousDigits = renderFrom.replace(/\D/g, "");
  const currentDigitTotal = renderTo.replace(/\D/g, "").length;
  let currentDigitIndex = 0;

  return (
    <strong className="source-membership-price-number">
      {renderTo.split("").map((char, index) => {
        if (!/\d/.test(char)) {
          return <span className="source-price-separator" key={`${char}-${index}`}>{char}</span>;
        }

        const digitIndexFromRight = currentDigitTotal - currentDigitIndex - 1;
        const previousDigit = previousDigits[previousDigits.length - digitIndexFromRight - 1];
        const direction = currentDigitIndex % 2 === 0 ? "up" : "down";
        currentDigitIndex += 1;

        return (
          <RollingPriceDigit
            active={isActive}
            current={char}
            direction={direction}
            key={`digit-${digitIndexFromRight}`}
            previous={previousDigit}
            rolling={isRolling}
          />
        );
      })}
    </strong>
  );
}

function OneShotMembershipBeam({ children }: { children: ReactNode; enabled: boolean; pulseKey: string }) {
  return <div className="source-membership-beam">{children}</div>;
}

function DataSourceLogo({ card, size = "normal" }: { card: Pick<AiDataSourceCard, "iconSrc" | "logo" | "tone">; size?: "normal" | "large" }) {
  return (
    <span className={`data-source-logo tone-${card.tone} size-${size}`}>
      {card.iconSrc ? <img alt="" src={card.iconSrc} /> : card.logo}
    </span>
  );
}

function DataSourceModalFrame({
  children,
  className,
  title,
  onClose,
}: {
  children: ReactNode;
  className?: string;
  title: string;
  onClose: () => void;
}) {
  const overlayClassName = className?.includes("data-connection-center") ? "data-source-overlay data-connection-center-overlay" : "data-source-overlay";

  return (
    <div className={overlayClassName}>
      <section className={`data-source-modal ${className || ""}`} role="dialog" aria-modal="true" aria-label={title}>
        <header className="data-source-modal-header">
          <h2>{title}</h2>
          <button className="data-source-close" type="button" aria-label="关闭" onClick={onClose}>
            <CloseOutlined />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}

function DataSourceCompactOverlay({ children }: { children: ReactNode }) {
  return <div className="data-source-overlay data-source-compact-overlay">{children}</div>;
}

function DataConnectionCenter({ onClose, onUse }: { onClose: () => void; onUse: () => void }) {
  const [keyword, setKeyword] = useState("");
  const visibleCards = aiDataSourceCards.filter((card) => card.name.includes(keyword) || card.description.includes(keyword));

  return (
    <DataSourceModalFrame className="data-connection-center" title="数据连接中心" onClose={onClose}>
      <div className="connection-center-search">
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="搜索数据源"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
      </div>
      <div className="connection-center-body">
        <aside className="connection-category-nav">
          {dataSourceCategories.map((item, index) => (
            <button className={`${index === 0 ? "active" : ""}${item.separated ? " separated" : ""}`} key={item.label} type="button">
              <span>{item.icon}{item.label}</span>
              {item.label === "共享数据源" && <RightOutlined />}
            </button>
          ))}
        </aside>
        <main className="connection-source-list">
          <div className="connection-section-head">
            <h3>全部数据源</h3>
          </div>
          <div className="connection-card-grid">
            {visibleCards.map((card) => (
              <article className={`connection-card${card.actionable ? " is-actionable" : ""}`} key={card.key}>
                <DataSourceLogo card={card} />
                <div className="connection-card-copy">
                  <div>
                    <strong>{card.name}</strong>
                    <Tag color={card.provider === "取数宝" ? "orange" : "default"}>{card.provider}</Tag>
                  </div>
                  <p>{card.description}</p>
                </div>
                {card.actionable && (
                  <Button className="connection-card-use" onClick={onUse}>
                    使用
                  </Button>
                )}
              </article>
            ))}
          </div>
        </main>
      </div>
    </DataSourceModalFrame>
  );
}

function DataSourceDetailModal({ onClose, onUse }: { onClose: () => void; onUse: () => void }) {
  function handleShare() {
    void navigator.clipboard?.writeText("https://ai.dingtalk.com/data-source/taobao-sycm").catch(() => undefined);
    message.success("复制链接成功");
  }

  return (
    <div className="data-source-overlay source-detail-built-overlay">
      <section className="source-detail-built-modal" role="dialog" aria-modal="true" aria-label="获取生意参谋数据">
        <header className="source-detail-built-header">
          <h2>获取生意参谋数据</h2>
          <button className="data-source-close" type="button" aria-label="关闭" onClick={onClose}>
            <CloseOutlined />
          </button>
        </header>
        <main className="source-detail-built-body">
          <section className="source-detail-product-head">
            <div className="source-detail-product-copy">
              <img alt="" src={sourceAuthLogoImage} />
              <div>
                <h3>
                  淘宝生意参谋 <span>取数宝</span>
                </h3>
                <p>一键获取生意参谋商品、流量、品类等数据到 AI 表格，支持定时同步更新</p>
              </div>
            </div>
            <div className="source-detail-product-actions">
              <button className="source-detail-share-button" type="button" onClick={handleShare}>
                <ExportOutlined /> 分享链接
              </button>
              <button className="source-detail-use-button" type="button" onClick={onUse}>
                立即使用
              </button>
            </div>
          </section>

          <section className="source-detail-visual-grid-built">
            <div className="source-detail-blue-visual source-detail-sync-visual">
              <h4>将商家数据同步至钉钉 AI 表格</h4>
              <div className="source-visual-browser">
                <div className="source-visual-browser-head">
                  <span />
                  <span />
                  <span />
                  <strong>生意参谋</strong>
                </div>
                <div className="source-visual-browser-body">
                  <nav>
                    <span>宏观监控</span>
                    <b>商品排行</b>
                    <span>商品 360</span>
                    <span>品类 360</span>
                  </nav>
                  <div className="source-visual-skeleton">
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
                <div className="source-visual-line source-visual-line-left" />
                <div className="source-visual-ai-logo">
                  <img alt="" src={dataSourceIconUrls["ai-table"]} />
                </div>
              </div>
            </div>
            <div className="source-detail-blue-visual source-detail-decision-visual">
              <h4>连接数据，助力企业决策更高效</h4>
              <div className="source-visual-sheet-mock">
                <div className="source-visual-data-tip">生意参谋店铺商品、运营数据等</div>
                <div className="source-visual-table-lines">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
                <div className="source-visual-line source-visual-line-right" />
                <menu>
                  <b>导入 Excel <em>.xlsx</em></b>
                  <span>数据表</span>
                  <span>收集表</span>
                  <strong>仪表盘</strong>
                  <span>文档</span>
                </menu>
              </div>
            </div>
          </section>

          <section className="source-detail-built-section">
            <h4>功能概述</h4>
            <p><b>数据获取来源：</b>生意参谋（新版）商品排行、运营视窗、店铺流量来源构成、360标准品类、自助分析取数、</p>
            <p><b>支持查询条件：</b>时间范围、标准类目、导购类目</p>
          </section>
          <section className="source-detail-built-section">
            <h4>功能价值</h4>
            <p>一站式自动定时同步获取商品、店铺、品类、流量等多维度数据，确保店铺商品数据始终保持最新，无需手动跨页提取，高效支撑店铺运营决策与策略优化</p>
          </section>
          <section className="source-detail-trust-built">
            <h4>超 5000+ 家企业用户信赖</h4>
            <div>
              {sourceTrustLogos.map((logo) => (
                <span key={logo}>{logo}</span>
              ))}
            </div>
          </section>
          <footer className="source-detail-meta-built">
            <div>
              <strong>开发者</strong>
              <p><span>取数宝</span><span>前往取数宝官网</span></p>
            </div>
            <div>
              <strong>最近更新时间</strong>
              <p><span>2025/11/19 11:26:02</span><span>更新日志</span></p>
            </div>
            <div>
              <strong>发布时间</strong>
              <p><span>2025/11/19 11:26:02</span></p>
            </div>
          </footer>
        </main>
      </section>
    </div>
  );
}

function DataSourceAuthModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="data-source-overlay figma-source-auth-overlay">
      <section className="figma-source-auth-modal" role="dialog" aria-modal="true" aria-label="授权清单">
        <header className="figma-source-auth-head">
          <img alt="" src={sourceAuthLogoImage} />
          <div>
            <h2>淘系生意参谋</h2>
            <p>开发者：取数宝</p>
          </div>
        </header>
        <section className="figma-source-auth-list">
          <h3>授权清单（5 项）</h3>
          <ul>
            <li>获取应用正常启动所需的基础非隐私权限</li>
            <li>获取多维表内容查看权限</li>
            <li>获取多维表内容编辑权限</li>
            <li>获取通讯录内头像、昵称等信息</li>
            <li>获取创建服务群的权限，可通过服务群为你服务</li>
          </ul>
        </section>
        <section className="figma-source-auth-actions">
          <p>
            <span>已阅读授权清单</span>、<a>服务协议、隐私协议、企业协议</a>
          </p>
          <button className="figma-source-auth-confirm" type="button" onClick={onConfirm}>
            同意协议并立即启用
          </button>
          <button className="figma-source-auth-reject" type="button" onClick={onCancel}>
            拒绝
          </button>
        </section>
      </section>
    </div>
  );
}

function DataSourceConfigModal({
  accountAdded,
  activeStep,
  configDraft,
  currentMembershipName,
  currentMembershipLevel,
  dataSourceStatus,
  enabledPlatforms,
  loginFailureMessage,
  nestedOverlay,
  onClearLoginFailure,
  onClose,
  onConfigDraftChange,
  onAddAccount,
  onLoginCheck,
  onLoginPermissionCheck,
  onStart,
  onStepChange,
  onSubscribe,
  subscribed,
  trialEntitlement,
}: {
  accountAdded: boolean;
  activeStep: DataSourceConfigStep;
  configDraft: DataSourceConfigDraft;
  currentMembershipName: string;
  currentMembershipLevel: CommerceMembershipLevel;
  dataSourceStatus: SourceAvailability;
  enabledPlatforms: string[];
  loginFailureMessage?: string;
  nestedOverlay?: ReactNode;
  onClearLoginFailure: () => void;
  onClose: () => void;
  onConfigDraftChange: (draft: DataSourceConfigDraft) => void;
  onAddAccount: () => void;
  onLoginCheck: () => void;
  onLoginPermissionCheck: () => boolean;
  onStart: () => void;
  onStepChange: (step: DataSourceConfigStep) => void;
  onSubscribe: () => void;
  subscribed: boolean;
  trialEntitlement: DataSourceTrialEntitlement;
}) {
  const [selectedDataset, setSelectedDataset] = useState(configDraft.selectedDataset);
  const [hasDateRange, setHasDateRange] = useState(configDraft.hasDateRange);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(configDraft.dateRange);
  const [moreSettingsOpen, setMoreSettingsOpen] = useState(configDraft.moreSettingsOpen);
  const [dataScope, setDataScope] = useState<SourceDataScope>(configDraft.dataScope);
  const [shopAccount, setShopAccount] = useState(configDraft.shopAccount);
  const [shopPassword, setShopPassword] = useState(configDraft.shopPassword);
  const [loginCheckAttempted, setLoginCheckAttempted] = useState(false);
  const fieldOptions = [
    "企业唯一ID",
    "店铺唯一ID",
    "业务日期",
    "采数时间",
    "平台名称",
    "店铺名称",
    "排名",
    "商品名称",
    "商品图片",
    "SKU",
    "浏览量",
    "访客数",
  ];
  const [selectedFields, setSelectedFields] = useState<string[]>(configDraft.selectedFields);
  const [fieldPickerOpen, setFieldPickerOpen] = useState(false);
  const [draftSelectedFields, setDraftSelectedFields] = useState<string[]>([]);
  const [outputLocation, setOutputLocation] = useState(configDraft.outputLocation);
  const [scheduled, setScheduled] = useState(configDraft.scheduled);
  const [scheduleCycle, setScheduleCycle] = useState(configDraft.scheduleCycle);
  const currentEntitlement = getCommerceMembershipEntitlement(subscribed ? currentMembershipLevel : "free");
  const selectedDatasetStatus = getDatasetAvailability(selectedDataset, dataSourceStatus);
  const customFieldsMissing = dataScope === "custom" && selectedFields.length === 0;
  const datasetDown = selectedDatasetStatus === "down";
  const canStart = accountAdded && hasDateRange && !customFieldsMissing && !datasetDown;
  const membershipTitle = subscribed ? currentMembershipName : "免费版";
  const membershipDays = subscribed ? "365" : formatTrialRemainingDays(trialEntitlement);
  const membershipLimit = `0/${currentEntitlement.dailyLimit}`;
  const membershipPlatformCount = `${Math.min(enabledPlatforms.length, currentEntitlement.platformLimit)}/${currentEntitlement.platformLimit}`;
  const startTip = !accountAdded
    ? "请先完成账号登录校验"
    : !hasDateRange
      ? "请选择需获取数据的时间范围"
      : customFieldsMissing
        ? "请选择所需字段"
        : datasetDown
          ? "当前数据源已下架"
          : "";
  const dateRangeTip = accountAdded && !hasDateRange ? "请选择需获取数据的时间范围" : "";
  const fieldScopeTip = accountAdded && hasDateRange && customFieldsMissing ? "请选择所需字段" : "";
  const selectedFieldText = selectedFields.length > 0 ? selectedFields.join("、") : "未选择字段";
  const fieldPickerLabel = selectedFields.length > 0 ? `已选 ${selectedFields.length} 个字段` : "字段选择";
  const allDraftFieldsSelected = draftSelectedFields.length === fieldOptions.length;
  const partiallyDraftFieldsSelected = draftSelectedFields.length > 0 && !allDraftFieldsSelected;
  const sectionIdByStep: Record<DataSourceConfigStep, string> = {
    select: "source-config-select-section",
    account: "source-config-account-section",
    params: "source-config-params-section",
  };

  useEffect(() => {
    onConfigDraftChange({
      selectedDataset,
      hasDateRange,
      dateRange,
      moreSettingsOpen,
      dataScope,
      shopAccount,
      shopPassword,
      selectedFields,
      outputLocation,
      scheduled,
      scheduleCycle,
    });
  }, [
    dataScope,
    dateRange,
    hasDateRange,
    moreSettingsOpen,
    onConfigDraftChange,
    outputLocation,
    scheduleCycle,
    scheduled,
    selectedDataset,
    selectedFields,
    shopAccount,
    shopPassword,
  ]);

  const handleStepClick = (step: DataSourceConfigStep) => {
    onStepChange(step);
    window.requestAnimationFrame(() => {
      document.getElementById(sectionIdByStep[step])?.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  };
  const resetDatasetParams = () => {
    setDateRange(null);
    setHasDateRange(false);
    setDataScope("all");
    setSelectedFields([]);
  };
  const handleDatasetSelect = (datasetKey: string) => {
    if (datasetKey !== selectedDataset) {
      resetDatasetParams();
    }
    setSelectedDataset(datasetKey);
    handleStepClick("select");
  };
  const accountInvalid = loginCheckAttempted && !shopAccount.trim();
  const passwordInvalid = loginCheckAttempted && !shopPassword.trim();
  const externalLoginError = Boolean(loginFailureMessage);
  const loginFormInvalid = accountInvalid || passwordInvalid || externalLoginError;
  const handleLoginCheck = () => {
    if (!onLoginPermissionCheck()) return;
    setLoginCheckAttempted(true);
    onClearLoginFailure();
    if (!shopAccount.trim() || !shopPassword.trim()) {
      handleStepClick("account");
      return;
    }
    onLoginCheck();
  };
  const handleAddAccount = () => {
    setShopAccount("");
    setShopPassword("");
    setLoginCheckAttempted(false);
    onClearLoginFailure();
    onAddAccount();
    handleStepClick("account");
  };
  const openFieldPicker = () => {
    setDraftSelectedFields(selectedFields);
    setFieldPickerOpen(true);
  };
  const confirmFieldPicker = () => {
    setSelectedFields(draftSelectedFields);
    setFieldPickerOpen(false);
  };

  return (
    <DataSourceModalFrame className="data-source-config-modal" title="生意参谋 数据同步配置" onClose={onClose}>
      <div className="source-config-layout">
          <aside className="source-config-sidebar">
            <nav className="source-config-step-nav" aria-label="数据同步配置步骤">
              <button className={activeStep === "select" ? "active" : ""} type="button" onClick={() => handleStepClick("select")}>选择数据源</button>
              <button className={activeStep === "account" ? "active" : ""} type="button" onClick={() => handleStepClick("account")}>设置账号</button>
              <button className={activeStep === "params" ? "active" : ""} type="button" onClick={() => handleStepClick("params")}>设置参数</button>
            </nav>
            <div className={`source-subscribe-card ${subscribed ? "is-subscribed" : ""}`}>
              <div>
                <strong>{membershipTitle}</strong>
                <Button size="small" type="primary" shape="round" onClick={onSubscribe}>{subscribed ? "续费" : "升级"}</Button>
              </div>
              <p><span>剩余天数</span><b>{membershipDays}</b></p>
              <p><span>每日取数次数</span><b>{membershipLimit}</b></p>
              <p><span>已选平台</span><b>{membershipPlatformCount}</b></p>
            </div>
          </aside>
          <main className="source-config-content">
            <section className="source-config-section" id="source-config-select-section">
              <div className="source-config-section-heading">
                <h3>选择数据源</h3>
              </div>
              <div className="source-dataset-grid">
                {sycmDatasetCards.filter((item) => getDatasetAvailability(item.key, dataSourceStatus) !== "down").map((item) => {
                  return (
                    <button
                      className={selectedDataset === item.key ? "active" : ""}
                      key={item.key}
                      type="button"
                      onClick={() => handleDatasetSelect(item.key)}
                    >
                      <span className="source-dataset-cover" />
                      <span className="source-dataset-title-row">
                        <strong>{item.title}</strong>
                      </span>
                      <span>{item.description}</span>
                    </button>
                  );
                })}
              </div>
            </section>
            <section className="source-config-section" id="source-config-account-section">
              <div className="source-config-section-heading">
                <h3>设置账号</h3>
                {!accountAdded && <p>账密将通过加密传输，仅用于取数认证，平台不做任何存储</p>}
              </div>
              {!accountAdded ? (
                <div className="source-login-form">
                  <Input
                    aria-invalid={accountInvalid}
                    className="source-config-input"
                    placeholder="请输入需取数的店铺账号"
                    status={accountInvalid || externalLoginError ? "error" : undefined}
                    value={shopAccount}
                    onChange={(event) => {
                      onClearLoginFailure();
                      setShopAccount(event.target.value);
                    }}
                  />
                  <Input.Password
                    aria-invalid={passwordInvalid}
                    className="source-config-input"
                    placeholder="请输入密码"
                    status={passwordInvalid || externalLoginError ? "error" : undefined}
                    value={shopPassword}
                    onChange={(event) => {
                      onClearLoginFailure();
                      setShopPassword(event.target.value);
                    }}
                  />
                  {loginFormInvalid && (
                    <p className="source-login-error" role="alert">
                      <InfoCircleOutlined aria-hidden="true" />
                      <span>{loginFailureMessage || "请输入需获取数据的店铺账密"}</span>
                    </p>
                  )}
                  <p className="source-login-tip">温馨提示：部分平台会有账号保护策略，请避免频繁更换环境登录导致触发风控</p>
                  <Button className="source-login-check-button" type="primary" ghost onClick={handleLoginCheck}>登录校验</Button>
                </div>
              ) : (
                <div className="source-account-ready">
                  <Select
                    className="source-config-select"
                    popupClassName="source-config-select-dropdown"
                    value="sensen@vip"
                    suffixIcon={<TablerChevronDownIcon className="source-select-chevron" />}
                    options={[{ value: "sensen@vip", label: "sensen@vip" }]}
                    popupRender={(menu) => (
                      <>
                        {menu}
                        <div className="source-account-dropdown-extra" onMouseDown={(event) => event.preventDefault()}>
                          <button className="source-account-add-option" type="button" onClick={handleAddAccount}>
                            <PlusOutlined />
                            <span>添加账号</span>
                          </button>
                        </div>
                      </>
                    )}
                  />
                  <Select
                    className="source-config-select"
                    popupClassName="source-config-select-dropdown"
                    value="森森的第一家店"
                    suffixIcon={<TablerChevronDownIcon className="source-select-chevron" />}
                    options={[{ value: "森森的第一家店", label: "森森的第一家店" }]}
                  />
                </div>
              )}
            </section>
            <section className="source-config-section source-config-params-section" id="source-config-params-section">
              <h3>设置参数</h3>
              <label>选择需获取数据的时间范围</label>
              <DatePicker.RangePicker
                className="source-date-range"
                placeholder={["开始日期", "结束日期"]}
                value={dateRange}
                onChange={(dates) => {
                  setDateRange(dates as [Dayjs | null, Dayjs | null] | null);
                  setHasDateRange(Boolean(dates?.[0] && dates?.[1]));
                }}
              />
              {dateRangeTip && (
                <p className="source-inline-error" role="alert">
                  <InfoCircleOutlined aria-hidden="true" />
                  <span>{dateRangeTip}</span>
                </p>
              )}
              <button className={`source-more-settings ${moreSettingsOpen ? "open" : ""}`} type="button" onClick={() => setMoreSettingsOpen((value) => !value)}>
                更多设置 <DownOutlined />
              </button>
              {moreSettingsOpen && (
                <div className="source-more-settings-panel">
                  <label>取数范围</label>
                  <Radio.Group
                    value={dataScope}
                    onChange={(event) => {
                      setDataScope(event.target.value);
                    }}
                  >
                    <Radio value="all">全部字段</Radio>
                    <Radio value="custom">指定字段</Radio>
                  </Radio.Group>
                  {dataScope === "custom" && (
                    <Tooltip title={selectedFieldText}>
                      <Button className="source-field-picker-trigger" onClick={openFieldPicker}>
                        <span>{fieldPickerLabel}</span>
                        <TablerChevronDownIcon className="source-select-chevron" />
                      </Button>
                    </Tooltip>
                  )}
                  {fieldScopeTip && (
                    <p className="source-inline-error" role="alert">
                      <InfoCircleOutlined aria-hidden="true" />
                      <span>{fieldScopeTip}</span>
                    </p>
                  )}
                  <label>输出位置</label>
                  <Select
                    className="source-config-select"
                    popupClassName="source-config-select-dropdown"
                    value={outputLocation}
                    onChange={setOutputLocation}
                    suffixIcon={<TablerChevronDownIcon className="source-select-chevron" />}
                    options={[
                      { value: "当前数据表", label: "当前数据表" },
                      { value: "新建数据表", label: "新建数据表" },
                    ]}
                  />
                  <div className="source-schedule-row">
                    <span>定时设置</span>
                    <Switch checked={scheduled} onChange={setScheduled} />
                  </div>
                  {scheduled && (
                    <div className="source-schedule-settings">
                      <div className="source-schedule-control-row">
                        <span>执行频率</span>
                        <Segmented options={["日", "周", "月"]} value={scheduleCycle} onChange={(value) => setScheduleCycle(String(value))} />
                      </div>
                      <div className="source-schedule-control-row">
                        <span>{scheduleCycle === "日" ? "执行时间" : scheduleCycle === "周" ? "执行日期" : "执行日期"}</span>
                        {scheduleCycle === "日" ? (
                          <Select
                            className="source-schedule-select"
                            defaultValue="09:00"
                            popupClassName="source-config-select-dropdown"
                            suffixIcon={<TablerChevronDownIcon className="source-select-chevron" />}
                            options={sourceScheduleTimeOptions}
                          />
                        ) : (
                          <Space size={8}>
                            <Select
                              key={`source-schedule-date-${scheduleCycle}`}
                              className="source-schedule-short-select"
                              defaultValue={scheduleCycle === "周" ? "每周一" : "每月1日"}
                              popupClassName="source-config-select-dropdown"
                              suffixIcon={<TablerChevronDownIcon className="source-select-chevron" />}
                              options={scheduleCycle === "周" ? sourceScheduleWeekOptions : sourceScheduleMonthOptions}
                            />
                            <Select
                              key={`source-schedule-time-${scheduleCycle}`}
                              className="source-schedule-short-select"
                              defaultValue="09:00"
                              popupClassName="source-config-select-dropdown"
                              suffixIcon={<TablerChevronDownIcon className="source-select-chevron" />}
                              options={sourceScheduleTimeOptions}
                            />
                          </Space>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          </main>
          <Modal
            className="source-field-picker-modal"
            rootClassName="source-field-picker-root"
            getContainer={false}
            open={fieldPickerOpen}
            title="字段选择"
            width={420}
            onCancel={() => setFieldPickerOpen(false)}
            footer={[
              <Button key="cancel" onClick={() => setFieldPickerOpen(false)}>
                取消
              </Button>,
              <Button key="confirm" type="primary" onClick={confirmFieldPicker}>
                确定
              </Button>,
            ]}
          >
            <Checkbox
              checked={allDraftFieldsSelected}
              indeterminate={partiallyDraftFieldsSelected}
              onChange={(event) => setDraftSelectedFields(event.target.checked ? fieldOptions : [])}
            >
              全选
            </Checkbox>
            <Checkbox.Group
              className="source-field-checkbox-group"
              value={draftSelectedFields}
              onChange={(values) => setDraftSelectedFields(values.map(String))}
            >
              <div className="source-field-checkbox-grid">
                {fieldOptions.map((field) => (
                  <Checkbox key={field} value={field}>
                    {field}
                  </Checkbox>
                ))}
              </div>
            </Checkbox.Group>
          </Modal>
        </div>
	      <footer className="source-config-footer">
          <Button className="source-help-link" type="text" icon={<FileTextOutlined />}>
            使用说明
          </Button>
          <div className="source-config-footer-action">
            <Button className="source-start-button" type="primary" title={startTip} disabled={!canStart} onClick={onStart}>
              开始获取
            </Button>
          </div>
	      </footer>
      {nestedOverlay}
    </DataSourceModalFrame>
  );
}

function useCountdownSeconds(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    setSeconds(initialSeconds);
    const timer = window.setInterval(() => {
      setSeconds((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [initialSeconds]);

  return seconds;
}

function useElapsedSeconds() {
  const [seconds, setSeconds] = useState(1);

  useEffect(() => {
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      setSeconds(Math.max(1, Math.floor((Date.now() - startedAt) / 1000) + 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return seconds;
}

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function PaymentSuccessModal({ nextAction }: { nextAction: CommercePendingAction }) {
  const seconds = useCountdownSeconds(5);
  const message = nextAction === "run" ? "即将开始获取数据" : "即将返回同步配置";

  return (
    <section className="source-status-modal source-payment-success-modal" role="dialog" aria-modal="true" aria-label="支付成功">
      <span className="source-status-check"><CheckOutlined /></span>
      <h2>支付成功</h2>
      <p>{message} ({seconds}s)</p>
    </section>
  );
}

function PaymentQrModal({
  errorMessage,
  onCancel,
  onFail,
  onPaid,
  onRetry,
  selection,
}: {
  errorMessage?: string;
  onCancel: () => void;
  onFail: () => void;
  onPaid: () => void;
  onRetry: () => void;
  selection: CommercePaymentSelection;
}) {
  return (
    <div className="source-payment-annotation">
      <section className="source-payment-modal" role="dialog" aria-modal="true" aria-label="扫码支付">
        <button className="data-source-close" type="button" aria-label="关闭" onClick={onCancel}>
          <CloseOutlined />
        </button>
        <h2>扫码支付</h2>
        <p>{selection.planName} · {selection.cycle}</p>
        <p className="source-payment-platforms">本次选择平台：{selection.platforms.join("、")}</p>
        <div className="source-payment-qr" aria-label="支付二维码" />
        <strong>¥{selection.price.toLocaleString("zh-CN")}</strong>
        {errorMessage && <Alert className="source-payment-error" title={errorMessage} type="error" showIcon />}
        <Space className="source-payment-actions" size={8}>
          <Button onClick={errorMessage ? onRetry : onFail}>{errorMessage ? "重试支付" : "模拟支付失败"}</Button>
          <Button type="primary" onClick={onPaid}>模拟支付完成</Button>
        </Space>
      </section>
    </div>
  );
}

function LoginCheckingModal({ onClose, onFail }: { onClose: () => void; onFail: () => void }) {
  return (
    <section className="source-login-check-modal" role="dialog" aria-modal="true" aria-label="登录校验">
      <button className="data-source-close" type="button" aria-label="关闭" onClick={onClose}>
        <CloseOutlined />
      </button>
      <h2>登录校验</h2>
      <div className="source-login-check-body">
        <h3>正在执行登录校验</h3>
        <p>登录可能会需要输入验证码哦，请注意填写～</p>
        <Button danger ghost onClick={onFail}>模拟账号密码错误</Button>
      </div>
    </section>
  );
}

function CaptchaModal({
  onClose,
  onFail,
  onSubmit,
}: {
  onClose: () => void;
  onFail: (messageText: string) => void;
  onSubmit: () => void;
}) {
  const [captcha, setCaptcha] = useState("");
  const countdownSeconds = useCountdownSeconds(71);
  const countdownText = formatCountdown(countdownSeconds);

  useEffect(() => {
    if (countdownSeconds === 0) {
      onFail("验证码超时，请重新登录校验");
    }
  }, [countdownSeconds, onFail]);

  const handleSubmit = () => {
    if (captcha.trim() !== sourceCaptchaMockCode) {
      onFail("验证码错误，请重新登录校验");
      return;
    }
    onSubmit();
  };

  return (
    <section className="source-captcha-modal" role="dialog" aria-modal="true" aria-label="验证码校验">
      <button className="data-source-close" type="button" aria-label="关闭" onClick={onClose}>
        <CloseOutlined />
      </button>
      <header>
        <h2>正在执行登录校验</h2>
        <time className="source-countdown-pill">{countdownText}</time>
      </header>
      <Alert title="请尽快填写验证码否则将导致登录失败" type="warning" showIcon />
      <Space className="source-captcha-input" size={8}>
        <Input placeholder="请输入验证码" value={captcha} onChange={(event) => setCaptcha(event.target.value)} />
        <Button disabled={!captcha || countdownSeconds === 0} type="primary" onClick={handleSubmit}>提交</Button>
      </Space>
      <div className="source-login-preview">
        <div className="source-login-preview-banner">
          <small>生意参谋</small>
          <strong>5.0重磅升级</strong>
          <span>从流量到留量，生意多元持续增长</span>
        </div>
        <div className="source-login-preview-card">
          <i>sensen@vip.com</i>
          <i>**********</i>
          <b>登录</b>
        </div>
      </div>
    </section>
  );
}

function RunningTaskModal({ onCollapse, onFail }: { onCollapse: () => void; onFail: () => void }) {
  const elapsedText = formatCountdown(useElapsedSeconds());

  return (
    <section className="source-running-modal" role="dialog" aria-modal="true" aria-label="正在运行任务">
      <header>
        <Space className="source-running-title" size={8} align="center">
          <h2>正在运行任务</h2>
          <Tag className="source-time-pill" icon={<ClockCircleOutlined />}>{elapsedText}</Tag>
        </Space>
        <Space size={8}>
          <Button danger ghost onClick={onFail}>模拟失败</Button>
          <Button onClick={onCollapse}>收起</Button>
        </Space>
      </header>
      <div className="source-task-card">
        <p><ReloadOutlined spin /> 共计2个步骤</p>
        <div>
          <strong><i>1</i> 获取数据</strong>
          <span>过程中如有异常可通过“联系我们”获取支持</span>
        </div>
        <div>
          <strong>数据入库</strong>
          <span>如果表格字段较多或数据量偏大，入库时间可能较久，请耐心等待</span>
        </div>
      </div>
    </section>
  );
}

function SourceSuccessModal({ onClose }: { onClose: () => void }) {
  return (
    <section className="source-status-modal source-data-success-modal" role="dialog" aria-modal="true" aria-label="数据获取成功">
      <span className="source-status-check"><CheckOutlined /></span>
      <h2>数据获取成功</h2>
      <p>可前往数据表查看</p>
      <Button type="primary" onClick={onClose}>确定</Button>
    </section>
  );
}

function SourceRunFailedModal({
  onBack,
  onRetry,
  onSupport,
  reason,
}: {
  onBack: () => void;
  onRetry: () => void;
  onSupport: () => void;
  reason: string;
}) {
  return (
    <section className="source-status-modal source-data-failed-modal" role="dialog" aria-modal="true" aria-label="数据获取失败">
      <span className="source-status-fail"><InfoCircleOutlined /></span>
      <h2>数据获取失败</h2>
      <p>{reason}</p>
      <Space className="source-failed-actions" size={8}>
        <Button type="primary" onClick={onRetry}>重试</Button>
        <Button onClick={onBack}>返回配置</Button>
        <Button onClick={onSupport}>联系客服</Button>
      </Space>
    </section>
  );
}

function SourceMembershipGateModal({
  reason,
  onClose,
  onPrimary,
}: {
  reason: MembershipGateReason;
  onClose: () => void;
  onPrimary: () => void;
}) {
  const copyMap: Record<MembershipGateReason, { title: string; desc: string; primary: string }> = {
    trialExpired: { title: "试用期已到期", desc: "请购买会员后继续使用。", primary: "购买会员" },
    memberMissing: { title: "暂无有效会员", desc: "当前账号暂无有效会员，购买会员后可继续使用当前数据源。", primary: "购买会员" },
    memberExpired: { title: "会员已到期", desc: "会员已到期，续费后可继续登录和取数。", primary: "续费" },
    platformNotSelected: { title: "当前会员未开通生意参谋", desc: "当前会员未开通生意参谋，请购买包含该平台的会员权益后再使用。", primary: "去购买" },
    grantFailed: { title: "会员权益发放失败", desc: "会员权益发放失败，请联系运营处理或重新发起权益发放。", primary: "重新购买" },
  };
  const copy = copyMap[reason];

  return (
    <section className="source-status-modal source-membership-gate-modal" role="dialog" aria-modal="true" aria-label="会员限制提示">
      <button className="data-source-close" type="button" aria-label="关闭" onClick={onClose}>
        <CloseOutlined />
      </button>
      <span className="source-status-warn"><InfoCircleOutlined /></span>
      <h2>{copy.title}</h2>
      <p>{copy.desc}</p>
      <Space className="source-failed-actions" size={8}>
        <Button type="primary" onClick={onPrimary}>{copy.primary}</Button>
      </Space>
    </section>
  );
}

function SubscriptionPage({
  currentMembershipLevel,
  enabledPlatforms,
  nestedOverlay,
  onBack,
  onClose,
  onPay,
}: {
  currentMembershipLevel: CommerceMembershipLevel;
  currentMembershipName: string;
  enabledPlatforms: string[];
  nestedOverlay?: ReactNode;
  onBack: () => void;
  onClose: () => void;
  onPay: (selection: CommercePaymentSelection) => void;
  subscribed: boolean;
}) {
  const [selectedCycle, setSelectedCycle] = useState<CommerceMemberCycle>("月付");
  const currentRank = commerceMembershipRank[currentMembershipLevel];
  const visiblePaidPlans = commerceMemberPlans.filter((plan) => plan.listed);
  const selectablePlans = visiblePaidPlans.filter((plan) => commerceMembershipRank[plan.level] >= currentRank);
  const [selectedPlanLevel, setSelectedPlanLevel] = useState<CommercePaidMembershipLevel | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [agreementChecked, setAgreementChecked] = useState(true);
  const selectedPlan = selectedPlanLevel ? selectablePlans.find((plan) => plan.level === selectedPlanLevel) : undefined;
  const selectedCycleConfig = selectedPlan?.cycles[selectedCycle];
  const selectedPrice = selectedCycleConfig
    ? calculateCommerceCyclePrice(selectedCycleConfig.originalPrice, selectedCycleConfig.discountPercent)
    : 0;
  const selectedPlanRank = selectedPlan ? commerceMembershipRank[selectedPlan.level] : 0;
  const singlePlatformSelect = !selectedPlan || selectedPlan.platformLimit === 1;
  const selectedPlatformOverLimit = selectedPlan ? selectedPlatforms.length > selectedPlan.platformLimit : false;
  const platformLimitReached = selectedPlan ? selectedPlatforms.length >= selectedPlan.platformLimit : false;
  const canCheckout = Boolean(selectedPlan) && selectedPlatforms.length > 0 && !selectedPlatformOverLimit && agreementChecked;
  const checkoutLabel = selectedPlan && currentMembershipLevel === selectedPlan.level ? "续费" : "立即购买";

  useEffect(() => {
    if (!selectedPlan || selectedPlatforms.length <= selectedPlan.platformLimit) return;
    setSelectedPlatforms((current) => current.slice(0, selectedPlan.platformLimit));
  }, [selectedPlan?.platformLimit, selectedPlatforms.length]);

  return (
    <DataSourceModalFrame className="data-source-config-modal source-subscribe-page-modal" title="生意参谋 数据同步配置" onClose={onClose}>
      <main className="source-subscribe-page">
        <header className="source-plan-head">
          <div>
            <div className="source-plan-title-row">
              <button className="source-subscribe-back" type="button" aria-label="返回同步配置" onClick={onBack}>
                <LeftOutlined />
              </button>
              <h2>订阅计划</h2>
            </div>
            <div className="source-billing-toggle" aria-label="计费周期">
              {commerceMemberCycles.map((cycle) => {
                const discountTag = getCommerceCycleDiscountTag(cycle);
                return (
                  <button
                    className={selectedCycle === cycle ? "active" : ""}
                    key={cycle}
                    type="button"
                    onClick={() => setSelectedCycle(cycle)}
                  >
                    <span className="source-billing-cycle-label">{cycle}</span>
                    {discountTag && <span className="source-billing-discount-tag">{discountTag}</span>}
                  </button>
                );
              })}
            </div>
          </div>
          <Button className="source-support-button" icon={<CustomerServiceOutlined />}>咨询客服</Button>
        </header>

        <div className="source-membership-grid">
          <article className="source-membership-card source-membership-card-free">
            <div className="source-membership-card-head">
              <div>
                <h3>免费</h3>
                <p>新用户体验</p>
              </div>
            </div>
            <div className="source-membership-price-row">
              <span className="source-membership-currency">¥</span>
              <strong className="source-membership-price-number source-membership-price-number-static">0</strong>
              <span>/月</span>
            </div>
            {currentMembershipLevel === "free" && <span className="source-membership-current-tag">当前版本</span>}
            <div className="source-membership-original source-membership-original-placeholder" aria-hidden="true" />
            <div className="source-membership-includes">包括</div>
            <MembershipBenefitList
              items={[
                { label: "每日取数上限：", value: "20/次" },
                { label: "并发任务数：", value: "1/个" },
                { label: "可使用平台数：", value: "1/个" },
              ]}
            />
          </article>

          {visiblePaidPlans.map((plan) => {
            const cycleConfig = plan.cycles[selectedCycle];
            const price = calculateCommerceCyclePrice(cycleConfig.originalPrice, cycleConfig.discountPercent);
            const discountLabel = formatCommerceDiscount(cycleConfig.discountPercent);
            const planRank = commerceMembershipRank[plan.level];
            const isCurrent = currentMembershipLevel === plan.level;
            const isDowngrade = currentRank > planRank;
            const promoted = Boolean(discountLabel);
            const isSelected = selectedPlan?.level === plan.level;
            const handleSelectPlan = () => {
              if (isDowngrade) return;
              if (selectedPlanLevel !== plan.level) {
                setSelectedPlatforms([]);
              }
              setSelectedPlanLevel(plan.level);
            };
            const membershipCard = (
              <article
                aria-pressed={isSelected}
                className={`source-membership-card source-membership-card-selectable${promoted ? " is-promoted" : ""}${isCurrent ? " is-current" : ""}${isSelected ? " is-selected" : ""}${isDowngrade ? " is-disabled" : ""}`}
                key={plan.key}
                onClick={handleSelectPlan}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" && event.key !== " ") return;
                  event.preventDefault();
                  handleSelectPlan();
                }}
                role="button"
                tabIndex={isDowngrade ? -1 : 0}
              >
                <div className="source-membership-card-head">
                  <div>
                    <h3>{plan.displayName}</h3>
                    <p>{plan.benefit}</p>
                  </div>
                  {promoted && <span className="source-membership-discount-tag">{discountLabel}</span>}
                </div>
                <div className="source-membership-price-row">
                  <span className="source-membership-currency">¥</span>
                  <AnimatedCommercePrice pulseKey={`${plan.key}-${selectedCycle}`} value={price} />
                  <span>/{formatCommerceCycleUnit(selectedCycle)}</span>
                </div>
                {isCurrent && <span className="source-membership-current-tag">当前版本</span>}
                <div className="source-membership-original">
                  {discountLabel ? <del>原价 ¥{cycleConfig.originalPrice.toLocaleString("zh-CN")}</del> : null}
                </div>
                <div className="source-membership-includes">包括</div>
                <MembershipBenefitList
                  items={[
                    { label: "每日取数上限：", value: formatCommerceDailyLimit(plan.dailyLimit) },
                    { label: "并发任务数：", value: formatCommerceConcurrency(plan.concurrency) },
                    { label: "可使用平台数：", value: formatCommercePlatformLimit(plan.platformLimit) },
                  ]}
                />
              </article>
            );

            return (
              <OneShotMembershipBeam enabled={promoted} key={plan.key} pulseKey={`${plan.key}-${selectedCycle}`}>
                {membershipCard}
              </OneShotMembershipBeam>
            );
          })}

          <article className="source-membership-card source-membership-card-enterprise">
            <div className="source-membership-card-head">
              <div>
                <h3>企业会员</h3>
                <p>适合企业专属场景</p>
              </div>
            </div>
            <div className="source-membership-price-row source-membership-price-row-enterprise">
              <strong className="source-membership-price-text">专属定制</strong>
            </div>
            <div className="source-membership-original">
              <span>专属方案</span>
            </div>
            <button className="source-membership-buy source-membership-buy-ai-outline" type="button">
              <BowlingIcon />
              <span className="source-membership-buy-label">立即定制</span>
            </button>
            <div className="source-membership-includes">包括</div>
            <MembershipBenefitList
              items={[
                { label: "每日取数上限：", value: "定制" },
                { label: "并发任务数：", value: "定制" },
                { label: "可使用平台数：", value: "定制" },
                { label: "专属运维服务：", value: "7*24h" },
              ]}
            />
          </article>
        </div>
      </main>
      <footer className="source-subscribe-checkout">
        <div className="source-checkout-platforms">
          <span>选择可用平台</span>
          <div className="source-checkout-platform-field">
            <Select
              className={`source-platform-select${selectedPlatformOverLimit ? " is-error" : ""}`}
              disabled={!selectedPlan}
              key={`${selectedPlan?.level ?? "empty"}-${singlePlatformSelect ? "single" : "multiple"}`}
              maxTagCount={singlePlatformSelect ? undefined : 2}
              maxTagPlaceholder={singlePlatformSelect ? undefined : (omittedValues) => `+${omittedValues.length}`}
              mode={singlePlatformSelect ? undefined : "multiple"}
              optionLabelProp="label"
              options={sourcePlatformOptionItems.map((item) => ({
                disabled: !singlePlatformSelect && !selectedPlatforms.includes(item.value) && platformLimitReached,
                label: <SourcePlatformSelectLabel item={item} />,
                title: item.label,
                value: item.value,
              }))}
              popupClassName="source-platform-select-dropdown"
              placeholder="请选择可用平台"
              status={selectedPlatformOverLimit ? "error" : undefined}
              suffixIcon={<DownOutlined />}
              tagRender={
                singlePlatformSelect
                  ? undefined
                  : ({ closable, isMaxTag, label, onClose, value }) => {
                      const item = getSourcePlatformOption(value);
                      if (!item || isMaxTag) {
                        return <Tag className="source-platform-selected-tag">{label}</Tag>;
                      }

                      return (
                        <Tag
                          className="source-platform-selected-tag"
                          closable={closable}
                          onClose={onClose}
                          onMouseDown={(event) => event.preventDefault()}
                        >
                          <SourcePlatformSelectLabel item={item} />
                        </Tag>
                      );
                    }
              }
              value={selectedPlan ? (singlePlatformSelect ? selectedPlatforms[0] : selectedPlatforms) : undefined}
              onChange={(value: string | string[]) => {
                setSelectedPlatforms(Array.isArray(value) ? value.map(String) : value ? [String(value)] : []);
              }}
              optionRender={(option) => {
                const item = getSourcePlatformOption(option.value);
                return item ? <SourcePlatformSelectLabel item={item} /> : option.label;
              }}
            />
            {selectedPlatformOverLimit && (
              <p className="source-checkout-error">
                <InfoCircleOutlined />
                <span>已超过当前会员可使用平台数</span>
              </p>
            )}
          </div>
        </div>
        <div className="source-checkout-action-row">
          <div className="source-checkout-price-block">
            <div className="source-checkout-price">
              <span>¥</span>
              <strong>{selectedPrice.toLocaleString("zh-CN")}</strong>
              <em>/{formatCommerceCycleUnit(selectedCycle)}</em>
            </div>
            <Checkbox checked={agreementChecked} disabled={!selectedPlan} onChange={(event) => setAgreementChecked(event.target.checked)}>
              已阅读并同意 会员服务协议、自动续费协议
            </Checkbox>
          </div>
          <Button
            className="source-checkout-buy"
            disabled={!selectedPlan || !canCheckout || selectedPlanRank < currentRank}
            type="primary"
            onClick={() => {
              if (!selectedPlan) return;
              onPay({
                cycle: selectedCycle,
                level: selectedPlan.level,
                planName: selectedPlan.displayName,
                platforms: selectedPlatforms,
                price: selectedPrice,
              });
            }}
          >
            {checkoutLabel}
          </Button>
        </div>
      </footer>
      {nestedOverlay}
    </DataSourceModalFrame>
  );
}

function DataSourceFrontendPage() {
  const [flowView, setFlowView] = useState<DataSourceFlowView>("connectionCenter");
  const [configStep, setConfigStep] = useState<DataSourceConfigStep>("select");
  const [subscribeSessionKey, setSubscribeSessionKey] = useState(0);
  const [configDraft, setConfigDraft] = useState<DataSourceConfigDraft>(defaultDataSourceConfigDraft);
  const [sourceAuthorized, setSourceAuthorized] = useState(false);
  const [accountAdded, setAccountAdded] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [currentMembershipLevel, setCurrentMembershipLevel] = useState<CommerceMembershipLevel>("free");
  const [membershipGrantStatus, setMembershipGrantStatus] = useState<CommerceMembershipGrantStatus>("none");
  const [trialEntitlement] = useState<DataSourceTrialEntitlement>(defaultDataSourceTrialEntitlement);
  const [enabledPlatforms, setEnabledPlatforms] = useState<string[]>([]);
  const [paymentSuccessVisible, setPaymentSuccessVisible] = useState(false);
  const [paymentSelection, setPaymentSelection] = useState<CommercePaymentSelection | null>(null);
  const [paymentErrorMessage, setPaymentErrorMessage] = useState("");
  const [pendingPostPaymentAction, setPendingPostPaymentAction] = useState<CommercePendingAction>(null);
  const [loginFailureMessage, setLoginFailureMessage] = useState("");
  const [membershipGateReason, setMembershipGateReason] = useState<MembershipGateReason>("memberMissing");
  const [runFailureReason, setRunFailureReason] = useState("取数服务短暂异常，请稍后重试");

  const sourceAvailability: SourceAvailability = !sourceAuthorized
    ? "unauthorized"
    : !checkDataSourcePermission("run", currentSourcePlatform).allowed
      ? "notPurchased"
      : "available";

  useEffect(() => {
    if (flowView !== "running") return;
    const timer = window.setTimeout(() => {
      setFlowView("success");
    }, 2200);
    return () => window.clearTimeout(timer);
  }, [flowView]);

  useEffect(() => {
    if (flowView !== "loginChecking") return;
    const timer = window.setTimeout(() => {
      setFlowView("captcha");
    }, 1400);
    return () => window.clearTimeout(timer);
  }, [flowView]);

  useEffect(() => {
    if (!paymentSuccessVisible) return;
    const timer = window.setTimeout(() => {
      handlePaymentSuccessFinish();
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [paymentSuccessVisible]);

  function closeOverlay() {
    setFlowView("closed");
    setPaymentSuccessVisible(false);
    setPaymentSelection(null);
    setPaymentErrorMessage("");
    setPendingPostPaymentAction(null);
  }

  function openSubscribe(nextAction: CommercePendingAction = null) {
    setPendingPostPaymentAction(nextAction);
    setPaymentErrorMessage("");
    setSubscribeSessionKey((current) => current + 1);
    setFlowView("subscribe");
  }

  function hasActiveTrialForPlatform(platform: string) {
    return getTrialEntitlementStatus(trialEntitlement, platform).active;
  }

  function checkDataSourcePermission(action: DataSourcePermissionAction, currentPlatform: string): DataSourcePermissionResult {
    if ((action === "login" || action === "run") && hasActiveTrialForPlatform(currentPlatform)) {
      return { allowed: true };
    }

    if (membershipGrantStatus === "grantFailed") {
      return { allowed: false, reason: "grantFailed" };
    }

    if (!subscribed || membershipGrantStatus === "none" || currentMembershipLevel === "free") {
      return {
        allowed: false,
        reason: getTrialEntitlementStatus(trialEntitlement, currentPlatform).expired ? "trialExpired" : "memberMissing",
      };
    }

    if (membershipGrantStatus === "expired") {
      return { allowed: false, reason: "memberExpired" };
    }

    if (!enabledPlatforms.includes(currentPlatform)) {
      return { allowed: false, reason: "platformNotSelected" };
    }

    return { allowed: true };
  }

  function openPermissionGate(result: DataSourcePermissionResult, action: DataSourcePermissionAction) {
    if (result.allowed) return false;
    setMembershipGateReason(result.reason ?? "memberMissing");
    setPendingPostPaymentAction(action === "run" ? "run" : null);
    setFlowView("membershipGate");
    return true;
  }

  function handleLoginPermissionCheck() {
    const permission = checkDataSourcePermission("login", currentSourcePlatform);
    return !openPermissionGate(permission, "login");
  }

  function handleStartFromConfig() {
    const permission = checkDataSourcePermission("run", currentSourcePlatform);
    if (openPermissionGate(permission, "run")) return;
    setFlowView("running");
  }

  function handleMembershipGatePrimary() {
    openSubscribe(pendingPostPaymentAction);
  }

  function handleLoginFailure(messageText: string) {
    setLoginFailureMessage(messageText);
    setAccountAdded(false);
    setConfigStep("account");
    setFlowView("config");
  }

  function renderConfigModal(nestedOverlay?: ReactNode) {
    return (
      <DataSourceConfigModal
        accountAdded={accountAdded}
        activeStep={configStep}
        configDraft={configDraft}
        currentMembershipName={getCommerceMembershipName(currentMembershipLevel)}
        currentMembershipLevel={currentMembershipLevel}
        dataSourceStatus={sourceAvailability}
        enabledPlatforms={enabledPlatforms}
        loginFailureMessage={loginFailureMessage}
        nestedOverlay={nestedOverlay}
        onClearLoginFailure={() => setLoginFailureMessage("")}
        onAddAccount={() => {
          setAccountAdded(false);
          setConfigStep("account");
        }}
        onConfigDraftChange={setConfigDraft}
        onLoginCheck={() => setFlowView("loginChecking")}
        onLoginPermissionCheck={handleLoginPermissionCheck}
        onClose={closeOverlay}
        onStart={handleStartFromConfig}
        onStepChange={setConfigStep}
        onSubscribe={() => openSubscribe()}
        subscribed={subscribed}
        trialEntitlement={trialEntitlement}
      />
    );
  }

  function handlePaymentDone(selection: CommercePaymentSelection) {
    setPaymentSelection(null);
    setPaymentErrorMessage("");
    setSubscribed(true);
    setCurrentMembershipLevel(selection.level);
    setMembershipGrantStatus("active");
    setEnabledPlatforms(selection.platforms);
    setPaymentSuccessVisible(true);
  }

  function handlePaymentSuccessFinish() {
    setPaymentSuccessVisible(false);
    const nextAction = pendingPostPaymentAction;
    setPendingPostPaymentAction(null);
    if (nextAction === "run") {
      setFlowView("running");
      return;
    }
    setFlowView("config");
  }

  const overlay =
    flowView === "connectionCenter" ? (
      <DataConnectionCenter onClose={closeOverlay} onUse={() => setFlowView("detail")} />
    ) : flowView === "detail" ? (
      <DataSourceDetailModal onClose={closeOverlay} onUse={() => setFlowView(sourceAuthorized ? "config" : "auth")} />
    ) : flowView === "auth" ? (
      <DataSourceAuthModal
        onCancel={() => setFlowView("detail")}
        onConfirm={() => {
          setSourceAuthorized(true);
          setFlowView("config");
        }}
      />
    ) : flowView === "config" ? (
      <>
        {renderConfigModal()}
      </>
    ) : flowView === "membershipGate" ? (
      renderConfigModal(
        <DataSourceCompactOverlay>
          <SourceMembershipGateModal
            reason={membershipGateReason}
            onClose={() => setFlowView("config")}
            onPrimary={handleMembershipGatePrimary}
          />
        </DataSourceCompactOverlay>
      )
    ) : flowView === "subscribe" ? (
      <>
        <SubscriptionPage
          key={subscribeSessionKey}
          currentMembershipLevel={currentMembershipLevel}
          currentMembershipName={getCommerceMembershipName(currentMembershipLevel)}
          enabledPlatforms={enabledPlatforms}
          nestedOverlay={
            <>
              {paymentSelection && (
                <DataSourceCompactOverlay>
                  <PaymentQrModal
                    errorMessage={paymentErrorMessage}
                    selection={paymentSelection}
                    onCancel={() => {
                      setPaymentSelection(null);
                      setPaymentErrorMessage("");
                    }}
                    onFail={() => setPaymentErrorMessage("支付失败，请重新扫码或重试支付")}
                    onPaid={() => handlePaymentDone(paymentSelection)}
                    onRetry={() => setPaymentErrorMessage("")}
                  />
                </DataSourceCompactOverlay>
              )}
              {paymentSuccessVisible && (
                <DataSourceCompactOverlay>
                  <PaymentSuccessModal nextAction={pendingPostPaymentAction} />
                </DataSourceCompactOverlay>
              )}
            </>
          }
          onBack={() => setFlowView("config")}
          onClose={closeOverlay}
          onPay={setPaymentSelection}
          subscribed={subscribed}
        />
      </>
    ) : flowView === "loginChecking" ? (
      renderConfigModal(
        <DataSourceCompactOverlay>
          <LoginCheckingModal onClose={closeOverlay} onFail={() => handleLoginFailure("账号或密码错误，请重新登录校验")} />
        </DataSourceCompactOverlay>
      )
    ) : flowView === "captcha" ? (
      renderConfigModal(
        <DataSourceCompactOverlay>
        <CaptchaModal
          onClose={closeOverlay}
          onFail={handleLoginFailure}
          onSubmit={() => {
            setAccountAdded(true);
            setLoginFailureMessage("");
            setConfigStep("params");
            setFlowView("config");
          }}
        />
        </DataSourceCompactOverlay>
      )
    ) : flowView === "running" ? (
      renderConfigModal(
        <DataSourceCompactOverlay>
          <RunningTaskModal
            onCollapse={() => setFlowView("config")}
            onFail={() => {
              setRunFailureReason("接口返回超时，部分商品排行数据未完成同步");
              setFlowView("runFailed");
            }}
          />
        </DataSourceCompactOverlay>
      )
    ) : flowView === "runFailed" ? (
      renderConfigModal(
        <DataSourceCompactOverlay>
          <SourceRunFailedModal
            reason={runFailureReason}
            onBack={() => setFlowView("config")}
            onRetry={() => setFlowView("running")}
            onSupport={() => message.info("已为你保留配置，可联系在线客服继续处理")}
          />
        </DataSourceCompactOverlay>
      )
    ) : flowView === "success" ? (
      renderConfigModal(
        <DataSourceCompactOverlay>
          <SourceSuccessModal onClose={closeOverlay} />
        </DataSourceCompactOverlay>
      )
    ) : null;

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1D2129",
          colorInfo: "#1D2129",
          colorLink: "#1D2129",
          controlItemBgActive: "#f2f7ff",
          controlItemBgHover: "#f7faff",
          borderRadius: 10,
        },
        components: {
          Select: {
            optionActiveBg: "#f7faff",
            optionSelectedBg: "#f2f7ff",
            optionSelectedColor: "#1D2129",
          },
        },
      }}
    >
      <div className="ding-ai-table-mock data-source-host">
        <LowFiAiTableArea
          entryMode="dataSource"
          pluginOpen={flowView !== "closed"}
          onOpenPlugin={() => undefined}
          onOpenDataSource={() => setFlowView("connectionCenter")}
          pluginPanel={null}
        />
        {overlay}
      </div>
    </ConfigProvider>
  );
}

function ResourceBadge({ group }: { group: ResourceGroup }) {
  return <span className={`resource-logo resource-logo-${group.key}`}>{group.logo}</span>;
}

function getSubscriptionStatusColor(status: SubscriptionItem["status"]) {
  if (status === "使用中") return "green";
  if (status === "未开始") return "blue";
  return "default";
}

function getCycleStatusColor(status: SaleCycle["status"]) {
  return status === "已上架" ? "green" : "default";
}

function createResourceKey(prefix: PackageType, name?: string) {
  const compactName = (name || "new").replace(/\s+/g, "").slice(0, 12);
  return `${prefix}-${Date.now().toString(36)}-${compactName.length}`;
}

function createResourceLogo(name?: string) {
  const compactName = (name || "").replace(/\s+/g, "");
  return (compactName.slice(0, 2) || "DX").toUpperCase();
}

function getCycleName(periodDays: number) {
  if (periodDays === 30) return "月卡";
  if (periodDays === 90) return "季卡";
  if (periodDays === 365) return "年卡";
  return `${periodDays}天`;
}

function ResourcePackageTable({
  groups,
  packageType,
  onEditPackage,
  onAddCycle,
  onEditCycle,
  actionsDisabled,
}: {
  groups: ResourceGroup[];
  packageType: PackageType;
  onEditPackage: (group: ResourceGroup) => void;
  onAddCycle: (group: ResourceGroup) => void;
  onEditCycle: (group: ResourceGroup, cycle: SaleCycle) => void;
  actionsDisabled: boolean;
}) {
  const [expandedKeys, setExpandedKeys] = useState<string[]>([groups[0]?.key].filter(Boolean));
  const noteId = packageType === "platform" ? "platformPackageTable" : "devicePackageTable";
  const firstAppIdGroupKey = packageType === "platform" ? groups.find((group) => group.appId)?.key : undefined;

  function toggleGroup(key: string) {
    setExpandedKeys((current) => (current.includes(key) ? current.filter((item) => item !== key) : [...current, key]));
  }

  return (
    <div className={`resource-table${actionsDisabled ? " is-actions-disabled" : ""}`}>
      <div className="resource-table-head">
        <span className="resource-head-title-with-marker">
          名称
          <InteractionMarker noteId={noteId} className="resource-table-head-marker" />
        </span>
        <span>资源 / 试用期</span>
        <span>操作</span>
      </div>
      {groups.map((group) => {
        const expanded = expandedKeys.includes(group.key);
        const connectorDetail = group.connectors?.join("\n") || "当前设备包无连接器摘要";
        const appIdPill = group.appId ? <span className="resource-id-pill">APPID {group.appId}</span> : null;
        const resourceMeta =
          packageType === "platform"
            ? (
                <>
                  <Tooltip title={<pre className="connector-tooltip">{connectorDetail}</pre>}>
                    <button className="resource-link" type="button">
                      连接器：{group.connectorCount || 0}
                      <InfoCircleOutlined />
                    </button>
                  </Tooltip>
                  <Tag color="orange">试用期 {group.trialDays}天</Tag>
                </>
              )
            : (
                <>
                  <span>{group.cloudProvider ? `${group.deviceType}｜${group.cloudProvider}` : group.deviceType}</span>
                  <Tag color="orange">试用期 {group.trialDays}天</Tag>
                </>
              );
        return (
          <div className="resource-group" key={group.key}>
            <div className="resource-parent-row">
              <button className={`resource-expand${expanded ? " expanded" : ""}`} type="button" onClick={() => toggleGroup(group.key)}>
                <DownOutlined />
              </button>
              <div className="resource-main-info">
                <ResourceBadge group={group} />
                <strong>{group.name}</strong>
                {packageType === "platform" && appIdPill && (
                  group.key === firstAppIdGroupKey ? (
                    <Annotated noteId="appIdGenerationRule" className="resource-appid-annotation">
                      {appIdPill}
                    </Annotated>
                  ) : appIdPill
                )}
              </div>
              <div className="resource-summary">
                {resourceMeta}
              </div>
              <div className="resource-actions">
                <Button size="small" disabled={actionsDisabled} onClick={() => onEditPackage(group)}>
                  编辑{packageType === "platform" ? "平台包" : "设备包"}配置
                </Button>
                <Button size="small" type="primary" icon={<PlusOutlined />} disabled={actionsDisabled} onClick={() => onAddCycle(group)}>
                  新增售卖周期
                </Button>
              </div>
            </div>
            {expanded && (
              <div className="resource-cycle-table">
                <div className="resource-cycle-head">
                  <span>套餐</span>
                  <span>售卖周期</span>
                  <span>原价</span>
                  <span>折扣</span>
                  <span>现价</span>
                  <span>状态</span>
                  <span>操作</span>
                </div>
                {group.cycles.length ? (
                  group.cycles.map((cycle, cycleIndex) => (
                    <div className="resource-cycle-row" key={cycle.key}>
                      <span>{cycle.name}</span>
                      <span>{cycle.period}</span>
                      <span>{cycle.originalPrice ? `¥${cycle.originalPrice.toLocaleString()}` : "-"}</span>
                      <span>{cycle.discount}</span>
                      <span>{cycle.price ? `¥${cycle.price.toLocaleString()}` : "-"}</span>
                      <span>
                        <Tag color={getCycleStatusColor(cycle.status)}>{cycle.status}</Tag>
                      </span>
                      <span className="resource-cycle-action">
                        <Button type="link" size="small" icon={<EditOutlined />} disabled={actionsDisabled} onClick={() => onEditCycle(group, cycle)}>
                          编辑
                        </Button>
                        {group.key === groups[0]?.key && cycleIndex === 0 && <InteractionMarker noteId="saleCycleEditEntry" className="cycle-edit-entry-marker" />}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="resource-cycle-empty">
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无售卖周期" />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      <div className="resource-pagination">
        <Pagination size="small" current={1} total={groups.length} pageSize={20} showSizeChanger pageSizeOptions={["20"]} showTotal={(total) => `共 ${total} 条`} onChange={() => undefined} />
      </div>
    </div>
  );
}

function formatMoney(value: number) {
  return `¥${value.toLocaleString()}`;
}

function formatSignedNumber(value: number) {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toLocaleString()}`;
}

function formatSignedMoney(value: number) {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}¥${Math.abs(value).toLocaleString()}`;
}

function formatSignedPercentPoint(value: number) {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(2)}个百分点`;
}

function getCompareClass(value: number) {
  if (value > 0) return "is-up";
  if (value < 0) return "is-down";
  return "";
}

function DataDashboardPage() {
  const [period, setPeriod] = useState<DashboardPeriod>("day");
  const [ecosystem, setEcosystem] = useState(dashboardDefaultEcosystem);
  const [dashboardDate, setDashboardDate] = useState<Dayjs | null>(dashboardToday);
  const dashboardSummary = dashboardPeriodSummaries[period];
  const periodMeta = dashboardPeriodMeta[period];
  const topPackage = dashboardPlatformRevenueRows[0];

  const tenantColumns: ColumnsType<DashboardTenantStatusRow> = [
    { title: <TableFieldTitle label="阶段" description="租户当前商业化阶段，同一租户只计入一个阶段。" />, dataIndex: "stage", width: 150 },
    { title: <TableFieldTitle label="租户数" description="当前生态下落入该阶段的租户数量。" />, dataIndex: "tenantCount", width: 120, render: (value: number) => value.toLocaleString() },
    { title: <TableFieldTitle label="占比" description="租户数 / 当前生态总租户数。" />, dataIndex: "ratio", width: 100 },
    { title: <TableFieldTitle label="统计口径" description="说明租户如何归类，避免试用和付费重复计算。" />, dataIndex: "definition" },
  ];

  const ecosystemColumns: ColumnsType<DashboardEcosystemRow> = [
    { title: <TableFieldTitle label="所属生态" description="租户和订单归属的生态。" />, dataIndex: "ecosystem", width: 100 },
    { title: <TableFieldTitle label="总租户" description="进入过商业化入口的租户数。" />, dataIndex: "totalTenants", width: 100, render: (value: number) => value.toLocaleString() },
    { title: <TableFieldTitle label="试用租户" description="当前仍处于试用期的租户数。" />, dataIndex: "trialTenants", width: 100, render: (value: number) => value.toLocaleString() },
    { title: <TableFieldTitle label="付费租户" description="当前有有效付费权益的租户数。" />, dataIndex: "paidTenants", width: 100, render: (value: number) => value.toLocaleString() },
    { title: <TableFieldTitle label="收入" description="所选周期内支付成功金额。" />, dataIndex: "revenue", width: 120, render: (value: number) => formatMoney(value) },
    { title: <TableFieldTitle label="成本" description="所选周期内执行资源成本。" />, dataIndex: "cost", width: 120, render: (value: number) => formatMoney(value) },
    { title: <TableFieldTitle label="毛利率" description="（收入 - 成本）/ 收入。" />, dataIndex: "grossMargin", width: 100 },
  ];

  const platformColumns: ColumnsType<DashboardPlatformRevenueRow> = [
    { title: "排名", dataIndex: "rank", width: 70 },
    { title: <TableFieldTitle label="套餐名称" description="资源管理中配置的平台包或设备包名称。" />, dataIndex: "packageName", width: 160 },
    { title: <TableFieldTitle label="套餐类型" description="平台包或设备包。" />, dataIndex: "packageType", width: 100 },
    { title: <TableFieldTitle label="支付订单数" description="当前周期内支付成功的订单数量。" />, dataIndex: "paidOrders", width: 110 },
    { title: <TableFieldTitle label="付费租户" description="购买过该套餐且权益仍有效的租户数量。" />, dataIndex: "paidTenants", width: 100 },
    { title: <TableFieldTitle label="收入" description="当前周期内该套餐支付成功金额。" />, dataIndex: "revenue", width: 120, render: (value: number) => formatMoney(value) },
    { title: <TableFieldTitle label="续费率" description="到期后继续购买同类套餐的租户占比。" />, dataIndex: "renewalRate", width: 100 },
    { title: <TableFieldTitle label="毛利率" description="扣除资源成本后的毛利率。" />, dataIndex: "grossMargin", width: 100 },
  ];

  const cloudColumns: ColumnsType<DashboardCloudCostRow> = [
    { title: <TableFieldTitle label="资源名称" description="云桌面、机器人令牌、云号等资源名称。" />, dataIndex: "resourceName", width: 160 },
    { title: <TableFieldTitle label="开通数" description="当前仍在占用的资源数量，已释放资源不计入。" />, dataIndex: "openedCount", width: 90 },
    { title: <TableFieldTitle label="使用率" description="有任务消耗的资源数 / 开通资源数。" />, dataIndex: "usageRate", width: 90 },
    { title: <TableFieldTitle label="闲置数" description="已开通但当前周期内未产生任务消耗的资源数。" />, dataIndex: "idleCount", width: 90 },
    { title: <TableFieldTitle label="成本" description="按资源实际占用估算的周期成本。" />, dataIndex: "cost", width: 110, render: (value: number) => formatMoney(value) },
    { title: <TableFieldTitle label="收入" description="设备包收入按资源类型拆分后的收入。" />, dataIndex: "revenue", width: 110, render: (value: number) => formatMoney(value) },
    { title: <TableFieldTitle label="毛利率" description="（收入 - 成本）/ 收入。" />, dataIndex: "grossMargin", width: 100 },
  ];

  const taskColumns: ColumnsType<DashboardTaskHealthRow> = [
    { title: <TableFieldTitle label="任务类型" description="所选周期内已结束任务的业务类型。" />, dataIndex: "taskType", width: 130 },
    { title: <TableFieldTitle label="任务数" description="所选周期内已结束的任务数量。" />, dataIndex: "taskCount", width: 100, render: (value: number) => value.toLocaleString() },
    { title: <TableFieldTitle label="成功率" description="成功任务数 / 已结束任务数，运行中任务不进入分母。" />, dataIndex: "successRate", width: 90 },
    { title: <TableFieldTitle label="失败数" description="已结束但失败的任务数量。" />, dataIndex: "failedCount", width: 90 },
    { title: <TableFieldTitle label="失败原因 Top" description="当前周期内出现最多的失败原因。" />, dataIndex: "failureReason", width: 160 },
    { title: <TableFieldTitle label="影响租户数" description="至少有 1 次该类型失败任务的租户数。" />, dataIndex: "affectedTenants", width: 110 },
  ];

  const followUpColumns: ColumnsType<DashboardFollowUpTenantRow> = [
    { title: <TableFieldTitle label="租户名称" description="需要运营跟进的租户。" />, dataIndex: "tenant", width: 170 },
    { title: <TableFieldTitle label="所属生态" description="租户归属生态，普通文本展示。" />, dataIndex: "ecosystem", width: 90 },
    { title: <TableFieldTitle label="当前状态" description="触发跟进的当前订阅、支付或成本状态。" />, dataIndex: "currentStatus", width: 130 },
    { title: <TableFieldTitle label="问题原因" description="为什么进入待跟进列表。" />, dataIndex: "reason", width: 230 },
    { title: <TableFieldTitle label="建议动作" description="运营下一步建议处理动作。" />, dataIndex: "suggestedAction", width: 230 },
    { title: <TableFieldTitle label="负责人" description="默认跟进负责人。" />, dataIndex: "owner", width: 100 },
  ];

  return (
    <div className="ecosystem-page data-dashboard-page">
      <div className="ecosystem-page-card">
        <div className="ecosystem-title-row dashboard-title-row">
          <h2 className="resource-title-with-marker">
            经营看板
            <InteractionMarker noteId="dataDashboardOverview" className="resource-title-marker" />
          </h2>
          <Space size={10} wrap>
            <Segmented
              value={period}
              options={[
                { label: "日", value: "day" },
                { label: "周", value: "week" },
                { label: "月", value: "month" },
              ]}
              onChange={(value) => {
                setPeriod(value as DashboardPeriod);
                setDashboardDate(dashboardToday);
              }}
            />
            <Select
              className="dashboard-ecosystem-select"
              value={ecosystem}
              onChange={setEcosystem}
              options={[
                { label: "钉钉", value: "钉钉" },
                { label: "飞书（暂未开放）", value: "飞书", disabled: true },
                { label: "企微（暂未开放）", value: "企微", disabled: true },
                { label: "联通（暂未开放）", value: "联通", disabled: true },
                { label: "电信（暂未开放）", value: "电信", disabled: true },
              ]}
            />
            <DatePicker
              key={period}
              picker={period === "day" ? "date" : period}
              value={dashboardDate}
              onChange={(value) => setDashboardDate(value || dashboardToday)}
              allowClear={false}
            />
            <Tooltip title="刷新看板">
              <Button icon={<ReloadOutlined />} aria-label="刷新看板" />
            </Tooltip>
          </Space>
        </div>

        <div className="dashboard-metric-grid">
          <Card className="dashboard-metric-card">
            <Statistic title="租户规模" value={dashboardSummary.tenantTotal} suffix="个" prefix={<UserOutlined />} />
            <span className={`dashboard-metric-compare ${getCompareClass(dashboardSummary.tenantTotalCompare)}`}>
              {periodMeta.compareLabel} {formatSignedNumber(dashboardSummary.tenantTotalCompare)}
            </span>
            <div className="dashboard-metric-lines">
              <span>{periodMeta.currentLabel}新增租户 {dashboardSummary.newTenants.toLocaleString()}（{periodMeta.compareLabel} {formatSignedNumber(dashboardSummary.newTenantsCompare)}）</span>
              <span>有效 {dashboardSummary.activeTenants.toLocaleString()}</span>
              <span>付费 {dashboardSummary.paidTenants.toLocaleString()}</span>
              <span>试用 {dashboardSummary.trialTenants.toLocaleString()}</span>
            </div>
          </Card>
          <Card className="dashboard-metric-card">
            <Statistic title="转化效率" value={dashboardSummary.trialConversionRate} precision={2} suffix="%" />
            <span className={`dashboard-metric-compare ${getCompareClass(dashboardSummary.trialConversionCompare)}`}>
              {periodMeta.compareLabel} {formatSignedPercentPoint(dashboardSummary.trialConversionCompare)}
            </span>
            <div className="dashboard-metric-lines">
              <span>整体付费率 {dashboardSummary.paidRate}%（{periodMeta.compareLabel} {formatSignedPercentPoint(dashboardSummary.paidRateCompare)}）</span>
              <span>支付成功率 {dashboardSummary.paymentSuccessRate}%（{periodMeta.compareLabel} {formatSignedPercentPoint(dashboardSummary.paymentSuccessCompare)}）</span>
              <span>到期未付费 {dashboardSummary.expiredTrialUnpaid.toLocaleString()}（{periodMeta.compareLabel} {formatSignedNumber(dashboardSummary.expiredTrialCompare)}）</span>
            </div>
          </Card>
          <Card className="dashboard-metric-card">
            <Statistic title="收入表现" value={dashboardSummary.periodRevenue} prefix="¥" />
            <span className={`dashboard-metric-compare ${getCompareClass(dashboardSummary.revenueCompare)}`}>
              {periodMeta.compareLabel} {formatSignedMoney(dashboardSummary.revenueCompare)}
            </span>
            <div className="dashboard-metric-lines">
              <span>{periodMeta.currentLabel}支付订单 {dashboardSummary.paidOrders.toLocaleString()}（{periodMeta.compareLabel} {formatSignedNumber(dashboardSummary.paidOrdersCompare)}）</span>
              <span>客单价 {formatMoney(dashboardSummary.arpu)}（{periodMeta.compareLabel} {formatSignedMoney(dashboardSummary.arpuCompare)}）</span>
            </div>
          </Card>
          <Card className="dashboard-metric-card">
            <Statistic title="成本利润" value={dashboardSummary.grossMargin} precision={1} suffix="%" prefix={<DesktopOutlined />} />
            <span className={`dashboard-metric-compare ${getCompareClass(dashboardSummary.grossMarginCompare)}`}>
              {periodMeta.compareLabel} {formatSignedPercentPoint(dashboardSummary.grossMarginCompare)}
            </span>
            <div className="dashboard-metric-lines">
              <span>{periodMeta.currentLabel}成本 {formatMoney(dashboardSummary.periodResourceCost)}（{periodMeta.compareLabel} {formatSignedMoney(dashboardSummary.resourceCostCompare)}）</span>
              <span>毛利 {formatMoney(dashboardSummary.grossProfit)}（{periodMeta.compareLabel} {formatSignedMoney(dashboardSummary.grossProfitCompare)}）</span>
            </div>
          </Card>
          <Card className="dashboard-metric-card">
            <Statistic title="交付质量" value={dashboardSummary.successRate} precision={1} suffix="%" prefix={<CheckCircleOutlined />} />
            <span className={`dashboard-metric-compare ${getCompareClass(dashboardSummary.successRateCompare)}`}>
              {periodMeta.compareLabel} {formatSignedPercentPoint(dashboardSummary.successRateCompare)}
            </span>
            <div className="dashboard-metric-lines">
              <span>{periodMeta.currentLabel}任务 {dashboardSummary.periodTaskCount.toLocaleString()}（{periodMeta.compareLabel} {formatSignedNumber(dashboardSummary.taskCountCompare)}）</span>
              <span>失败 {dashboardSummary.failedTaskCount.toLocaleString()}（{periodMeta.compareLabel} {formatSignedNumber(dashboardSummary.failedTaskCompare)}）</span>
              <span>平均耗时 {dashboardSummary.avgDuration}（{periodMeta.compareLabel} {dashboardSummary.avgDurationCompare}）</span>
            </div>
          </Card>
        </div>

        <div className="dashboard-section-grid">
          <Card
            className="dashboard-analysis-card"
            title={
              <span className="dashboard-card-title">
                生态经营概览
                <InteractionMarker noteId="dataDashboardEcosystemOverview" />
              </span>
            }
          >
            <Table<DashboardEcosystemRow>
              columns={ecosystemColumns}
              dataSource={dashboardEcosystemRows}
              pagination={false}
              rowKey="key"
              size="small"
            />
          </Card>
          <Card
            className="dashboard-analysis-card"
            title={
              <span className="dashboard-card-title">
                租户规模与转化
                <InteractionMarker noteId="dataDashboardTenantFunnel" />
              </span>
            }
          >
            <Table<DashboardTenantStatusRow>
              columns={tenantColumns}
              dataSource={dashboardTenantRows}
              pagination={false}
              rowKey="key"
              size="small"
            />
          </Card>
        </div>

        <Card
          className="dashboard-analysis-card dashboard-wide-card"
          title={
            <span className="dashboard-card-title">
              套餐收入排行
              <InteractionMarker noteId="dataDashboardPackageRank" />
            </span>
          }
          extra={<Text type="secondary">最高：{topPackage.packageName} {formatMoney(topPackage.revenue)}</Text>}
        >
          <Table<DashboardPlatformRevenueRow>
            columns={platformColumns}
            dataSource={dashboardPlatformRevenueRows}
            pagination={false}
            rowKey="key"
            size="small"
          />
        </Card>

        <div className="dashboard-section-grid dashboard-bottom-grid">
          <Card
            className="dashboard-analysis-card"
            title={
              <span className="dashboard-card-title">
                资源成本分析
                <InteractionMarker noteId="dataDashboardCloudCost" />
              </span>
            }
          >
            <Table<DashboardCloudCostRow>
              columns={cloudColumns}
              dataSource={dashboardCloudRows}
              pagination={false}
              rowKey="key"
              size="small"
            />
          </Card>
          <Card
            className="dashboard-analysis-card"
            title={
              <span className="dashboard-card-title">
                任务健康度
                <InteractionMarker noteId="dataDashboardTaskHealth" />
              </span>
            }
          >
            <div className="dashboard-success-rate">
              <Statistic title="整体成功率" value={dashboardSummary.successRate} precision={1} suffix="%" />
              <Progress percent={dashboardSummary.successRate} strokeColor="#ff5b2e" size="small" />
            </div>
            <Table<DashboardTaskHealthRow>
              className="dashboard-task-table"
              columns={taskColumns}
              dataSource={dashboardTaskRows}
              pagination={false}
              rowKey="key"
              size="small"
            />
          </Card>
        </div>

        <Card
          className="dashboard-analysis-card dashboard-wide-card"
          title={
            <span className="dashboard-card-title">
              待跟进租户
              <InteractionMarker noteId="dataDashboardFollowUpTenants" />
            </span>
          }
        >
          <Table<DashboardFollowUpTenantRow>
            columns={followUpColumns}
            dataSource={dashboardFollowUpRows}
            pagination={{ pageSize: 5, showSizeChanger: false }}
            rowKey="key"
            size="small"
          />
        </Card>
      </div>
    </div>
  );
}

function ResourceManagementPage() {
  const resourceParams = new URLSearchParams(window.location.search);
  const initialResourceTab = resourceParams.get("resourceTab") === "device" ? "device" : "platform";
  const initialCommercialEnabled = resourceParams.get("commercial") !== "off";
  const [packageType, setPackageType] = useState<PackageType>(initialResourceTab);
  const [commercialEnabled, setCommercialEnabled] = useState(initialCommercialEnabled);
  const [modalKind, setModalKind] = useState<ResourceModalKind>(null);
  const [currentResource, setCurrentResource] = useState<ResourceGroup>(resourcePlatformGroups[0]);
  const [currentCycle, setCurrentCycle] = useState<SaleCycle | null>(null);
  const [editingResourceKey, setEditingResourceKey] = useState<string | null>(null);
  const [platformGroups, setPlatformGroups] = useState<ResourceGroup[]>(resourcePlatformGroups);
  const [deviceGroups, setDeviceGroups] = useState<ResourceGroup[]>(resourceDeviceGroups);
  const [salePrice, setSalePrice] = useState(299);
  const [form] = Form.useForm();
  const selectedDeviceType = Form.useWatch("deviceType", form);
  const watchedPeriodDays = Form.useWatch("periodDays", form);
  const saleCycleNamePreview = typeof watchedPeriodDays === "number" && watchedPeriodDays > 0 ? getCycleName(watchedPeriodDays) : "-";
  const activeGroups = packageType === "platform" ? platformGroups : deviceGroups;

  function getGroupsByType(type: PackageType) {
    return type === "platform" ? platformGroups : deviceGroups;
  }

  function updateGroupsByType(type: PackageType, updater: (groups: ResourceGroup[]) => ResourceGroup[]) {
    if (type === "platform") {
      setPlatformGroups(updater);
      return;
    }
    setDeviceGroups(updater);
  }

  function openPackageModal(group?: ResourceGroup, forcedPackageType: PackageType = packageType) {
    const kind = forcedPackageType === "platform" ? "platformPackage" : "devicePackage";
    const fallbackGroup = getGroupsByType(forcedPackageType)[0] || (forcedPackageType === "platform" ? resourcePlatformGroups[0] : resourceDeviceGroups[0]);
    setModalKind(kind);
    setCurrentResource(group || fallbackGroup);
    setCurrentCycle(null);
    setEditingResourceKey(group?.key || null);
    form.resetFields();
    if (kind === "platformPackage") {
      form.setFieldsValue({
        platformType: "电商取数宝",
        platform: group?.name,
        connectors: group?.connectors || [],
        platformName: group?.name,
        trialDays: group?.trialDays,
      });
    } else {
      form.setFieldsValue({
        deviceName: group?.name,
        deviceType: group?.deviceType,
        cloudProvider: group?.cloudProvider,
        trialDays: group?.trialDays,
      });
    }
  }

  function openCycleModal(group: ResourceGroup, cycle?: SaleCycle) {
    setCurrentResource(group);
    setCurrentCycle(cycle || null);
    setEditingResourceKey(group.key);
    setModalKind("saleCycle");
    setSalePrice(cycle?.price || 0);
    form.resetFields();
    form.setFieldsValue(
      cycle
        ? {
            periodDays: Number.parseInt(cycle.period, 10),
            originalPrice: cycle.originalPrice,
            discount: Number.parseFloat(cycle.discount),
            status: cycle.status === "已上架",
          }
        : { status: true },
    );
  }

  function handleFormValuesChange(changedValues: Partial<ResourceFormValues>, values: ResourceFormValues) {
    if (modalKind === "devicePackage" && "deviceType" in changedValues && values.deviceType !== "云桌面") {
      form.setFieldValue("cloudProvider", undefined);
    }
    if (modalKind !== "saleCycle") return;
    const original = Number(values.originalPrice || 0);
    const discount = Number(values.discount || 0);
    setSalePrice(original > 0 && discount > 0 ? Math.round((original * discount) / 10) : 0);
  }

  async function handleModalSave() {
    try {
      const values = (await form.validateFields()) as ResourceFormValues;

      if (modalKind === "saleCycle") {
        const periodDays = Number(values.periodDays);
        const originalPrice = Number(values.originalPrice);
        const discount = Number(values.discount);
        const duplicate = currentResource.cycles.some((cycle) => cycle.key !== currentCycle?.key && cycle.period === `${periodDays}天`);

        if (duplicate) {
          form.setFields([{ name: "periodDays", errors: ["该资源下已存在相同售卖周期"] }]);
          return;
        }

        const nextCycle: SaleCycle = {
          key: currentCycle?.key || `${currentResource.key}-${periodDays}-${Date.now().toString(36)}`,
          name: getCycleName(periodDays),
          period: `${periodDays}天`,
          originalPrice,
          discount: `${discount}折`,
          price: Math.round((originalPrice * discount) / 10),
          status: values.status === false ? "未上架" : "已上架",
        };

        updateGroupsByType(currentResource.type, (groups) =>
          groups.map((group) =>
            group.key === currentResource.key
              ? {
                  ...group,
                  cycles: currentCycle ? group.cycles.map((cycle) => (cycle.key === currentCycle.key ? nextCycle : cycle)) : [...group.cycles, nextCycle],
                }
              : group,
          ),
        );
      }

      if (modalKind === "platformPackage") {
        const connectors = values.connectors || [];
        const nextGroup: ResourceGroup = {
          ...currentResource,
          key: editingResourceKey || createResourceKey("platform", values.platformName),
          logo: editingResourceKey ? currentResource.logo : createResourceLogo(values.platformName),
          name: values.platformName || values.platform || currentResource.name,
          appId: currentResource.appId || `qsb-${Date.now().toString(36)}-001`,
          connectorCount: connectors.length,
          connectors,
          trialDays: Number(values.trialDays),
          type: "platform",
          cycles: editingResourceKey ? currentResource.cycles : [],
        };
        updateGroupsByType("platform", (groups) => (editingResourceKey ? groups.map((group) => (group.key === editingResourceKey ? nextGroup : group)) : [nextGroup, ...groups]));
      }

      if (modalKind === "devicePackage") {
        const nextGroup: ResourceGroup = {
          ...currentResource,
          key: editingResourceKey || createResourceKey("device", values.deviceName),
          logo: editingResourceKey ? currentResource.logo : createResourceLogo(values.deviceName),
          name: values.deviceName || currentResource.name,
          trialDays: Number(values.trialDays),
          type: "device",
          deviceType: values.deviceType || currentResource.deviceType,
          cloudProvider: values.deviceType === "云桌面" ? values.cloudProvider : undefined,
          cycles: editingResourceKey ? currentResource.cycles : [],
        };
        updateGroupsByType("device", (groups) => (editingResourceKey ? groups.map((group) => (group.key === editingResourceKey ? nextGroup : group)) : [nextGroup, ...groups]));
      }

      message.success("保存成功");
      setModalKind(null);
      setCurrentCycle(null);
      setEditingResourceKey(null);
      form.resetFields();
    } catch {
      message.error("请先补全必填项");
    }
  }

  function closeResourceModal() {
    setModalKind(null);
    setCurrentCycle(null);
    setEditingResourceKey(null);
    form.resetFields();
  }

  function handleModalDelete() {
    if (!modalKind) return;
    const deleteCycle = modalKind === "saleCycle" && currentCycle;
    const deletePackage = (modalKind === "platformPackage" || modalKind === "devicePackage") && editingResourceKey;

    if (!deleteCycle && !deletePackage) return;

    const packageName = modalKind === "devicePackage" ? "设备包" : "平台包";
    Modal.confirm({
      title: deleteCycle ? "确定删除该售卖周期？" : editingResourceKey ? `确定删除该${packageName}？` : "确定删除当前新增配置？",
      content: deleteCycle
        ? "删除后，该售卖周期会立即从前台购买和续费入口移除，用户不能再按该周期下单；已支付订单和已生效权益不自动回滚。"
        : "删除后，该资源包及其所有售卖周期会立即从前台购买和续费入口移除，新购买和续费都不可再选择该资源；已购租户权益不自动回滚，请确认没有未处理订单后再删除。",
      okText: "确定删除",
      cancelText: "取消",
      okButtonProps: { danger: true },
      onOk: () => {
        if (deleteCycle && currentCycle) {
          updateGroupsByType(currentResource.type, (groups) =>
            groups.map((group) => (group.key === currentResource.key ? { ...group, cycles: group.cycles.filter((cycle) => cycle.key !== currentCycle.key) } : group)),
          );
          message.success("售卖周期已删除");
        }

        if (deletePackage && editingResourceKey) {
          const targetType: PackageType = modalKind === "devicePackage" ? "device" : "platform";
          updateGroupsByType(targetType, (groups) => groups.filter((group) => group.key !== editingResourceKey));
          message.success(`${targetType === "device" ? "设备包" : "平台包"}已删除`);
        }

        closeResourceModal();
      },
    });
  }

  function handleCommercialChange(checked: boolean) {
    if (checked) {
      setCommercialEnabled(true);
      message.success("商业化开启成功");
      return;
    }
    Modal.confirm({
      title: "确定关闭商业化？",
      content: "关闭后，当前生态前台购买与续费入口将隐藏，已购订阅与后台配置不受影响。",
      okText: "确定",
      cancelText: "取消",
      onOk: () => {
        setCommercialEnabled(false);
        message.success("商业化关闭成功");
      },
    });
  }

  useEffect(() => {
    const modal = new URLSearchParams(window.location.search).get("resourceModal");
    if (modal === "newDevicePackage") {
      setPackageType("device");
      openPackageModal(undefined, "device");
    }
    if (modal === "newPlatformPackage") {
      setPackageType("platform");
      openPackageModal(undefined, "platform");
    }
    if (modal === "devicePackage") {
      setPackageType("device");
      openPackageModal(resourceDeviceGroups[0], "device");
    }
    if (modal === "platformPackage") {
      setPackageType("platform");
      openPackageModal(resourcePlatformGroups[0], "platform");
    }
    if (modal === "saleCycle") {
      openCycleModal(packageType === "device" ? resourceDeviceGroups[0] : resourcePlatformGroups[0]);
    }
    if (modal === "editCycle") {
      openCycleModal(resourcePlatformGroups[0], resourcePlatformGroups[0].cycles[0]);
    }
  }, []);

  const modalTitle =
    modalKind === "saleCycle"
      ? currentCycle
        ? "编辑售卖周期"
        : "新增售卖周期"
      : modalKind === "devicePackage"
        ? editingResourceKey
          ? "编辑设备包配置"
          : "新增设备包"
        : editingResourceKey
          ? "编辑平台包配置"
          : "新增平台包";
  const shouldShowDeleteButton = Boolean((modalKind === "saleCycle" && currentCycle) || ((modalKind === "platformPackage" || modalKind === "devicePackage") && editingResourceKey));
  const modalFooter = modalKind ? (
    <div className="resource-modal-footer">
      <div>
        {shouldShowDeleteButton && (
          <Annotated noteId="packageDeleteRule" className="resource-delete-annotation">
            <Button danger icon={<DeleteOutlined />} onClick={handleModalDelete}>
              删除
            </Button>
          </Annotated>
        )}
      </div>
      <div className="resource-footer-annotation">
        {modalKind !== "saleCycle" && <InteractionMarker noteId="packageDialog" className="resource-footer-marker" />}
        <Space>
          <Button onClick={closeResourceModal}>取消</Button>
          <Button type="primary" onClick={handleModalSave}>
            保存
          </Button>
        </Space>
      </div>
    </div>
  ) : null;

  return (
    <div className="ecosystem-page">
      <div className="ecosystem-page-card">
        <div className="ecosystem-title-row">
          <h2 className="resource-title-with-marker">
            资源管理
            <InteractionMarker noteId="resourceOverview" className="resource-title-marker" />
          </h2>
        </div>
        <div className="ecosystem-tabs-row">
          <div className="ecosystem-tabs ecosystem-tabs-with-marker">
            <button className="active" type="button">
              钉钉
            </button>
            {["飞书", "企微", "联通", "电信"].map((item) => (
              <Tooltip title="暂未开放" key={item}>
                <button className="disabled" type="button" disabled>
                  {item}
                </button>
              </Tooltip>
            ))}
            <InteractionMarker noteId="resourceEcologyData" className="ecosystem-tabs-marker" />
          </div>
          <Annotated noteId="commercialSwitch" className="commercial-switch-annotation">
            <div className="commercial-switch">
              <span>商业化</span>
              <Switch checked={commercialEnabled} onChange={handleCommercialChange} />
            </div>
          </Annotated>
        </div>
        <div className="resource-toolbar">
          <div className="resource-package-tabs">
            <button className={packageType === "platform" ? "active" : ""} type="button" onClick={() => setPackageType("platform")}>
              平台包
            </button>
            <button className={packageType === "device" ? "active" : ""} type="button" onClick={() => setPackageType("device")}>
              设备包
            </button>
          </div>
          <Annotated noteId="resourceCreateEntry" className="resource-create-annotation">
            <Button type="primary" icon={<PlusOutlined />} disabled={!commercialEnabled} onClick={() => openPackageModal()}>
              新增{packageType === "platform" ? "平台包" : "设备包"}
            </Button>
          </Annotated>
        </div>
        <ResourcePackageTable
          key={packageType}
          groups={activeGroups}
          packageType={packageType}
          onEditPackage={openPackageModal}
          onAddCycle={openCycleModal}
          onEditCycle={openCycleModal}
          actionsDisabled={!commercialEnabled}
        />
      </div>
      <Modal
        className="resource-config-modal"
        title={modalTitle}
        open={Boolean(modalKind)}
        onCancel={closeResourceModal}
        footer={modalFooter}
        width={520}
        forceRender
      >
        <div className="annotated-control resource-modal-annotation">
          <Form form={form} layout="vertical" className="resource-modal-form" onValuesChange={handleFormValuesChange}>
            {modalKind === "platformPackage" && (
              <>
                <Annotated noteId="packageSourceFields" className="resource-source-fields-annotation">
                  <div className="resource-source-field-group">
                    <Form.Item label="平台类型" name="platformType" rules={[{ required: true, message: "请选择平台类型" }]}>
                      <Select
                        showSearch
                        optionFilterProp="label"
                        options={["电商取数宝", "跨境取数宝", "跨境取数宝（新）", "网银取数宝", "餐饮取数宝", "手机取数宝"].map((value) => ({ value, label: value }))}
                      />
                    </Form.Item>
                    <Form.Item label="平台名称" name="platform" rules={[{ required: true, message: "请选择平台名称" }]}>
                      <Select
                        showSearch
                        optionFilterProp="label"
                        options={["生意参谋", "小红书", "天猫", "阿里妈妈", "京东商智（品牌版）", "抖店商家后台"].map((value) => ({ value, label: value }))}
                      />
                    </Form.Item>
                    <Annotated noteId="connectorSelectRule" className="resource-connector-select-annotation">
                      <Form.Item label="关联连接器" name="connectors" rules={[{ type: "array", min: 1, required: true, message: "请选择至少 1 个连接器" }]}>
                        <Select
                          mode="multiple"
                          showSearch
                          optionFilterProp="label"
                          maxTagCount={3}
                          maxTagPlaceholder={(omittedValues) => `+ ${omittedValues.length} 个`}
                          placeholder="搜索并选择连接器"
                          options={defaultConnectors.map((value) => ({ value, label: value }))}
                        />
                      </Form.Item>
                    </Annotated>
                  </div>
                </Annotated>
                <Form.Item label="平台名称" name="platformName" rules={[{ required: true, message: "请输入平台名称" }]}>
                  <Input placeholder="请输入平台名称" />
                </Form.Item>
                <Form.Item label="平台 Logo">
                  <Upload beforeUpload={() => false} maxCount={1}>
                    <Button icon={<UploadOutlined />}>上传图片</Button>
                  </Upload>
                  <div className="form-help-text">支持 PNG/JPG，单张，建议 64×64</div>
                </Form.Item>
              </>
            )}
            {modalKind === "devicePackage" && (
              <>
                <Form.Item label="设备名称" name="deviceName" rules={[{ required: true, message: "请输入设备名称" }]}>
                  <Input placeholder="请输入对外的设备名称" />
                </Form.Item>
                <Annotated noteId="deviceTypeCascade" className="resource-device-type-annotation">
                  <div className="device-type-field-group">
                    <Form.Item label="设备类型" name="deviceType" rules={[{ required: true, message: "请选择设备类型" }]}>
                      <Select options={["机器人令牌", "云桌面"].map((value) => ({ value, label: value }))} />
                    </Form.Item>
                    {selectedDeviceType === "云桌面" && (
                      <Form.Item label="云电脑类型" name="cloudProvider" rules={[{ required: true, message: "请选择云电脑类型" }]}>
                        <Select options={["无影云", "火山云", "天翼云"].map((value) => ({ value, label: value }))} />
                      </Form.Item>
                    )}
                  </div>
                </Annotated>
              </>
            )}
            {modalKind !== "saleCycle" && (
              <Form.Item
                label="试用天数"
                name="trialDays"
                rules={[
                  { required: true, message: "请输入试用天数" },
                  { type: "number", min: 0, max: 365, message: "试用天数必须为 0-365 的整数" },
                ]}
              >
                <InputNumber min={0} max={365} precision={0} suffix="天" style={{ width: "100%" }} />
              </Form.Item>
            )}
            {modalKind === "saleCycle" && (
              <>
                <Annotated noteId="saleCycleDialog" className="sale-cycle-context-annotation">
                  <div className="modal-resource-context">
                    <div className="resource-main-info modal-resource-main-info">
                      <ResourceBadge group={currentResource} />
                      <strong>{currentResource.name}</strong>
                      {currentResource.type === "platform" && currentResource.appId && <span className="resource-id-pill">APPID {currentResource.appId}</span>}
                    </div>
                    <span className="modal-resource-summary">
                      {currentResource.type === "platform"
                        ? `连接器：${currentResource.connectorCount || 0}｜试用期 ${currentResource.trialDays}天`
                        : `${currentResource.cloudProvider ? `${currentResource.deviceType}｜${currentResource.cloudProvider}` : currentResource.deviceType}｜试用期 ${currentResource.trialDays}天`}
                    </span>
                  </div>
                </Annotated>
                <Annotated noteId="saleCycleFieldRule" className="sale-cycle-fields-annotation">
                  <div>
                    <div className="sale-cycle-name-preview">
                      <span>套餐</span>
                      <strong>{saleCycleNamePreview}</strong>
                    </div>
                    <Form.Item
                      label="售卖周期"
                      name="periodDays"
                      rules={[
                        { required: true, message: "请输入售卖周期" },
                        { type: "number", min: 1, message: "售卖周期必须为正整数" },
                      ]}
                    >
                      <InputNumber min={1} precision={0} suffix="天" style={{ width: "100%" }} />
                    </Form.Item>
                    <div className="sale-form-grid">
                      <Form.Item
                        label="原价"
                        name="originalPrice"
                        rules={[
                          { required: true, message: "请输入原价" },
                          { type: "number", min: 1, message: "原价必须大于 0" },
                        ]}
                      >
                        <InputNumber min={1} prefix="¥" style={{ width: "100%" }} />
                      </Form.Item>
                      <Form.Item
                        label="折扣"
                        name="discount"
                        rules={[
                          { required: true, message: "请输入折扣" },
                          { type: "number", min: 0.1, max: 10, message: "折扣必须为 0.1-10" },
                        ]}
                      >
                        <InputNumber min={0.1} max={10} step={0.1} suffix="折" style={{ width: "100%" }} />
                      </Form.Item>
                    </div>
                    <div className="sale-price-preview">
                      <span>现价（自动计算）</span>
                      <strong>{salePrice > 0 ? `¥${salePrice}` : "-"}</strong>
                    </div>
                  </div>
                </Annotated>
                <Annotated noteId="saleCycleStatusRule" className="sale-cycle-status-annotation">
                  <Form.Item label="上架状态" name="status" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Annotated>
              </>
            )}
          </Form>
        </div>
      </Modal>
    </div>
  );
}

function TableFieldTitle({ label, description }: { label: string; description: string }) {
  return (
    <span className="table-field-title">
      {label}
      <Tooltip title={description}>
        <InfoCircleOutlined />
      </Tooltip>
    </span>
  );
}

function TenantManagementPage() {
  const [compensationTenant, setCompensationTenant] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<TenantAuthRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<TenantAuthRecord | null>(null);
  const [editConnectorScope, setEditConnectorScope] = useState<string[]>([]);
  const [editAuthEcology, setEditAuthEcology] = useState("取数宝");
  const [editOrderNo, setEditOrderNo] = useState("");
  const [editAuthMemberStatus, setEditAuthMemberStatus] = useState("未开通");
  const [editAuthMemberVersion, setEditAuthMemberVersion] = useState<string | undefined>();
  const [addAuthOpen, setAddAuthOpen] = useState(false);
  const [columnWidths, setColumnWidths] = useState<Record<TenantColumnKey, number>>(defaultTenantColumnWidths);
  const ecosystemTabs = ["取数宝", "钉钉", "飞书", "企微", "联通", "电信"];
  const addAuthEcologyOptions = ["取数宝", "钉钉", "飞书", "企微"];
  const commercialEcosystems = ["钉钉", "飞书", "企微"];
  const [activeEcology, setActiveEcology] = useState("取数宝");
  const [newAuthEcology, setNewAuthEcology] = useState("取数宝");
  const [newAuthMemberStatus, setNewAuthMemberStatus] = useState("未开通");
  const [newAuthMemberVersion, setNewAuthMemberVersion] = useState<string | undefined>();
  const [tenantPage, setTenantPage] = useState(1);
  const cloudResourceProducts = ["机器人令牌", "机器人", "联通虚拟云号", "云桌面机器人"];
  const getAuthProductOptionsByEcology = (ecology: string) => ["电商连接器", "跨境连接器", "网银连接器", "餐饮连接器", "手机连接器", "机器人令牌", "联通虚拟云号", "云桌面机器人"].filter((product) => ecology !== "钉钉" || product !== "联通虚拟云号");
  const authProductOptions = getAuthProductOptionsByEcology(activeEcology);
  const addAuthProductOptions = getAuthProductOptionsByEcology(newAuthEcology);
  const editAuthProductOptions = getAuthProductOptionsByEcology(editAuthEcology);
  const tenantAuthRows: TenantAuthRecord[] = subscriptionTenants
    .flatMap((tenant) =>
      tenant.subscriptions.length
        ? tenant.subscriptions.map((item) => ({
            key: `${tenant.key}-${item.key}`,
            tenantName: tenant.tenant,
            ecology: tenant.ecology,
            product: item.product,
            tags: item.tags,
            period: item.period,
            expireAt: item.period.split(" ~ ")[1] || item.period,
            authType: "电商 saas",
            updater: item.source.includes("人工") ? "森森" : "系统",
            updateTime: "2026-05-06 15:30:00",
            creator: item.source.includes("人工") ? "森森" : "系统",
            createTime: "2026-05-06 15:30:00",
            status: item.status,
            orderNo: item.orderNo,
            commercialEntitlement: tenant.commercialEntitlement,
          }))
        : [],
    );
  const visibleTenantAuthRows = tenantAuthRows.filter((row) => row.ecology === activeEcology).map((row, index) => ({ ...row, index: index + 1 }));
  const tenantSelectOptions = Array.from(new Set(tenantAuthRows.map((row) => row.tenantName).filter((name): name is string => Boolean(name)))).map((value) => ({ label: value, value }));
  const showCommercialColumns = commercialEcosystems.includes(activeEcology);
  const showNewAuthMemberFields = commercialEcosystems.includes(newAuthEcology);
  const newAuthMemberVersionDisabled = newAuthMemberStatus === "未开通" || newAuthMemberStatus === "试用中";
  const showEditAuthMemberFields = commercialEcosystems.includes(editAuthEcology);
  const editAuthMemberVersionDisabled = editAuthMemberStatus === "未开通" || editAuthMemberStatus === "试用中";

  const getMemberVersionLabel = (entitlement: SubscriptionTenant["commercialEntitlement"]) => {
    if (!entitlement) return "-";
    return entitlement.memberStatus === "试用中" ? "-" : entitlement.memberName;
  };

  useEffect(() => {
    setTenantPage(1);
    setNewAuthEcology(addAuthEcologyOptions.includes(activeEcology) ? activeEcology : "取数宝");
    setNewAuthMemberStatus("未开通");
    setNewAuthMemberVersion(undefined);
  }, [activeEcology]);

  const startColumnResize = (key: TenantColumnKey, minWidth: number) => (event: ReactMouseEvent<HTMLSpanElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startWidth = columnWidths[key];
    const onMouseMove = (moveEvent: MouseEvent) => {
      const nextWidth = Math.max(minWidth, startWidth + moveEvent.clientX - startX);
      setColumnWidths((current) => ({ ...current, [key]: nextWidth }));
    };
    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const renderColumnTitle = (label: string, key: TenantColumnKey, minWidth = 56) => (
    <span className="tenant-resizable-title">
      <span>{label}</span>
      <span className="tenant-column-resize-handle" onMouseDown={startColumnResize(key, minWidth)} />
    </span>
  );

  const renderCommercialEntitlementCell = (_: unknown, record: TenantAuthRecord) => {
    if (!record.commercialEntitlement) return <span className="auth-muted-cell">-</span>;
    const entitlement = record.commercialEntitlement;

    return (
      <div className="tenant-commercial-summary">
        <span>
          <span>{getMemberVersionLabel(entitlement)}</span>
        </span>
      </div>
    );
  };

  const renderPlatformLimitCell = (_: unknown, record: TenantAuthRecord) => {
    const limit = record.commercialEntitlement?.platformLimit;
    return typeof limit === "number" ? `${limit} 个平台` : <span className="auth-muted-cell">-</span>;
  };

  const renderSelectedPlatformsCell = (_: unknown, record: TenantAuthRecord) => {
    const entitlement = record.commercialEntitlement;
    if (!entitlement) return <span className="auth-muted-cell">-</span>;
    return (
      <span title={entitlement.selectedPlatforms.join("、")}>
        {entitlement.selectedPlatforms.length}/{entitlement.platformLimit}：{entitlement.selectedPlatforms.join("、")}
      </span>
    );
  };

  const renderMemberStatusCell = (_: unknown, record: TenantAuthRecord) => {
    const status = record.commercialEntitlement?.memberStatus || "未开通";
    return <Tag color={status === "已付费" ? "green" : status === "试用中" ? "blue" : status === "发放失败" || status === "已到期" ? "red" : "default"}>{status}</Tag>;
  };

  const renderAuthScopeCell = (_: unknown, record: TenantAuthRecord) => {
    if (cloudResourceProducts.includes(record.product)) return <span className="auth-muted-cell">-</span>;
    return record.tags?.length ? record.tags.join("、") : <span className="auth-muted-cell">-</span>;
  };

  const getAuthScopeText = (record: TenantAuthRecord) => {
    if (cloudResourceProducts.includes(record.product)) return "-";
    return record.tags?.length ? record.tags.join("、") : "-";
  };

  const getTenantOrderNo = (record: TenantAuthRecord) => record.orderNo || record.commercialEntitlement?.orderNo || "-";

  const openEditAuthorization = (record: TenantAuthRecord) => {
    setEditingRecord(record);
    setEditConnectorScope(record.tags ?? []);
    setEditAuthEcology(record.ecology || activeEcology);
    setEditOrderNo(getTenantOrderNo(record));
    setEditAuthMemberStatus(record.commercialEntitlement?.memberStatus || "未开通");
    const versionLabel = record.commercialEntitlement ? getMemberVersionLabel(record.commercialEntitlement) : undefined;
    setEditAuthMemberVersion(versionLabel && versionLabel !== "-" ? versionLabel : undefined);
  };

  const closeEditAuthorization = () => {
    setEditingRecord(null);
    setEditConnectorScope([]);
    setEditAuthEcology("取数宝");
    setEditOrderNo("");
    setEditAuthMemberStatus("未开通");
    setEditAuthMemberVersion(undefined);
  };

  const handleSaveEditAuthorization = () => {
    if (!editingRecord) return;
    const isConnectorProduct = !cloudResourceProducts.includes(editingRecord.product);
    const nextScopeText = isConnectorProduct ? (editConnectorScope.length ? editConnectorScope.join("、") : "-") : "-";

    Modal.success({
      title: "编辑授权结果",
      width: 520,
      okText: "我知道了",
      content: (
        <div className="auth-delete-result">
          <div className="auth-delete-result-summary">
            <Tag color="success">成功</Tag>
            <span>requestId：AUTH-EDIT-20260516-001</span>
          </div>
          <p>授权已更新原记录，不生成新授权记录。</p>
          <p>
            {editingRecord.tenantName}｜{editingRecord.product}
            {isConnectorProduct ? `｜连接器授权范围：${nextScopeText}` : ""}
          </p>
        </div>
      ),
    });
    message.success("已保存授权编辑");
    closeEditAuthorization();
  };

  const columns: ColumnsType<TenantAuthRecord> = [
    {
      title: renderColumnTitle("序号", "index", 48),
      dataIndex: "index",
      width: columnWidths.index,
    },
    {
      title: renderColumnTitle("租户名称", "tenantName", 110),
      dataIndex: "tenantName",
      width: columnWidths.tenantName,
      ellipsis: true,
      render: (value: string | undefined) => (
        <span className="auth-tenant-name-cell">
          <span className="auth-tenant-name-text" title={value}>
            {value}
          </span>
        </span>
      ),
    },
    {
      title: renderColumnTitle("授权产品", "product", 96),
      dataIndex: "product",
      width: columnWidths.product,
      ellipsis: true,
      render: (value: string) => <span className="auth-child-product">{value}</span>,
    },
    {
      title: renderColumnTitle("连接器授权范围", "authScope", 118),
      dataIndex: "tags",
      width: columnWidths.authScope,
      ellipsis: true,
      render: renderAuthScopeCell,
    },
    {
      title: renderColumnTitle("有效期至", "expireAt", 104),
      dataIndex: "expireAt",
      width: columnWidths.expireAt,
      ellipsis: true,
    },
    {
      title: renderColumnTitle("授权类型", "authType", 104),
      dataIndex: "authType",
      width: columnWidths.authType,
      ellipsis: true,
    },
    {
      title: renderColumnTitle("更新人", "updater", 68),
      dataIndex: "updater",
      width: columnWidths.updater,
      ellipsis: true,
    },
    {
      title: renderColumnTitle("更新时间", "updateTime", 120),
      dataIndex: "updateTime",
      width: columnWidths.updateTime,
      ellipsis: true,
    },
    {
      title: renderColumnTitle("创建人", "creator", 68),
      dataIndex: "creator",
      width: columnWidths.creator,
      ellipsis: true,
    },
    {
      title: renderColumnTitle("创建时间", "createTime", 120),
      dataIndex: "createTime",
      width: columnWidths.createTime,
      ellipsis: true,
    },
    ...(showCommercialColumns
      ? [
          {
            title: renderColumnTitle("会员状态", "memberStatus", 92),
            dataIndex: "commercialEntitlement",
            width: columnWidths.memberStatus,
            render: renderMemberStatusCell,
          },
          {
            title: renderColumnTitle("会员版本", "commercialEntitlement", 118),
            dataIndex: "commercialEntitlement",
            width: columnWidths.commercialEntitlement,
            render: renderCommercialEntitlementCell,
          },
          {
            title: renderColumnTitle("可使用平台数", "platformLimit", 112),
            dataIndex: "commercialEntitlement",
            width: columnWidths.platformLimit,
            render: renderPlatformLimitCell,
          },
          {
            title: renderColumnTitle("已选平台", "selectedPlatforms", 150),
            dataIndex: "commercialEntitlement",
            width: columnWidths.selectedPlatforms,
            ellipsis: true,
            render: renderSelectedPlatformsCell,
          },
        ] satisfies ColumnsType<TenantAuthRecord>
      : []),
    {
      title: renderColumnTitle("关联合同/订单", "orderNo", 112),
      dataIndex: "orderNo",
      width: columnWidths.orderNo,
      ellipsis: true,
      render: (_: string | undefined, record) => getTenantOrderNo(record),
    },
    {
      title: renderColumnTitle("操作", "action", 72),
      className: "auth-action-column",
      width: columnWidths.action,
      render: (_, record) => (
        <Space size={0}>
          <Button size="small" type="link" onClick={() => openEditAuthorization(record)}>
            编辑
          </Button>
          <Button size="small" type="link" onClick={() => setSelectedRecord(record)}>
            详情
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="authorization-prototype tenant-management-page backend-v01-page">
      <section className="auth-page-frame auth-admin-frame">
        <Annotated noteId="tenantEcosystemFilter" className="resource-table-annotation">
          <Tabs
            activeKey={activeEcology}
            className="tenant-ecosystem-tabs"
            items={ecosystemTabs.map((ecology) => ({
              key: ecology,
              label: `${ecology} ${tenantAuthRows.filter((row) => row.ecology === ecology).length}`,
            }))}
            onChange={setActiveEcology}
          />
        </Annotated>
        <div className="auth-filter-row">
          <Input className="auth-filter-input auth-filter-search-input" placeholder="租户名称" suffix={<SearchOutlined />} />
          <Input className="auth-filter-input auth-filter-search-input" placeholder="更新人" suffix={<SearchOutlined />} />
          <DatePicker.RangePicker className="auth-filter-range" placeholder={["更新日期起", "更新日期止"]} />
          <Select
            allowClear
            className="auth-filter-select"
            placeholder="授权产品"
            options={authProductOptions.map((value) => ({ label: value, value }))}
          />
          <Input className="auth-filter-input auth-filter-search-input" placeholder="创建人" suffix={<SearchOutlined />} />
          <DatePicker.RangePicker className="auth-filter-range" placeholder={["创建日期起", "创建日期止"]} />
          {showCommercialColumns && (
            <Select
              allowClear
              className="auth-filter-select"
              placeholder="会员状态"
              options={["未开通", "试用中", "已付费", "已到期", "发放失败"].map((value) => ({ label: value, value }))}
            />
          )}
          {showCommercialColumns && <Input className="auth-filter-input" placeholder="合同/订单号" />}
          <Button type="link">重置</Button>
          <span className="auth-new-button-wrap">
            <Button
              type="primary"
              onClick={() => {
                setNewAuthEcology(addAuthEcologyOptions.includes(activeEcology) ? activeEcology : "取数宝");
                setNewAuthMemberStatus("未开通");
                setNewAuthMemberVersion(undefined);
                setAddAuthOpen(true);
              }}
            >
              + 新增授权
            </Button>
          </span>
        </div>
        <div className="auth-table-panel resource-table-annotation">
          <Table<TenantAuthRecord>
            className="auth-data-table tenant-auth-table backend-v01-table"
            columns={columns}
            dataSource={visibleTenantAuthRows}
            pagination={false}
            rowClassName={(record) => (record.status === "已过期" ? "auth-child-row-expired" : "")}
            rowKey="key"
            size="small"
            scroll={{ x: showCommercialColumns ? 1600 : 1220 }}
            tableLayout="fixed"
          />
          <div className="tenant-table-pagination">
            <Pagination
              current={tenantPage}
              pageSize={20}
              pageSizeOptions={["10", "20", "50"]}
              showSizeChanger
              showTotal={(total) => `共 ${total} 条授权记录`}
              total={visibleTenantAuthRows.length}
              onChange={setTenantPage}
            />
          </div>
        </div>
      </section>
      <Drawer
        title="新增授权"
        open={addAuthOpen}
        onClose={() => setAddAuthOpen(false)}
        width={520}
        destroyOnClose
        footer={
          <div className="tenant-auth-create-footer">
            <Button onClick={() => setAddAuthOpen(false)}>取消</Button>
            <Button
              type="primary"
              onClick={() => {
                message.success("新增授权已提交");
                setAddAuthOpen(false);
              }}
            >
              确定
            </Button>
          </div>
        }
      >
        <Form layout="vertical" className="tenant-auth-create-form">
          <Form.Item label="授权租户" required>
            <Input placeholder="请输入授权租户" />
          </Form.Item>
          <Form.Item label="所属生态" required>
            <Select
              value={newAuthEcology}
              options={addAuthEcologyOptions.map((value) => ({ label: value, value }))}
              onChange={(value) => {
                setNewAuthEcology(value);
                setNewAuthMemberStatus("未开通");
                setNewAuthMemberVersion(undefined);
              }}
            />
          </Form.Item>
          <Form.Item label="关联合同/订单号">
            <Input placeholder="请输入订单号或合同号" />
          </Form.Item>
          {showNewAuthMemberFields && (
            <div className="tenant-auth-dynamic-fields">
              <Form.Item label="会员状态" required>
                <Select
                  value={newAuthMemberStatus}
                  options={["未开通", "试用中", "已付费", "已到期"].map((value) => ({ label: value, value }))}
                  onChange={(value) => {
                    setNewAuthMemberStatus(value);
                    if (value === "未开通" || value === "试用中") setNewAuthMemberVersion(undefined);
                  }}
                />
              </Form.Item>
              <Form.Item label="会员版本" required={!newAuthMemberVersionDisabled}>
                <Select
                  value={newAuthMemberVersion}
                  placeholder={newAuthMemberVersionDisabled ? "无需选择会员版本" : "请选择会员版本"}
                  disabled={newAuthMemberVersionDisabled}
                  options={["普通会员", "高级会员"].map((value) => ({ label: value, value }))}
                  onChange={setNewAuthMemberVersion}
                />
              </Form.Item>
            </div>
          )}
          <Form.Item label="授权类型">
            <Radio.Group value="电商 saas">
              <Radio value="电商 saas">电商 saas</Radio>
            </Radio.Group>
          </Form.Item>
          <div className="tenant-auth-benefit-block">
            <div className="tenant-auth-benefit-title">可授权权益</div>
            <div className="tenant-auth-benefit-list">
              {addAuthProductOptions.map((product) => (
                <div className="tenant-auth-benefit-row" key={product}>
                  <span>{product}</span>
                  <Button type="link" icon={<PlusOutlined />}>分配授权</Button>
                </div>
              ))}
            </div>
          </div>
        </Form>
      </Drawer>
      <Drawer
        className="auth-real-drawer"
        title="编辑授权"
        open={Boolean(editingRecord)}
        onClose={closeEditAuthorization}
        width={560}
        destroyOnClose
        footer={
          <div className="auth-drawer-footer">
            <Button onClick={closeEditAuthorization}>取消</Button>
            <Button type="primary" onClick={handleSaveEditAuthorization}>
              确定
            </Button>
          </div>
        }
      >
        {editingRecord && (
          <Form layout="vertical" className="tenant-auth-create-form">
            <Form.Item label="授权租户" required>
              <Input value={editingRecord.tenantName} disabled />
            </Form.Item>
            <Form.Item label="所属生态" required>
              <Select
                value={editAuthEcology}
                options={addAuthEcologyOptions.map((value) => ({ label: value, value }))}
                onChange={(value) => {
                  setEditAuthEcology(value);
                  setEditAuthMemberStatus("未开通");
                  setEditAuthMemberVersion(undefined);
                }}
              />
            </Form.Item>
            <Form.Item label="关联合同/订单号">
              <Input value={editOrderNo} placeholder="请输入订单号或合同号" onChange={(event) => setEditOrderNo(event.target.value)} />
            </Form.Item>
            {showEditAuthMemberFields && (
              <div className="tenant-auth-dynamic-fields">
                <Form.Item label="会员状态" required>
                  <Select
                    value={editAuthMemberStatus}
                    options={["未开通", "试用中", "已付费", "已到期"].map((value) => ({ label: value, value }))}
                    onChange={(value) => {
                      setEditAuthMemberStatus(value);
                      if (value === "未开通" || value === "试用中") setEditAuthMemberVersion(undefined);
                    }}
                  />
                </Form.Item>
                <Form.Item label="会员版本" required={!editAuthMemberVersionDisabled}>
                  <Select
                    value={editAuthMemberVersion}
                    placeholder={editAuthMemberVersionDisabled ? "无需选择会员版本" : "请选择会员版本"}
                    disabled={editAuthMemberVersionDisabled}
                    options={["普通会员", "高级会员"].map((value) => ({ label: value, value }))}
                    onChange={setEditAuthMemberVersion}
                  />
                </Form.Item>
              </div>
            )}
            <Form.Item label="授权类型">
              <Radio.Group value="电商 saas">
                <Radio value="电商 saas">电商 saas</Radio>
              </Radio.Group>
            </Form.Item>
            <div className="tenant-auth-benefit-block">
              <div className="tenant-auth-benefit-title">可授权权益</div>
              <div className="tenant-auth-benefit-list">
                {editAuthProductOptions.map((product) => {
                  const isCurrentProduct = product === editingRecord.product;
                  return (
                    <div className="tenant-auth-benefit-row" key={product}>
                      <span>
                        {product}
                        {isCurrentProduct && <Tag color="processing">当前授权</Tag>}
                      </span>
                      <Button type="link" icon={isCurrentProduct ? <EditOutlined /> : <PlusOutlined />}>
                        {isCurrentProduct ? "调整授权" : "分配授权"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </Form>
        )}
      </Drawer>
      <Drawer
        title="授权详情"
        open={Boolean(selectedRecord)}
        onClose={() => setSelectedRecord(null)}
        width={760}
        destroyOnClose
      >
        {selectedRecord && (
          <div className="tenant-detail-drawer auth-detail-content">
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="授权租户">{selectedRecord.tenantName}</Descriptions.Item>
              <Descriptions.Item label="所属生态">{selectedRecord.ecology}</Descriptions.Item>
              <Descriptions.Item label="授权产品">{selectedRecord.product}</Descriptions.Item>
              <Descriptions.Item label="授权有效期">{selectedRecord.period}</Descriptions.Item>
              <Descriptions.Item label="连接器授权范围">{getAuthScopeText(selectedRecord)}</Descriptions.Item>
              <Descriptions.Item label="授权类型">{selectedRecord.authType}</Descriptions.Item>
              <Descriptions.Item label="状态">{selectedRecord.status}</Descriptions.Item>
              <Descriptions.Item label="更新人">{selectedRecord.updater}</Descriptions.Item>
              <Descriptions.Item label="更新时间">{selectedRecord.updateTime}</Descriptions.Item>
              <Descriptions.Item label="创建人">{selectedRecord.creator}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{selectedRecord.createTime}</Descriptions.Item>
              <Descriptions.Item label="关联合同/订单">{getTenantOrderNo(selectedRecord)}</Descriptions.Item>
            </Descriptions>

            <section className="auth-detail-log">
              <h3>变更日志</h3>
              <div className="auth-detail-log-list">
                <article className="auth-detail-log-item">
                  <div className="auth-detail-log-meta">
                    <span>{selectedRecord.createTime}</span>
                    <span>创建授权</span>
                    <span>{selectedRecord.creator}</span>
                    <Tag color="success">成功</Tag>
                  </div>
                  <p>
                    创建 {selectedRecord.product} 授权，连接器授权范围：{getAuthScopeText(selectedRecord)}。
                  </p>
                </article>
                <article className="auth-detail-log-item">
                  <div className="auth-detail-log-meta">
                    <span>{selectedRecord.updateTime}</span>
                    <span>更新授权</span>
                    <span>{selectedRecord.updater}</span>
                    <Tag color="success">成功</Tag>
                  </div>
                  <p>同步授权有效期、状态与关联合同/订单信息。</p>
                </article>
              </div>
            </section>
            {selectedRecord.commercialEntitlement && (
              <>
                <section className="tenant-detail-section">
                  <h3>会员权益</h3>
                  <div className="tenant-detail-grid">
                    <span>会员版本</span><strong>{getMemberVersionLabel(selectedRecord.commercialEntitlement)}</strong>
                    <span>会员状态</span><strong>{selectedRecord.commercialEntitlement.memberStatus}</strong>
                    <span>来源</span><strong>{selectedRecord.commercialEntitlement.source}</strong>
                    <span>会员有效期</span><strong>{selectedRecord.commercialEntitlement.memberPeriod}</strong>
                    <span>可使用平台数</span><strong>{selectedRecord.commercialEntitlement.platformLimit} 个平台</strong>
                    <span>已选平台数</span><strong>{selectedRecord.commercialEntitlement.selectedPlatforms.length} 个平台</strong>
                    <span>每日取数上限</span><strong>{selectedRecord.commercialEntitlement.dailyLimit}</strong>
                    <span>并发任务数</span><strong>{selectedRecord.commercialEntitlement.concurrency}</strong>
                  </div>
                </section>
                <section className="tenant-detail-section">
                  <h3>已选平台</h3>
                  <div className="tenant-detail-grid">
                    <span>已选平台</span><strong>{selectedRecord.commercialEntitlement.selectedPlatforms.join("、")}</strong>
                    <span>判断口径</span><strong>运行时只判断当前平台是否在已选平台内</strong>
                  </div>
                </section>
                <section className="tenant-detail-section">
                  <h3>已开通数据源 / 连接器授权</h3>
                  <Table
                    className="tenant-detail-inner-table"
                    columns={[
                      { title: "平台名称", dataIndex: "name" },
                      { title: "发放状态", dataIndex: "status" },
                      { title: "开始时间", dataIndex: "startAt" },
                      { title: "结束时间", dataIndex: "endAt" },
                      { title: "权益范围", dataIndex: "includedInMember" },
                      { title: "来源", dataIndex: "purchaseType" },
                      { title: "关联连接器", dataIndex: "connector" },
                    ]}
                    dataSource={selectedRecord.commercialEntitlement.platformItems}
                    pagination={false}
                    rowKey="name"
                    size="small"
                  />
                </section>
                <section className="tenant-detail-section">
                  <h3>订单来源</h3>
                  <div className="tenant-detail-grid">
                    <span>订单号</span><strong>{selectedRecord.commercialEntitlement.orderNo}</strong>
                    <span>支付单号</span><strong>{selectedRecord.commercialEntitlement.payNo}</strong>
                    <span>支付金额</span><strong>{selectedRecord.commercialEntitlement.amount}</strong>
                    <span>支付状态</span><strong>{selectedRecord.commercialEntitlement.paymentStatus}</strong>
                    <span>权益发放状态</span><strong>{selectedRecord.commercialEntitlement.grantStatus}</strong>
                    <span>发放时间</span><strong>{selectedRecord.commercialEntitlement.grantTime}</strong>
                    <span>连接器授权范围</span><strong>{selectedRecord.commercialEntitlement.openedConnectorAuths}</strong>
                  </div>
                </section>
                <section className="tenant-detail-section">
                  <div className="tenant-detail-title-row">
                    <h3>试用信息</h3>
                    <Button size="small" onClick={() => setCompensationTenant(selectedRecord.tenantName || "")}>调整试用</Button>
                  </div>
                  <div className="tenant-detail-grid">
                    <span>试用状态</span><strong>{selectedRecord.commercialEntitlement.trialStatus}</strong>
                    <span>试用天数</span><strong>{selectedRecord.commercialEntitlement.trialDays}</strong>
                    <span>试用开始时间</span><strong>{selectedRecord.commercialEntitlement.trialStartAt}</strong>
                    <span>试用结束时间</span><strong>{selectedRecord.commercialEntitlement.trialEndAt}</strong>
                    <span>是否人工调整</span><strong>{selectedRecord.commercialEntitlement.trialAdjusted}</strong>
                    <span>调整原因</span><strong>{selectedRecord.commercialEntitlement.adjustmentReason}</strong>
                  </div>
                </section>
                <section className="tenant-detail-section">
                  <h3>底层资源</h3>
                  <p>{selectedRecord.commercialEntitlement.resourceStatus}</p>
                </section>
                <section className="tenant-detail-section">
                  <h3>操作日志</h3>
                  <ul className="tenant-detail-log">
                    {selectedRecord.commercialEntitlement.operationLogs.map((log) => <li key={log}>{log}</li>)}
                  </ul>
                </section>
              </>
            )}
          </div>
        )}
      </Drawer>
      <Modal
        title="人工补偿"
        open={Boolean(compensationTenant)}
        onCancel={() => setCompensationTenant(null)}
        onOk={() => {
          message.success("人工补偿已提交，并写入操作记录");
          setCompensationTenant(null);
        }}
        okText="确认补偿"
        cancelText="取消"
        width={560}
      >
        <Annotated noteId="tenantCompensation" className="resource-modal-annotation">
          <Form layout="vertical">
            <Form.Item label="租户">
              <Input value={compensationTenant || ""} disabled />
            </Form.Item>
            <Form.Item label="补偿类型" required>
              <Select defaultValue="人工续费会员" options={["人工开通会员", "人工续费会员", "补发已选平台连接器授权", "调整试用期"].map((value) => ({ value, label: value }))} />
            </Form.Item>
            <Form.Item label="补偿对象" required>
              <Select defaultValue="普通会员" options={["普通会员", "高级会员", "生意参谋", "阿里妈妈", "京东商智"].map((value) => ({ value, label: value }))} />
            </Form.Item>
            <Form.Item label="有效期 / 试用期" required>
              <Input defaultValue="延长 30 天" />
            </Form.Item>
            <Form.Item label="操作原因" required>
              <Input.TextArea rows={3} defaultValue="订单权益发放异常，人工补偿。" />
            </Form.Item>
          </Form>
        </Annotated>
      </Modal>
    </div>
  );
}

function OperationLogsPage() {
  const defaultOperationRange: [Dayjs, Dayjs] = [dayjs("2026-02-15"), dayjs("2026-02-21")];
  const [operationType, setOperationType] = useState("全部");
  const [operationDateRange, setOperationDateRange] = useState<[Dayjs, Dayjs] | null>(defaultOperationRange);
  const filteredOperationRows = operationLogRows.filter((row) => {
    const matchType = operationType === "全部" || row.type === operationType;
    const operationTime = dayjs(row.time);
    const matchDate = operationDateRange
      ? operationTime.valueOf() >= operationDateRange[0].startOf("day").valueOf() && operationTime.valueOf() <= operationDateRange[1].endOf("day").valueOf()
      : true;

    return matchType && matchDate;
  });
  function resetOperationFilters() {
    setOperationType("全部");
    setOperationDateRange(defaultOperationRange);
  }

  const columns: ColumnsType<OperationLogRow> = [
    { title: <TableFieldTitle label="操作人" description="触发本次后台变更的账号名称，人工操作记录具体运营账号。" />, dataIndex: "operator", width: 160 },
    { title: <TableFieldTitle label="操作类型" description="本次变更所属分类，例如商业化开关变更、会员价格变更、人工续费。" />, dataIndex: "type", width: 180 },
    { title: <TableFieldTitle label="操作对象" description="被操作的生态、租户、会员配置、会员价格或订阅对象。" />, dataIndex: "target", width: 180 },
    { title: <TableFieldTitle label="变更内容" description="记录本次变更的前后值或具体动作，必须能支撑审计追溯。" />, dataIndex: "change" },
    { title: <TableFieldTitle label="操作时间" description="服务端记录的操作完成时间，按时间倒序展示。" />, dataIndex: "time", width: 180 },
  ];

  return (
    <div className="ecosystem-page operation-log-page">
      <div className="ecosystem-page-card">
        <div className="ecosystem-title-row">
          <h2>操作日志</h2>
        </div>
        <Annotated noteId="exceptionCompensation" className="operation-log-annotation">
          <div className="operation-filters">
            <Space size={12} wrap>
              <span className="operation-filter-item">
                <span>操作类型：</span>
                <Select
                  size="small"
                  value={operationType}
                  onChange={setOperationType}
                  options={[
                    { value: "全部", label: "全部" },
                    { value: "商业化开关变更", label: "商业化开关变更" },
                    { value: "人工续费", label: "人工续费" },
                    { value: "会员价格变更", label: "会员价格变更" },
                  ]}
                />
              </span>
              <span className="operation-filter-item">
                <span>日期范围：</span>
                <DatePicker.RangePicker
                  size="small"
                  value={operationDateRange}
                  onChange={(range) => setOperationDateRange(range && range[0] && range[1] ? [range[0], range[1]] : null)}
                  allowClear
                />
              </span>
              <Tooltip title="重置筛选">
                <Button size="small" icon={<ReloadOutlined />} aria-label="重置筛选" onClick={resetOperationFilters} />
              </Tooltip>
            </Space>
          </div>
        </Annotated>
        <Annotated noteId="operationLogFields" className="operation-log-table-annotation">
          <Table className="operation-log-table" rowKey="key" size="small" columns={columns} dataSource={filteredOperationRows} pagination={false} />
        </Annotated>
        <div className="resource-pagination">
          <Pagination size="small" current={1} total={filteredOperationRows.length} pageSize={20} showSizeChanger pageSizeOptions={["20"]} showTotal={(total) => `共 ${total} 条`} onChange={() => undefined} />
        </div>
      </div>
    </div>
  );
}

function BackendResourceManagementV01() {
  type ResourceTab = "member" | "platform";
  type ResourceModalType = "member" | "price" | "platform";
  type MemberPriceCycle = "月" | "季" | "年";
  type MemberConfigRow = {
    key: string;
    tier?: string;
    listed?: boolean;
    dailyLimit?: string;
    concurrency?: string;
    platformLimit?: number;
    benefit?: string;
    cycle?: string;
    originalPrice?: number;
    discountPercent?: number;
    emptyState?: boolean;
    children?: MemberConfigRow[];
  };
  type PlatformConfigRow = {
    key: string;
    name: string;
    appId: string;
    logoUrl?: string;
    connector: string;
    listed: boolean;
    displayCopy: string;
  };

  const initialCommercialEnabled = new URLSearchParams(window.location.search).get("commercial") !== "off";
  const [resourceTab, setResourceTab] = useState<ResourceTab>("member");
  const [commercialEnabled, setCommercialEnabled] = useState(initialCommercialEnabled);
  const [configModal, setConfigModal] = useState<ResourceModalType | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [priceMode, setPriceMode] = useState<"add" | "edit">("edit");
  const [priceMemberName, setPriceMemberName] = useState("");
  const [priceCycle, setPriceCycle] = useState<MemberPriceCycle>("月");
  const [priceOriginal, setPriceOriginal] = useState(199);
  const [priceDiscount, setPriceDiscount] = useState<number | null>(0);
  const [memberName, setMemberName] = useState("普通会员");
  const [memberDailyLimit, setMemberDailyLimit] = useState(100);
  const [memberConcurrency, setMemberConcurrency] = useState(2);
  const [memberPlatformLimit, setMemberPlatformLimit] = useState(2);
  const [memberBenefit, setMemberBenefit] = useState("购买会员后可按当前会员配置选择对应数量的平台。");
  const [memberListed, setMemberListed] = useState(false);
  const [platformName, setPlatformName] = useState("");
  const [platformAppId, setPlatformAppId] = useState("保存后系统自动生成");
  const [platformConnectorValues, setPlatformConnectorValues] = useState<string[]>([]);
  const [platformListed, setPlatformListed] = useState(true);
  const [platformDisplayTitle, setPlatformDisplayTitle] = useState("");
  const [platformDisplayDesc, setPlatformDisplayDesc] = useState("");
  const memberPriceCycles: MemberPriceCycle[] = ["月", "季", "年"];

  function parseConfigNumber(value?: string | number) {
    if (typeof value === "number") return value;
    const match = String(value ?? "").match(/\d+/);
    return match ? Number(match[0]) : undefined;
  }

  function calculateCyclePrice(originalPrice?: number, discountPercent?: number | null) {
    if (typeof originalPrice !== "number") return undefined;
    if (typeof discountPercent === "number" && discountPercent > 0) {
      return Math.round((originalPrice * discountPercent) / 100);
    }
    return originalPrice;
  }

  const calculatedSalePrice = calculateCyclePrice(priceOriginal, priceDiscount);

  const [memberRows, setMemberRows] = useState<MemberConfigRow[]>([
    {
      key: "member-normal",
      tier: "普通会员",
      listed: true,
      dailyLimit: "20 次 / 天",
      concurrency: "1 个任务",
      platformLimit: 1,
      benefit: "适合单平台轻量取数",
      children: [
        { key: "normal-month", cycle: "月", originalPrice: 199, discountPercent: 0 },
        { key: "normal-quarter", cycle: "季", originalPrice: 599, discountPercent: 0 },
        { key: "normal-year", cycle: "年", originalPrice: 1999, discountPercent: 0 },
      ],
    },
    {
      key: "member-advanced",
      tier: "高级会员",
      listed: true,
      dailyLimit: "100 次 / 天",
      concurrency: "5 个任务",
      platformLimit: 5,
      benefit: "适合多店铺稳定取数",
      children: [
        { key: "advanced-month", cycle: "月", originalPrice: 1299, discountPercent: 70 },
        { key: "advanced-quarter", cycle: "季", originalPrice: 3899, discountPercent: 0 },
        { key: "advanced-year", cycle: "年", originalPrice: 14999, discountPercent: 0 },
      ],
    },
  ]);

  const platformRows: PlatformConfigRow[] = [
    { key: "sycm", name: "生意参谋", appId: "qsb-sycm-001", connector: "生意参谋经营分析 / 商品排行 / 流量来源", listed: true, displayCopy: "同步店铺经营、商品、交易和流量数据" },
    { key: "alimama", name: "阿里妈妈", appId: "qsb-almm-001", connector: "推广计划 / 消耗明细 / 投产分析", listed: true, displayCopy: "同步推广消耗、计划效果和 ROI 数据" },
    { key: "jdsz", name: "京东商智", appId: "qsb-jdsz-001", connector: "京东商智品牌版 / 订单 / 商品", listed: true, displayCopy: "同步京东店铺经营和商品数据" },
    { key: "xhs", name: "小红书", appId: "qsb-xhs-001", connector: "小红书店铺概览 / 笔记表现 / 交易数据", listed: false, displayCopy: "同步小红书店铺经营和内容数据" },
  ];
  const platformConnectorOptions = Array.from(new Set(platformRows.flatMap((row) => row.connector.split(" / "))));

  function openConfig(type: ResourceModalType, name?: string, options?: { mode?: "add" | "edit"; memberName?: string; originalPrice?: number; discountPercent?: number }) {
    setEditingTitle(name || "");
    if (type === "member") {
      const targetMember = memberRows.find((row) => row.tier === name);
      setMemberName(targetMember?.tier || "普通会员");
      setMemberDailyLimit(parseConfigNumber(targetMember?.dailyLimit) ?? 100);
      setMemberConcurrency(parseConfigNumber(targetMember?.concurrency) ?? 2);
      setMemberPlatformLimit(targetMember?.platformLimit ?? 2);
      setMemberBenefit(targetMember?.benefit || "购买会员后可按当前会员配置选择对应数量的平台。");
      setMemberListed(targetMember?.listed ?? false);
    }
    if (type === "platform") {
      const targetPlatform = platformRows.find((row) => row.name === name);
      setPlatformName(targetPlatform?.name || "");
      setPlatformAppId(targetPlatform?.appId || "保存后系统自动生成");
      setPlatformConnectorValues(targetPlatform?.connector ? targetPlatform.connector.split(" / ") : []);
      setPlatformListed(targetPlatform?.listed ?? true);
      setPlatformDisplayTitle(targetPlatform?.name || "");
      setPlatformDisplayDesc(targetPlatform?.displayCopy || "");
    }
    if (type === "price") {
      setPriceMode(options?.mode || "edit");
      setPriceMemberName(options?.memberName || "");
      setPriceCycle(memberPriceCycles.includes(name as MemberPriceCycle) ? (name as MemberPriceCycle) : "月");
      setPriceOriginal(options?.originalPrice ?? 199);
      setPriceDiscount(options?.discountPercent ?? 0);
    }
    setConfigModal(type);
  }

  function handleCommercialChange(checked: boolean) {
    if (checked) {
      setCommercialEnabled(true);
      message.success("商业化开启成功");
      return;
    }
    Modal.confirm({
      title: "确定关闭商业化？",
      content: "关闭后，当前生态前台购买与续费入口将隐藏，已购会员和后台配置不受影响。",
      okText: "确定",
      cancelText: "取消",
      onOk: () => {
        setCommercialEnabled(false);
        message.success("商业化关闭成功");
      },
    });
  }

  const renderListedTag = (value?: boolean) => <Tag color={value ? "green" : "default"}>{value ? "上架" : "未上架"}</Tag>;
  const platformLogoColors = ["#ff6a3d", "#1677ff", "#13a8a8", "#722ed1", "#eb2f96", "#faad14"];
  function getPlatformLogoText(name?: string) {
    const first = (name || "平台").trim().charAt(0) || "平";
    return /^[a-z]$/i.test(first) ? first.toUpperCase() : first;
  }
  function getPlatformLogoColor(name?: string) {
    const seed = Array.from(name || "平台").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return platformLogoColors[seed % platformLogoColors.length];
  }
  function renderPlatformLogo(row: PlatformConfigRow) {
    return (
      <Avatar
        size={24}
        shape="square"
        className="backend-resource-logo"
        src={row.logoUrl}
        style={{ background: row.logoUrl ? undefined : getPlatformLogoColor(row.name) }}
      >
        {getPlatformLogoText(row.name)}
      </Avatar>
    );
  }

  const memberColumns: ColumnsType<MemberConfigRow> = [
    { title: "会员名称", dataIndex: "tier", width: 120, render: (value: string | undefined) => value || "" },
    { title: "上架状态", dataIndex: "listed", width: 88, render: (value: boolean | undefined, row) => row.emptyState || row.cycle ? "" : renderListedTag(value) },
    { title: "每日取数上限", dataIndex: "dailyLimit", width: 126, render: (value: string | undefined, row) => row.emptyState ? "-" : value || "-" },
    { title: <TableFieldTitle label="并发任务数" description="并发任务数与云桌面数量为 1:1。" />, dataIndex: "concurrency", width: 124, render: (value?: string) => value || "-" },
    { title: "可使用平台数", dataIndex: "platformLimit", width: 124, render: (value?: number) => (typeof value === "number" ? `${value} 个平台` : "-") },
    { title: "售卖周期", dataIndex: "cycle", width: 104, render: (value: string | undefined, row) => row.emptyState ? <span className="backend-resource-empty-text">暂无售卖周期</span> : value || "-" },
    { title: "原价", dataIndex: "originalPrice", width: 88, render: (value?: number) => (typeof value === "number" ? formatMoney(value) : "-") },
    {
      title: <TableFieldTitle label="是否有折扣" description="0% 表示没有折扣，表格展示 -；大于 0 时展示折扣百分比。" />,
      dataIndex: "discountPercent",
      width: 112,
      render: (value?: number) => (typeof value === "number" && value > 0 ? `${value}%` : "-"),
    },
    { title: "售价", dataIndex: "originalPrice", width: 88, render: (_: unknown, row) => {
      const price = calculateCyclePrice(row.originalPrice, row.discountPercent);
      return typeof price === "number" ? formatMoney(price) : "-";
    } },
    {
      title: "操作",
      fixed: "right",
      className: "backend-action-column",
      width: 190,
      render: (_, row) => row.emptyState ? (
        <span className="auth-muted-cell">-</span>
      ) : row.cycle ? (
        <Button
          size="small"
          type="link"
          disabled={!commercialEnabled}
          onClick={() => openConfig("price", row.cycle, { mode: "edit", originalPrice: row.originalPrice, discountPercent: row.discountPercent })}
        >
          编辑价格
        </Button>
      ) : (
        <Space size={0}>
          <Button size="small" type="link" icon={<EditOutlined />} disabled={!commercialEnabled} onClick={() => openConfig("member", row.tier)}>编辑会员</Button>
          <Button size="small" type="link" disabled={!commercialEnabled} onClick={() => openConfig("price", "月", { mode: "add", memberName: row.tier })}>新增售卖周期</Button>
        </Space>
      ),
    },
  ];

  const platformColumns: ColumnsType<PlatformConfigRow> = [
    { title: "平台 Logo", dataIndex: "logoUrl", width: 96, render: (_: unknown, row) => renderPlatformLogo(row) },
    { title: "平台名称", dataIndex: "name", width: 130 },
    { title: <TableFieldTitle label="APPID" description="新增平台后系统自动生成，不能编辑。" />, dataIndex: "appId", width: 150 },
    { title: "关联连接器", dataIndex: "connector", width: 260 },
    { title: "上架状态", dataIndex: "listed", width: 96, render: (value: boolean) => renderListedTag(value) },
    { title: "前台展示文案", dataIndex: "displayCopy", width: 260 },
    {
      title: "操作",
      fixed: "right",
      className: "backend-action-column",
      width: 92,
      render: (_, row) => (
        <Button size="small" type="link" icon={<EditOutlined />} disabled={!commercialEnabled} onClick={() => openConfig("platform", row.name)}>
          编辑
        </Button>
      ),
    },
  ];

  const modalTitle = configModal === "price" ? `${priceMode === "add" ? "新增售卖周期" : "编辑价格"}` : configModal === "platform" ? `${editingTitle ? "编辑" : "新增"}平台配置` : `${editingTitle ? "编辑" : "新增"}会员配置`;

  return (
    <div className="ecosystem-page backend-v01-page">
      <div className="ecosystem-page-card">
        <div className="ecosystem-title-row">
          <h2 className="resource-title-with-marker">
            资源管理
            <InteractionMarker noteId="resourceOverview" className="resource-title-marker" />
          </h2>
        </div>
        <div className="ecosystem-tabs-row">
          <div className="ecosystem-tabs ecosystem-tabs-with-marker">
            <button className="active" type="button">钉钉</button>
            {["飞书", "企微", "联通", "电信"].map((item) => (
              <button className="disabled" type="button" disabled key={item}>{item}</button>
            ))}
            <InteractionMarker noteId="resourceEcologyData" className="ecosystem-tabs-marker" />
          </div>
          <Annotated noteId="commercialSwitch" className="commercial-switch-annotation">
            <div className="commercial-switch">
              <span>商业化</span>
              <Switch checked={commercialEnabled} onChange={handleCommercialChange} />
            </div>
          </Annotated>
        </div>
        <div className="resource-toolbar">
          <div className="resource-package-tabs">
            <button className={resourceTab === "member" ? "active" : ""} type="button" onClick={() => setResourceTab("member")}>
              会员配置
            </button>
            <button className={resourceTab === "platform" ? "active" : ""} type="button" onClick={() => setResourceTab("platform")}>
              平台配置
            </button>
          </div>
          <Annotated noteId="trialConfig" className="ecosystem-trial-annotation">
            <div className="ecosystem-trial-setting">
              <span>新租户试用期</span>
              <InputNumber size="small" defaultValue={3} min={0} max={365} suffix="天" />
              <Tooltip title="用于试用资格判断，不属于会员档位配置；0 即代表无试用期">
                <InfoCircleOutlined className="ecosystem-trial-info" />
              </Tooltip>
            </div>
          </Annotated>
          <Annotated noteId="resourceCreateEntry" className="resource-create-annotation">
            <Button type="primary" icon={<PlusOutlined />} disabled={!commercialEnabled} onClick={() => openConfig(resourceTab === "member" ? "member" : "platform")}>
              {resourceTab === "member" ? "新增会员" : "新增平台"}
            </Button>
          </Annotated>
        </div>
        <Annotated noteId={resourceTab === "member" ? "devicePackageTable" : "platformPackageTable"} className="resource-table-annotation">
          <div className="backend-resource-table-shell">
            {resourceTab === "member" ? (
              <Table
                className="backend-v01-table"
                rowKey="key"
                size="small"
                columns={memberColumns}
                dataSource={memberRows}
                defaultExpandAllRows
                pagination={false}
                scroll={{ x: 1100 }}
              />
            ) : (
              <Table
                className="backend-v01-table"
                rowKey="key"
                size="small"
                columns={platformColumns}
                dataSource={platformRows}
                pagination={false}
                scroll={{ x: 1200 }}
              />
            )}
            <div className="backend-resource-pagination">
              <Pagination
                size="small"
                current={1}
                total={resourceTab === "member" ? memberRows.length : platformRows.length}
                pageSize={20}
                showSizeChanger={false}
                showTotal={(total) => `共 ${total} 条`}
              />
            </div>
          </div>
        </Annotated>
      </div>
      <Modal
        className="resource-config-modal"
        title={modalTitle}
        open={Boolean(configModal)}
        onCancel={() => setConfigModal(null)}
        onOk={() => {
          if (configModal === "member") {
            setMemberRows((rows) => {
              if (editingTitle) {
                return rows.map((row) =>
                  row.tier === editingTitle
                    ? {
                        ...row,
                        tier: memberName,
                        listed: memberListed,
                        dailyLimit: `${memberDailyLimit} 次 / 天`,
                        concurrency: `${memberConcurrency} 个任务`,
                        platformLimit: memberPlatformLimit,
                        benefit: memberBenefit,
                      }
                    : row,
                );
              }
              return [
                ...rows,
                {
                  key: `member-${memberName || "new"}`,
                  tier: memberName,
                  listed: memberListed,
                  dailyLimit: `${memberDailyLimit} 次 / 天`,
                  concurrency: `${memberConcurrency} 个任务`,
                  platformLimit: memberPlatformLimit,
                  benefit: memberBenefit,
                  children: [{ key: `member-${memberName || "new"}-empty`, emptyState: true }],
                },
              ];
            });
          }
          if (configModal === "price" && priceMode === "add") {
            const targetMember = memberRows.find((row) => row.tier === priceMemberName);
            const cycleExists = targetMember?.children?.some((child) => !child.emptyState && child.cycle === priceCycle);
            if (cycleExists) {
              message.error(`${priceMemberName} 已存在${priceCycle}售卖周期`);
              return;
            }
            setMemberRows((rows) =>
              rows.map((row) => {
                if (row.tier !== priceMemberName) return row;
                const nextChildren = (row.children || []).filter((child) => !child.emptyState);
                return {
                  ...row,
                  children: [
                    ...nextChildren,
                    {
                      key: `${row.key}-${priceCycle}`,
                      cycle: priceCycle,
                      originalPrice: priceOriginal,
                      discountPercent: priceDiscount ?? 0,
                    },
                  ],
                };
              }),
            );
          }
          message.success(
            configModal === "platform"
              ? "保存成功，前台数据源列表将读取最新配置"
              : configModal === "price"
                ? "价格保存成功，前台订阅配置将读取最新配置"
                : "保存成功，前台订阅配置将读取最新配置",
          );
          setConfigModal(null);
        }}
        okText="保存"
        cancelText="取消"
        width={620}
      >
        <Annotated noteId="packageDialog" className="resource-modal-annotation">
          <Form layout="vertical" className="resource-modal-form">
            {configModal === "price" && (
              <div className="backend-form-grid">
                <Form.Item label="售卖周期" required>
                  <Select
                    value={priceCycle}
                    disabled={priceMode === "edit"}
                    options={memberPriceCycles.map((value) => ({ value, label: value }))}
                    onChange={(value) => setPriceCycle(value as MemberPriceCycle)}
                  />
                </Form.Item>
                <Form.Item label="原价" required><InputNumber value={priceOriginal} min={0} prefix="¥" style={{ width: "100%" }} onChange={(value) => setPriceOriginal(Number(value || 0))} /></Form.Item>
                <Form.Item label={<TableFieldTitle label="是否有折扣" description="0% 表示没有折扣；售价按原价和折扣自动计算。" />} required>
                  <InputNumber
                    value={priceDiscount ?? undefined}
                    min={0}
                    max={100}
                    suffix="%"
                    style={{ width: "100%" }}
                    onChange={(value) => setPriceDiscount(value === null ? null : Number(value))}
                  />
                </Form.Item>
                <Form.Item label="售价"><InputNumber value={calculatedSalePrice} min={0} prefix="¥" disabled style={{ width: "100%" }} /></Form.Item>
                <Form.Item label="上架状态" valuePropName="checked"><Switch defaultChecked={false} checkedChildren="上架" unCheckedChildren="未上架" /></Form.Item>
              </div>
            )}
            {configModal === "member" && (
              <>
                <div className="backend-form-grid">
                  <Form.Item label="会员名称" required><Input value={memberName} onChange={(event) => setMemberName(event.target.value)} /></Form.Item>
                  <Form.Item label="每日取数上限" required><InputNumber value={memberDailyLimit} min={1} suffix="次" style={{ width: "100%" }} onChange={(value) => setMemberDailyLimit(Number(value || 1))} /></Form.Item>
                  <Form.Item label={<TableFieldTitle label="并发任务数" description="并发任务数与云桌面数量为 1:1。" />} required><InputNumber value={memberConcurrency} min={1} suffix="个" style={{ width: "100%" }} onChange={(value) => setMemberConcurrency(Number(value || 1))} /></Form.Item>
                  <Form.Item label="可使用平台数" required><InputNumber value={memberPlatformLimit} min={1} max={platformRows.length} suffix="个平台" style={{ width: "100%" }} onChange={(value) => setMemberPlatformLimit(Number(value || 1))} /></Form.Item>
                </div>
                <Form.Item label="会员版本描述" required>
                  <Input.TextArea value={memberBenefit} rows={3} onChange={(event) => setMemberBenefit(event.target.value)} />
                </Form.Item>
                <Annotated noteId="memberStatusToggle" className="member-status-annotation">
                  <Form.Item label="状态" valuePropName="checked">
                    <Switch checked={memberListed} checkedChildren="上架" unCheckedChildren="未上架" onChange={setMemberListed} />
                  </Form.Item>
                </Annotated>
              </>
            )}
            {configModal === "platform" && (
              <>
                <Annotated noteId="packageSourceFields" className="resource-source-fields-annotation">
                  <div className="backend-form-grid">
                    <Form.Item label="平台 Logo">
                      <div className="platform-logo-upload-field">
                        <Avatar
                          size={32}
                          shape="square"
                          className="backend-resource-logo"
                          style={{ background: getPlatformLogoColor(platformName || "平台") }}
                        >
                          {getPlatformLogoText(platformName || "平台")}
                        </Avatar>
                        <Upload beforeUpload={() => false} maxCount={1} accept="image/*">
                          <Button icon={<UploadOutlined />}>上传图片</Button>
                        </Upload>
                      </div>
                    </Form.Item>
                    <Form.Item label="平台名称" required><Input value={platformName} placeholder="请输入平台名称" onChange={(event) => setPlatformName(event.target.value)} /></Form.Item>
                    <Form.Item label="APPID"><Input value={platformAppId} disabled /></Form.Item>
                    <Form.Item label="上架状态" valuePropName="checked"><Switch checked={platformListed} checkedChildren="上架" unCheckedChildren="未上架" onChange={setPlatformListed} /></Form.Item>
                  </div>
                </Annotated>
                <Annotated noteId="connectorSelectRule" className="resource-connector-select-annotation">
                  <Form.Item label="关联连接器" required>
                    <Select
                      mode="multiple"
                      value={platformConnectorValues}
                      maxTagCount={3}
                      options={platformConnectorOptions.map((value) => ({ value, label: value }))}
                      placeholder="请选择关联连接器"
                      onChange={setPlatformConnectorValues}
                    />
                  </Form.Item>
                </Annotated>
                <Form.Item label="前台展示标题" required><Input value={platformDisplayTitle} placeholder="请输入前台展示标题" onChange={(event) => setPlatformDisplayTitle(event.target.value)} /></Form.Item>
                <Form.Item label="前台展示描述" required>
                  <Input.TextArea value={platformDisplayDesc} placeholder="请输入前台展示描述" rows={3} onChange={(event) => setPlatformDisplayDesc(event.target.value)} />
                </Form.Item>
              </>
            )}
          </Form>
        </Annotated>
      </Modal>
    </div>
  );
}

function OrderManagementPage() {
  const [orders, setOrders] = useState<OrderRow[]>(orderRows);
  const [detailOrder, setDetailOrder] = useState<OrderRow | null>(null);
  const [retryOrder, setRetryOrder] = useState<OrderRow | null>(null);
  const orderEcosystemTabs = ["钉钉", "取数宝", "飞书", "企微", "联通", "电信"];
  const orderTypeOptions = ["全部", "新购会员", "会员续费", "试用开通"];
  const [activeOrderEcosystem, setActiveOrderEcosystem] = useState("钉钉");
  const [orderTypeFilter, setOrderTypeFilter] = useState("全部");
  const visibleOrders = orders
    .filter((row) => row.ecosystem === activeOrderEcosystem)
    .filter((row) => orderTypeFilter === "全部" || row.orderType === orderTypeFilter)
    .slice()
    .sort((first, second) => dayjs(second.createdAt).valueOf() - dayjs(first.createdAt).valueOf());

  function retryEntitlement(row: OrderRow) {
    setRetryOrder(row);
  }

  function confirmRetryEntitlement() {
    if (!retryOrder) return;
    setOrders((current) =>
      current.map((item) =>
        item.key === retryOrder.key
          ? {
              ...item,
              entitlementStatus: "发放成功",
              failureReason: undefined,
              callbackInfo: `人工重试发放成功 2026-05-06 11:12；按已选平台发放连接器授权：${item.selectedPlatforms.join("、")}`,
              retryRecords: [...item.retryRecords, `2026-05-06 11:12 运营重试，按已选平台发放成功：${item.selectedPlatforms.join("、")}`],
            }
          : item,
      ),
    );
    message.success("权益发放成功");
    setRetryOrder(null);
  }

  const columns: ColumnsType<OrderRow> = [
    { title: "订单号", dataIndex: "orderNo", width: 160 },
    { title: "租户名称", dataIndex: "tenant", width: 150 },
    { title: "订单类型", dataIndex: "orderType", width: 112 },
    { title: "会员版本", dataIndex: "memberVersion", width: 112 },
    { title: "售卖周期", dataIndex: "saleCycle", width: 100 },
    { title: "可使用平台数", dataIndex: "platformLimit", width: 124, render: (value: number) => `${value} 个平台` },
    {
      title: <TableFieldTitle label="本次开通平台" description="用户购买会员时选择的平台列表，支持多个平台。" />,
      dataIndex: "selectedPlatforms",
      width: 240,
      render: (value: string[]) => value.join("、"),
    },
    { title: "支付金额", dataIndex: "amount", width: 100, render: (value: number) => formatMoney(value) },
    { title: "支付状态", dataIndex: "paymentStatus", width: 110, render: (value: string) => <Tag color={value === "支付成功" ? "green" : value === "支付失败" ? "red" : "blue"}>{value}</Tag> },
    { title: <TableFieldTitle label="权益发放状态" description="未发放、发放中、发放成功、发放失败。" />, dataIndex: "entitlementStatus", width: 132, render: (value: string) => <Tag color={value === "发放成功" ? "green" : value === "发放失败" ? "red" : value === "发放中" ? "blue" : "default"}>{value}</Tag> },
    { title: "失败原因", dataIndex: "failureReason", width: 220, render: (value?: string) => value || "-" },
    {
      title: "回调 / 重试记录",
      dataIndex: "callbackInfo",
      width: 260,
      render: (_: string, row) => (
        <div className="order-callback-cell">
          <span>{row.callbackInfo}</span>
          {row.retryRecords.length > 0 && <span>{row.retryRecords[row.retryRecords.length - 1]}</span>}
        </div>
      ),
    },
    { title: "创建时间", dataIndex: "createdAt", width: 142 },
    { title: "支付时间", dataIndex: "paidAt", width: 142 },
    {
      title: "操作",
      fixed: "right",
      width: 150,
      render: (_, row) => (
        <Space size={0}>
          <Button size="small" type="link" onClick={() => setDetailOrder(row)}>详情</Button>
          {row.entitlementStatus === "发放失败" && (
            <Button size="small" type="link" onClick={() => retryEntitlement(row)}>重试发放</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="ecosystem-page order-management-page backend-v01-page">
      <div className="ecosystem-page-card">
        <div className="ecosystem-title-row">
          <h2 className="resource-title-with-marker">
            订单管理
            <InteractionMarker noteId="orderManagementPage" className="resource-title-marker" />
          </h2>
        </div>
        <Tabs
          activeKey={activeOrderEcosystem}
          className="tenant-ecosystem-tabs order-ecosystem-tabs"
          items={orderEcosystemTabs.map((ecosystem) => ({
            key: ecosystem,
            label: `${ecosystem} ${orders.filter((row) => row.ecosystem === ecosystem).length}`,
          }))}
          onChange={setActiveOrderEcosystem}
        />
        <div className="operation-filters">
          <Space size={12} wrap>
            <span className="operation-filter-item"><span>订单类型：</span><Select size="small" value={orderTypeFilter} options={orderTypeOptions.map((value) => ({ value, label: value }))} onChange={setOrderTypeFilter} /></span>
            <span className="operation-filter-item"><span>发放状态：</span><Select size="small" defaultValue="全部" options={["全部", "未发放", "发放中", "发放成功", "发放失败"].map((value) => ({ value, label: value }))} /></span>
            <span className="operation-filter-item"><span>创建时间：</span><DatePicker.RangePicker size="small" /></span>
          </Space>
        </div>
        <Annotated noteId="orderDetail" className="resource-table-annotation">
          <Table
            className="operation-log-table backend-v01-table"
            rowKey="key"
            size="small"
            columns={columns}
            dataSource={visibleOrders}
            pagination={{ pageSize: 20, total: visibleOrders.length, showTotal: (total) => `共 ${total} 条` }}
            scroll={{ x: 2200 }}
          />
        </Annotated>
      </div>
      <Modal title="订单详情" open={Boolean(detailOrder)} onCancel={() => setDetailOrder(null)} footer={<Button type="primary" onClick={() => setDetailOrder(null)}>关闭</Button>} width={680}>
        {detailOrder && (
          <Annotated noteId={detailOrder.entitlementStatus === "发放失败" ? "orderRetry" : "orderDetail"} className="resource-modal-annotation">
            <div className="order-detail-list">
              <span>订单号：{detailOrder.orderNo}</span>
              <span>外部支付单号：{detailOrder.externalPayNo}</span>
              <span>所属生态：{detailOrder.ecosystem}</span>
              <span>租户名称：{detailOrder.tenant}</span>
              <span>订单类型：{detailOrder.orderType}</span>
              <span>会员版本：{detailOrder.memberVersion}</span>
              <span>售卖周期：{detailOrder.saleCycle}</span>
              <span>可使用平台数：{detailOrder.platformLimit} 个平台</span>
              <span>用户本次选择平台：{detailOrder.selectedPlatforms.join("、")}</span>
              <span>支付金额：{formatMoney(detailOrder.amount)}</span>
              <span>支付状态：{detailOrder.paymentStatus}</span>
              <span>权益发放状态：{detailOrder.entitlementStatus}</span>
              <span>发放逻辑：支付成功后写入会员有效期，再写入可使用平台数和已选平台，并按已选平台发放连接器授权</span>
              <span>创建时间：{detailOrder.createdAt}</span>
              <span>支付时间：{detailOrder.paidAt}</span>
              <span>回调信息：{detailOrder.callbackInfo}</span>
              {detailOrder.retryRecords.length > 0 && (
                <span>重试记录：{detailOrder.retryRecords.join("；")}</span>
              )}
              {detailOrder.failureReason && <strong>失败原因：{detailOrder.failureReason}</strong>}
            </div>
          </Annotated>
        )}
      </Modal>
      <Modal
        title="确认重试权益发放？"
        open={Boolean(retryOrder)}
        onCancel={() => setRetryOrder(null)}
        onOk={confirmRetryEntitlement}
        okText="重试发放"
        cancelText="取消"
        width={480}
      >
        {retryOrder && (
          <Annotated noteId="orderRetry" className="resource-modal-annotation">
            <p className="order-retry-copy">订单 {retryOrder.orderNo} 将按已选平台重新发放连接器授权：{retryOrder.selectedPlatforms.join("、")}，重试动作会写入操作记录。</p>
          </Annotated>
        )}
      </Modal>
    </div>
  );
}

function PrototypeContent({ activePage }: { activePage: PrototypePage }) {
  if (activePage === "plugin") return <PluginFrontendPage />;
  if (activePage === "dataSource") return <DataSourceFrontendPage />;
  if (activePage === "tenantManagement") return <TenantManagementPage />;
  if (activePage === "orderManagement") return <OrderManagementPage />;
  return <BackendResourceManagementV01 />;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(readInitialTab);
  const [activePage, setActivePage] = useState<PrototypePage>(readInitialPage);
  const activeSurface = getPrototypeSurface(activePage);

  useEffect(() => {
    updateUrl(activeTab, activePage);
  }, []);

  function selectMenu(key: PrototypeMenuKey) {
    if (key === "prd") {
      setActiveTab("prd");
      updateUrl("prd", activePage);
      return;
    }
    const page: PrototypePage = key === "backend" ? "resourceManagement" : key;
    setActivePage(page);
    setActiveTab("prototype");
    updateUrl("prototype", page);
  }

  function switchPage(page: PrototypePage) {
    setActivePage(page);
    setActiveTab("prototype");
    updateUrl("prototype", page);
  }

  function jumpToPrototype(page: PrototypePage) {
    setActivePage(page);
    setActiveTab("prototype");
    updateUrl("prototype", page);
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#ff5b2e",
          colorInfo: "#ff5b2e",
          colorLink: "#ff5b2e",
          borderRadius: 6,
          fontFamily: "PingFang SC, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        },
      }}
    >
      <Layout className={`page-shell${activeTab === "prd" ? " prd-shell" : ""}${activeTab === "prototype" && activeSurface === "backend" ? " authorization-shell" : ""}`}>
        <IterationBar activeTab={activeTab} activePage={activePage} onSelectMenu={selectMenu} />
        {activeTab === "prototype" && activeSurface === "backend" && (
          <BackendPortalHeader hideBackendMarker={activePage === "tenantManagement"} />
        )}
        <Layout className={`workspace-layout${activeTab === "prd" ? " prd-workspace" : ""}${activeTab === "prototype" ? ` ${activeSurface}-workspace` : ""}`}>
          {activeTab === "prototype" && activeSurface === "backend" && (
            <Sider className="portal-sider" width={184}>
              <BackendSideNav activePage={activePage} onSwitchPage={switchPage} />
            </Sider>
          )}
          <Content className={`main-content${activeTab === "prd" ? " prd-content-shell" : ""}${activeTab === "prototype" && activeSurface === "frontend" ? " frontend-content-shell" : ""}`}>
            {activeTab === "prd" ? <PrdContent onJump={jumpToPrototype} /> : <PrototypeContent activePage={activePage} />}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
