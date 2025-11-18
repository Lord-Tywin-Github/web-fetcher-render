import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp } from "lucide-react";

const recommendedQuestions = [
  "腾讯最新财报营收分析",
  "2025 Q1 特斯拉财报分析",
  "微软 2025 Q3 业绩增长是多少？",
  "比亚迪 2024 汽车和电池业务怎么样",
];

const stats = [
  { label: "财报", count: "260" },
  { label: "纪要", count: "337" },
  { label: "研报", count: "918" },
  { label: "新闻", count: "11587" },
];

const hotReports = [
  {
    id: "1",
    type: "reports",
    title: "南华期货质日报：黄金、白银：延续震荡理-20251104",
    source: "南华期货",
    date: "2025-11-04 08:39",
    description:
      "报告行业投资评级 未提及 报告的核心观点 从中长期视角看，央行购金及其他推黄金走势的分析认为当前金价将继续区间震荡。另外中期延伸分析围绕...",
    company: "南华期货(SH:603093)",
    views: 1937,
    tags: ["降息预期", "Futures", "黄金期货", "白银期货"],
  },
  {
    id: "2",
    type: "transcripts",
    title: "GTC October 2025 Keynote with NVIDIA CEO Jensen Huang",
    source: "Youtube",
    date: "2025-10-28 16:01",
    description:
      "公司发布了60年来首个新的计算模型，即物理驱动计算机，旨在提供机器学习能力和知识嵌入模拟器中，加速学习和仿真过程。新计算器类构允许...",
    company: "英伟达(US:NVDA)",
    views: 4797,
    tags: [],
  },
  {
    id: "3",
    type: "financials",
    title: "特斯拉 2025 Q2 财报 - 营收增长与未来展望",
    source: "Tesla Inc.",
    date: "2025-07-23 21:30",
    description:
      "Q2 2025总收入为224.96亿美元，同比下降12%。汽车收入为166.61亿美元，同比下降16%。能源发电和存储收入为27.89亿美元，同比下降7%...",
    company: "特斯拉(US:TSLA)",
    views: 5234,
    tags: ["财报", "电动车", "新能源"],
  },
];

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-6">AI 投资研究引擎</h1>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="输入内容搜索公司、查找相关文档、直接向题题答案"
                className="pl-10 h-12 text-base"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="h-12">
                全部
              </Button>
              <Button variant="outline" className="h-12">
                文档
              </Button>
              <Button className="h-12 bg-violet-600 hover:bg-violet-700">
                智能问答
              </Button>
            </div>
          </div>
        </div>

        {/* Recommended Questions */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-600">问题推荐</span>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {recommendedQuestions.map((question, index) => (
              <Badge
                key={index}
                variant="outline"
                className="px-4 py-2 text-sm cursor-pointer hover:bg-violet-50 hover:text-violet-600 hover:border-violet-600 transition-colors"
              >
                {question}
              </Badge>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 text-sm">
          <span className="text-gray-600">过去 24 小时更新：</span>
          {stats.map((stat, index) => (
            <div key={index}>
              <span className="text-gray-600">{stat.label} </span>
              <span className="font-semibold text-violet-600">{stat.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hot Reports Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6">热门</h2>
        <div className="space-y-4">
          {hotReports.map((report) => (
            <Link key={report.id} href={`/${report.type}/${report.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">{report.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <span>{report.source}</span>
                    <span>·</span>
                    <span>{report.date}</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                    {report.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">{report.company}</span>
                      <span className="text-sm text-gray-400">👁 {report.views}</span>
                    </div>
                    {report.tags.length > 0 && (
                      <div className="flex gap-2">
                        {report.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
