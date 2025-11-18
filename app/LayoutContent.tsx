"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import {
  Home, Briefcase, Zap, History, File, DollarSign, FileText, Globe,
  Target, Bell, Menu, Search, ChevronDown, Newspaper, Users, TrendingUp
} from "lucide-react";

// ==== 导入组件 ====
// 假设这些路径是正确的
// ⚠️ 注意：我们将通过一个 ClientOnlyWrapper 来按需导入和渲染这些组件，以解决 SSR 错误。
import PDFViewer from "@/components/PDFViewer";
import Earnings from "@/components/Earnings";
import EarningNotes from "@/components/EarningNotes";
import BIReports from "@/components/BIReports";

// ==== react-pdf worker 配置（全局只需一次）====
import { pdfjs } from "react-pdf";
// 保持原样，这个配置是正确的
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const FinanceLogo = ({ className = "" }) => (
  <TrendingUp className={className} strokeWidth="2" />
);

const Button = ({
  children,
  className = "",
  onClick,
  variant,
  size,
  "aria-label": ariaLabel,
}: any) => (
  <button
    onClick={onClick}
    aria-label={ariaLabel}
    className={`px-4 py-2 font-medium rounded-lg transition-colors duration-200 ${
      variant === "outline"
        ? "border border-gray-300 text-gray-700 hover:bg-gray-100"
        : variant === "ghost"
        ? "text-gray-700 hover:bg-gray-100"
        : "bg-violet-600 text-white hover:bg-violet-700"
    } ${size === "sm" ? "text-sm h-9" : size === "lg" ? "text-base h-11" : "h-10"} ${className}`}
  >
    {children}
  </button>
);

const navItems = [
  { label: "首页", icon: Home, link: "#home", isSeparator: false, sectionId: "core" },
  { label: "公司", icon: Briefcase, link: "#company", isSeparator: false, sectionId: "core" },
  { label: "我的", isSeparator: true, sectionId: "mine" },
  { label: "关注", icon: Bell, link: "#bell", isSeparator: false, sectionId: "mine" },
  { label: "任务", icon: Zap, link: "#zap", isSeparator: false, sectionId: "mine" },
  { label: "历史", icon: History, link: "#history", isSeparator: false, sectionId: "mine" },
  { label: "文件", icon: File, link: "#file", isSeparator: false, sectionId: "mine" },
  { label: "发现", isSeparator: true, sectionId: "discover" },
  { label: "财报", icon: DollarSign, link: "#dollar", isSeparator: false, sectionId: "discover" },
  { label: "纪要", icon: FileText, link: "#text", isSeparator: false, sectionId: "discover" },
  { label: "BI研报", icon: Globe, link: "#globe", isSeparator: false, sectionId: "discover" },
  { label: "公告", icon: FileText, link: "#report", isSeparator: false, sectionId: "discover" },
  { label: "新闻", icon: Newspaper, link: "#news", isSeparator: false, sectionId: "news" },
  { label: "社媒", icon: Users, link: "#social", isSeparator: false, sectionId: "news" },
];

const searchModes = [
  { label: "文档搜索", value: "document" },
  { label: "智能问答", value: "q_a" },
  { label: "深度研究", value: "research" },
];

// 🚀 移除 AllSiteItem 的定义，因为它将被删除
// const AllSiteItem = { label: "全站", icon: Globe, link: "#all" };

const useClickOutside = (refs: any, callback: () => void) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const refArray = Array.isArray(refs) ? refs : [refs];
      const isOutside = refArray.every(
        (ref) => ref.current && !ref.current.contains(event.target as Node)
      );
      if (isOutside) callback();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [refs, callback]);
};

interface SidebarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  pageType: "home" | "subpage";
  activeItemLabel: string;
  onItemClick: (label: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen,
  onToggleSidebar,
  pageType,
  activeItemLabel,
  onItemClick,
}) => {
  const expandedWidth = 210;
  const collapsedWidth = 70;
  const fullBrandName = "Finance-GPT";

  const NavItemsRenderer = ({ isExpanded }: { isExpanded: boolean }) => (
    <div
      className={`flex-1 flex flex-col ${isExpanded ? "p-3 space-y-1" : "px-2 py-4 space-y-2"}`}
    >
      {navItems.map((item, itemIndex) => {
        if (item.isSeparator) {
          if (isExpanded) {
            return (
              <div key={`sep-${itemIndex}`} className="flex items-center px-2 mt-4 mb-2">
                <span className="text-base font-semibold uppercase text-gray-500 whitespace-nowrap mr-2">
                  {item.label}
                </span>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>
            );
          } else {
            return <div key={`sep-${itemIndex}`} className="h-0 w-full" aria-hidden="true" />;
          }
        }
        const Icon = item.icon;
        const isActive = item.label === activeItemLabel;
        return (
          <a
            key={itemIndex}
            href={item.link}
            onClick={(e) => {
              e.preventDefault();
              onItemClick(item.label);
              if (pageType === "subpage" && isExpanded) {
                onToggleSidebar();
              }
            }}
            className={`flex items-center py-2.5 px-2 rounded-xl transition-colors group ${
              isExpanded && isActive ? "bg-violet-50" : !isActive ? "hover:bg-gray-100" : ""
            } ${isExpanded ? "justify-start" : "justify-center"}`}
            title={!isExpanded ? item.label : undefined}
          >
            <div
              className={`flex items-center justify-center h-8 w-8 rounded-full transition-all duration-300 ${
                isActive
                  ? "bg-violet-600 text-white"
                  : "text-gray-600 group-hover:text-gray-900"
              } ${isExpanded ? "mr-3" : ""}`}
            >
              <Icon className="h-6 w-6 flex-shrink-0" />
            </div>
            <span
              className={`text-base whitespace-nowrap transition-all duration-300 overflow-hidden ${
                isActive
                  ? "text-violet-700 font-semibold"
                  : "text-gray-600 group-hover:text-gray-900"
              } ${isExpanded ? "w-auto opacity-100" : "w-0 opacity-0"}`}
            >
              {item.label}
            </span>
          </a>
        );
      })}
    </div>
  );

  return (
    <div
      className="top-0 left-0 h-screen bg-white flex flex-col transition-all duration-300 ease-in-out fixed z-50"
      style={{ width: isSidebarOpen ? `${expandedWidth}px` : `${collapsedWidth}px` }}
    >
      <div
        className="flex-shrink-0 flex items-center h-[60px] overflow-hidden justify-start"
        style={{ width: isSidebarOpen ? `${expandedWidth}px` : `${collapsedWidth}px` }}
      >
        <button
          onClick={onToggleSidebar}
          className="p-1.5 ml-2 mr-1 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
          aria-label={isSidebarOpen ? "收起侧边栏" : "展开侧边栏"}
        >
          <Menu className="h-5 w-5 text-gray-700" />
        </button>
        <div className="flex items-center whitespace-nowrap overflow-hidden">
          <FinanceLogo className="h-6 w-6 text-gray-700 flex-shrink-0" />
          <span
            className={`text-xl font-bold transition-all duration-300 ${
              isSidebarOpen ? "text-gray-800 ml-3" : "w-0 opacity-0"
            } whitespace-nowrap overflow-hidden`}
          >
            {fullBrandName}
          </span>
        </div>
      </div>
      <NavItemsRenderer isExpanded={isSidebarOpen} />
    </div>
  );
};

interface FixedBrandNameProps {
  isSidebarOpen: boolean;
}

const FixedBrandName: React.FC<FixedBrandNameProps> = ({ isSidebarOpen }) => {
  const collapsedWidth = 70;
  if (isSidebarOpen) return null;
  return (
    <div
      className="fixed top-0 z-50 h-[60px] bg-white flex items-center"
      style={{ left: `${collapsedWidth}px`, paddingLeft: "10px" }}
    >
      <span className="text-xl font-bold text-gray-800 whitespace-nowrap">
        Finance-GPT
      </span>
    </div>
  );
};

// 🚀 新增组件：用于解决 react-pdf 的 SSR 兼容性问题
const ClientOnlyWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        // 在服务器端或客户端第一次渲染时，返回一个占位符
        // 实际的内容只在 useEffect 运行（即客户端）后才会渲染
        return <div className="flex-1 flex items-center justify-center text-gray-500 p-8">加载中...</div>;
    }

    return <>{children}</>;
};


export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeItemLabel, setActiveItemLabel] = useState(navItems[0].label);
  const [isLeftDropdownOpen, setIsLeftDropdownOpen] = useState(false);
  const [searchMode, setSearchMode] = useState(searchModes[0]);
  const [isRightDropdownOpen, setIsRightDropdownOpen] = useState(false);

  const leftDropdownItems = useMemo(() => {
    const clickableItems = navItems.filter((item) => !item.isSeparator);
    // 🚀 移除 '全站' 搜索：直接返回可点击的导航项
    return clickableItems;
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const pageType = useMemo(() => {
    return activeItemLabel === "首页" ? "home" : "subpage";
  }, [activeItemLabel]);

  const handleItemClick = (label: string) => {
    setActiveItemLabel(label);
    setIsLeftDropdownOpen(false);
    if (label === "首页") {
      setIsSidebarOpen(true);
    } else if (pageType === "home" && label !== "首页") {
      setIsSidebarOpen(false);
    }
  };

  const collapsedWidth = 70;
  const expandedWidth = 210;
  const actualSidebarWidth = isSidebarOpen ? expandedWidth : collapsedWidth;
  const showOverlay = pageType === "subpage" && isSidebarOpen;

  const leftDropdownRef = useRef(null);
  const rightDropdownRef = useRef(null);
  const searchModeButtonRef = useRef<HTMLButtonElement>(null);


  useClickOutside([leftDropdownRef, rightDropdownRef], () => {
    if (isLeftDropdownOpen) setIsLeftDropdownOpen(false);
    if (isRightDropdownOpen) setIsRightDropdownOpen(false);
  });

  const pdfViewerPages = ["纪要"] as const;
  const isPdfViewerPage = pdfViewerPages.includes(activeItemLabel as any);

  const getPageTitle = (label: string) => {
    let emoji = "";
    switch (label) {
      case "财报": emoji = "📄"; break;
      case "纪要": emoji = "📝"; break;
      case "BI研报": emoji = "🌐"; break;
      case "公司": emoji = "🏢"; break;
      case "关注": emoji = "🔔"; break;
      case "任务": emoji = "⚡"; break;
      case "历史": emoji = "⌛"; break;
      case "文件": emoji = "📁"; break;
      case "公告": emoji = "📜"; break;
      case "新闻": emoji = "📰"; break;
      case "社媒": emoji = "👥"; break;
      default: emoji = "🔎";
    }
    return `${emoji} ${label} - 智能分析`;
  };

  return (
    <div className="flex min-h-screen relative">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
        pageType={pageType}
        activeItemLabel={activeItemLabel}
        onItemClick={handleItemClick}
      />
      <FixedBrandName isSidebarOpen={isSidebarOpen} />
      {showOverlay && (
        <div
          className="fixed inset-0 bg-black opacity-30 z-40 transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}
      <div
        style={{ marginLeft: `${actualSidebarWidth}px` }}
        className="flex-1 transition-all duration-300 flex flex-col h-dvh min-h-dvh"
      >
        {pageType === "home" ? (
          <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        ) : (
          <>
            <header className="flex-shrink-0 bg-white px-6 py-4 flex items-center justify-between space-x-8 shadow-sm z-20 sticky top-0">
              <div
                className={`w-1/6 flex-shrink-0 transition-all duration-300`}
                style={{ paddingLeft: isSidebarOpen ? "0" : "40px" }}
              ></div>
              <div className="flex-1 flex items-center space-x-8">
                <h2 className="text-lg font-extrabold text-gray-800 flex-shrink-0">
                  {getPageTitle(activeItemLabel)}
                </h2>
                <div className="relative w-full flex border border-gray-200 rounded-full shadow-sm focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500 transition duration-150 flex-1">
                  <div className="relative z-20" ref={leftDropdownRef}>
                    <button
                      onClick={() => setIsLeftDropdownOpen(!isLeftDropdownOpen)}
                      className="flex items-center h-full pl-4 pr-3 text-sm font-semibold text-gray-700 bg-gray-50 border-r border-gray-200 rounded-l-full hover:bg-gray-100 transition-colors whitespace-nowrap"
                      aria-expanded={isLeftDropdownOpen}
                    >
                      {activeItemLabel}
                      <ChevronDown
                        className={`h-4 w-4 ml-1 transition-transform duration-200 ${
                          isLeftDropdownOpen ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    </button>
                    {isLeftDropdownOpen && (
                      <div className="absolute top-full mt-2 w-[380px] p-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50">
                        <div className="grid grid-cols-6 gap-2">
                          {leftDropdownItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeItemLabel === item.label;
                            return (
                              <button
                                key={item.label}
                                onClick={() => handleItemClick(item.label)}
                                className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition-colors text-xs space-y-0.5 ${
                                  isActive
                                    ? "bg-violet-100 text-violet-700"
                                    : "text-gray-600 hover:bg-gray-100"
                                }`}
                              >
                                <div
                                  className={`h-7 w-7 flex items-center justify-center rounded-full ${
                                    isActive
                                      ? "bg-violet-600 text-white shadow-md"
                                      : "text-gray-600 bg-gray-100"
                                  }`}
                                >
                                  <Icon className="h-4 w-4" />
                                </div>
                                <span className="font-medium">{item.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder={`在${searchMode.label}中输入搜索关键词...`}
                    // 搜索框输入文字大小为 text-sm
                    className="flex-1 min-w-0 px-4 py-2 text-sm focus:outline-none bg-transparent"  
                  />
                  {/* === 右侧搜索模式下拉菜单优化 === */}
                  <div className="relative z-10 group" ref={rightDropdownRef}>
                    <button
                      ref={searchModeButtonRef}
                      onClick={() => setIsRightDropdownOpen(!isRightDropdownOpen)}
                      className="flex items-center h-full px-3 text-sm font-semibold text-gray-700 bg-gray-50 border-x border-gray-200 hover:bg-gray-100 transition-colors whitespace-nowrap"
                      aria-expanded={isRightDropdownOpen}
                    >
                      {searchMode.label}
                      <ChevronDown
                        className={`h-4 w-4 ml-1 transition-transform duration-200 ${
                          isRightDropdownOpen ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    </button>
                    {isRightDropdownOpen && (
                      <div 
                        className="absolute right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden"
                        // 垂直对齐调整，使其靠近搜索框文字底部
                        style={{ top: `calc(100% + 2px)` }} // 调整为 2px，使其更靠近输入框
                      >
                        {searchModes.map((mode) => (
                          <button
                            key={mode.value}
                            onClick={() => {
                              setSearchMode(mode);
                              setIsRightDropdownOpen(false);
                            }}
                            // 最终优化：调整为 py-1.5，以紧密包裹文字
                            className={`w-full flex items-center justify-start py-1.5 px-4 text-sm transition-colors whitespace-nowrap ${
                              searchMode.value === mode.value
                                ? "bg-violet-50 text-violet-600 font-semibold"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {/* 这里的文字大小已经是 text-sm，与输入框一致 */}
                            {mode.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    className="flex items-center justify-center p-1.5 text-white bg-violet-600 rounded-r-full hover:bg-violet-700 transition-colors"
                    aria-label="执行搜索"
                  >
                    <div className="flex items-center justify-center h-7 w-7 rounded-full bg-violet-600">
                      <Search className="h-5 w-5" />
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 w-1/6 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-violet-600 text-violet-600 hover:bg-violet-50 rounded-lg shadow-sm"
                >
                  注册
                </Button>
                <Button
                  size="sm"
                  className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg shadow-sm"
                >
                  登录
                </Button>
              </div>
            </header>

            <main className="flex-1 min-h-0 bg-gray-50/30 flex flex-col overflow-y-auto">
              <ClientOnlyWrapper>
                {activeItemLabel === "财报" ? (
                  <Earnings
                    initialPdfUrl="https://example.com/sample-earnings-report.pdf"
                  />
                ) : activeItemLabel === "纪要" ? (
                  <EarningNotes
                      initialPdfUrl="https://example.com/sample-notes-report.pdf"
                  />
                ) : activeItemLabel === "BI研报" ? (
                  <BIReports />
                ) : isPdfViewerPage ? (
                  <PDFViewer documentType={activeItemLabel as "纪要"} />
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500 p-8">
                    <div className="text-center">
                      <div className="text-6xl mb-4">Under Construction</div>
                      <p className="text-lg font-medium">{activeItemLabel} 页面开发中...</p>
                      <p className="text-sm mt-2">敬请期待</p>
                    </div>
                  </div>
                )}
              </ClientOnlyWrapper>
            </main>
          </>
        )}
      </div>
    </div>
  );
}
