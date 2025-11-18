"use client";
import { useState, useEffect, useRef, useMemo } from "react";
// 引入 Square（或 X）图标作为停止按钮
import { Globe, Upload, Loader2, Sparkles, Send, Download, Image, X, Square } from "lucide-react";
import dynamic from 'next/dynamic'; // 确保引入 next/dynamic
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// ==================== 🚀 终极安全的 iframe 渲染器（解决一切样式污染） ====================
const SafeHtmlIframe: React.FC<{ html: string }> = ({ html }) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        if (!iframeRef.current || !html) return;

        const iframe = iframeRef.current;
        const doc = iframe.contentDocument!;
        doc.open();
        doc.write(html);
        doc.close();

        // 注入核弹级 CSS 隔离，任何网站都跑不出去
        const style = doc.createElement("style");
        style.textContent = `
            html, body {
                margin: 0 !important;
                padding: 20px !important;
                max-width: 100% !important;
                overflow-x: hidden !important;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
                line-height: 1.6 !important;
                color: #1f2937 !important;
                background: white !important;
            }
            * { box-sizing: border-box !important; max-width: 100% !important; word-wrap: break-word !important; }
            img, video, iframe, object, embed { max-width: 100% !important; height: auto !important; display: block !important; }
            table { width: auto !important; max-width: 100% !important; table-layout: fixed; border-collapse: collapse; }
            pre, code { white-space: pre-wrap !important; word-break: break-all !important; }
            a { color: #0066cc; text-decoration: underline; cursor: pointer; }
        `;
        doc.head.appendChild(style);

        // 注入脚本处理链接点击，postMessage 到父页面
        const script = doc.createElement("script");
        script.textContent = `
            document.addEventListener('click', (e) => {
                if (e.target.tagName === 'A') {
                    e.preventDefault();
                    const href = e.target.href;
                    if (href) {
                        window.parent.postMessage({ type: 'navigate', url: href }, '*');
                    }
                }
            });
        `;
        doc.body.appendChild(script);
    }, [html]);

    return (
        <iframe
            ref={iframeRef}
            className="w-full h-full border-0"
            sandbox="allow-same-origin allow-scripts allow-popups"
            title="fetched-web-content"
            loading="lazy"
        />
    );
};

// ==================== 优化后的 Markdown/HTML 渲染器 ====================
const MarkdownRenderer: React.FC<{ content: string; className?: string }> = ({ content, className = "" }) => {
    // 检查内容是否以 HTML 标签开头
    const isHtml = content.trim().startsWith('<');
    if (isHtml) {
        // 如果是 HTML，使用 SafeHtmlIframe 进行隔离渲染
        return <SafeHtmlIframe html={content} />;
    }
    // 否则使用 ReactMarkdown 渲染 (适用于 Markdown 格式的总结和错误信息)
    return (
        <div className={`prose prose-sm max-w-none text-gray-800 ${className}`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
    );
};

// ==================== 自定义组件 ====================
const Button = ({
    children,
    className = "",
    onClick,
    variant = "default",
    size = "default",
    disabled = false,
}: {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    variant?: "default" | "outline" | "ghost";
    size?: "sm" | "default";
    disabled?: boolean;
}) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1 ${
            variant === "outline"
                ? "border border-gray-300 text-gray-700 hover:bg-gray-50"
                : variant === "ghost"
                ? "text-gray-600 hover:bg-gray-100"
                : "bg-violet-600 text-white hover:bg-violet-700"
        } ${size === "sm" ? "text-xs h-8" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
        {children}
    </button>
);

const Input = ({
    placeholder,
    value,
    onChange,
    onKeyPress,
    className = "",
}: {
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    className?: string;
}) => (
    <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyPress={onKeyPress}
        className={`px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 w-full h-full ${className}`}
    />
);

const AILoadingIndicator = () => (
    <div className="flex items-center space-x-2 p-3 rounded-xl text-sm max-w-[80%] w-fit
        text-gray-800
        relative overflow-hidden
        shadow-sm"
        style={{ backgroundColor: '#E6F4E8' }}
    >
        <span className="text-gray-600 font-medium z-20">AI数据科学家正在思考</span>
        <div className="flex space-x-1 z-20">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-[pulse-slow_1.5s_infinite_0s]"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-[pulse-slow_1.5s_infinite_0.2s]"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-[pulse-slow_1.5s_infinite_0.4s]"></div>
        </div>
       
        <div className="absolute inset-0 z-10 pointer-events-none
            bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.7)50%,transparent_100%)]
            animate-[loading-shine_1.5s_linear_infinite]"
            style={{ width: '100%', left: '-100%', position: 'absolute' }}
        ></div>
    </div>
);

const AvatarContextMenu = ({ x, y, target, onReplace, onClose }: {
    x: number;
    y: number;
    target: 'user' | 'ai' | null;
    onReplace: (target: 'user' | 'ai', imageUrl: string | ArrayBuffer | null) => void;
    onClose: () => void;
}) => {
    if (!target) return null;
    const title = target === 'user' ? '用户头像' : 'AI 头像';
    const fileInputRef = useRef<HTMLInputElement>(null);
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onReplace(target, reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            onClose();
        }
       
        if (e.target) {
            e.target.value = '';
        }
    };
    return (
        <div
            className="fixed z-[100] bg-white border border-gray-200 rounded-xl shadow-2xl p-2 w-52 text-sm context-menu-wrapper"
            style={{ top: y, left: x }}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
        >
            <div className="font-bold text-gray-800 mb-1 px-3 py-1 border-b border-gray-100">
                替换 {title}
            </div>
            <button
                onClick={handleUploadClick}
                className="w-full text-left px-3 py-2 hover:bg-violet-100 rounded-lg flex items-center gap-2 text-gray-800 transition-colors"
            >
                <Image className="w-4 h-4 text-violet-600" />
                从本地上传图片
            </button>
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
};

interface EarningsProps {
    initialPdfUrl?: string;
}
const Earnings: React.FC<EarningsProps> = ({ initialPdfUrl = "" }) => {
    // === 默认头像常量 ===
    const DEFAULT_AI_AVATAR = "https://api.dicebear.com/7.x/bottts/svg?seed=DataScientist&backgroundColor=5c68ff";
    const DEFAULT_USER_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=User&backgroundColor=ffb84d";
   
    // === 状态变量 ===
    const [pdfUrl, setPdfUrl] = useState(initialPdfUrl);
    // 关键修改: 存储 API 抓取的内容（HTML 或 Markdown 错误信息）
    const [fetchedContent, setFetchedContent] = useState<string>("");
    const [inputUrl, setInputUrl] = useState("");
    // 关键修改: "web" 改为 "fetched"
    const [viewMode, setViewMode] = useState<"pdf" | "fetched" | "none">("none");
    const [isLoading, setIsLoading] = useState(false);
    const [isChatting, setIsChatting] = useState(false);
    const [messages, setMessages] = useState<{ user: string; ai: string }[]>([]);
    const [input, setInput] = useState("");
    const [activeTab, setActiveTab] = useState<"summary" | "chat">("summary");
    const [isDragging, setIsDragging] = useState(false);
    const [leftWidth, setLeftWidth] = useState(60);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [summary, setSummary] = useState("## 智能总结\n\n请在左侧加载 PDF 或网页，然后点击下方按钮生成总结。**AI 将以结构化的 Markdown 格式输出内容，包括列表和表格等**。");
    const [customAIAvatar, setCustomAIAvatar] = useState(DEFAULT_AI_AVATAR);
    const [customUserAvatar, setCustomUserAvatar] = useState(DEFAULT_USER_AVATAR);
    const [contextMenu, setContextMenu] = useState<{
        visible: boolean;
        x: number;
        y: number;
        target: 'user' | 'ai' | null;
    }>({ visible: false, x: 0, y: 0, target: null });
    const abortControllerRef = useRef<AbortController | null>(null);
    // === 引用 ===
    const containerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
   
    // 用于自定义 CSS 动画，防止污染全局 CSS
    const chatStyle = `
        @keyframes pulse-slow {
            0%, 100% {
                opacity: 0.5;
            }
            50% {
                opacity: 1;
            }
        }
        @keyframes loading-shine {
            from {
                left: -100%;
            }
            to {
                left: 100%;
            }
        }
    `;
    // === Hooks ===
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isChatting]);
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = (x / rect.width) * 100;
            setLeftWidth(Math.min(Math.max(percentage, 30), 80));
        };
       
        const handleMouseUp = () => {
            setIsDragging(false);
            document.body.style.cursor = "default";
        };
       
        if (isDragging) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
            document.body.style.cursor = "col-resize";
        }
       
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            document.body.style.cursor = "default";
        };
    }, [isDragging]);
   
    useEffect(() => {
        const handleClick = () => {
            setContextMenu({ visible: false, x: 0, y: 0, target: null });
        };
        document.addEventListener('click', handleClick);
       
        const handleContextClick = (e: MouseEvent) => {
            if (!(e.target as HTMLElement).closest('.avatar-container') && !(e.target as HTMLElement).closest('.context-menu-wrapper')) {
                setContextMenu({ visible: false, x: 0, y: 0, target: null });
            }
        };
        document.addEventListener('contextmenu', handleContextClick);
        return () => {
            document.removeEventListener('click', handleClick);
            document.removeEventListener('contextmenu', handleContextClick);
        };
    }, []);
                   
    const handleContextMenu = (e: React.MouseEvent, target: 'user' | 'ai') => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            target,
        });
    };
    const handleReplaceAvatar = (target: 'user' | 'ai', imageUrl: string | ArrayBuffer | null) => {
        if (typeof imageUrl !== 'string') return;
        if (target === 'user') {
            setCustomUserAvatar(imageUrl);
        } else {
            setCustomAIAvatar(imageUrl);
        }
        setContextMenu({ visible: false, x: 0, y: 0, target: null });
    };
   
    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type === "application/pdf") {
            const url = URL.createObjectURL(file);
            setPdfUrl(url);
            setFetchedContent(""); // 清除旧的网页内容
            setViewMode("pdf");
            setInputUrl(`[本地文件] ${file.name}`);
        }
    };
   
    /**
     * 🚀 关键修复：调用后端代理来抓取网页内容
     */
    const fetchWebContent = async (url: string) => {
        setIsLoading(true);
        // 更新为 API 抓取中的提示信息
        setFetchedContent("## 正在连接代理服务...\n\n### 网页 URL："+url+"\n\n请等待后端代理服务抓取和处理内容...");
        setViewMode("fetched"); // 设置为抓取内容模式
       
        try {
            const response = await fetch(`/api/fetch-web?url=${encodeURIComponent(url)}`);
           
            if (!response.ok) {
                throw new Error(`API 代理调用失败，状态码: ${response.status}`);
            }
            const data = await response.json();
           
            // 检查 API 返回是否为错误信息（包含 error 字段）
            if (data.error) {
                // 如果 API 返回了错误内容，通常是 Markdown 格式的错误信息
                setFetchedContent(data.content || data.message);
            } else {
                 // 成功返回清理后的 HTML 内容
                setFetchedContent(data.content);
            }
        } catch (error) {
            console.error("Fetch web content failed:", error);
           
            const errorMessage = (error instanceof Error) ? error.message : '未知连接错误';
            // 提示用户检查后端
            const markdownError = `## ❌ 网页加载失败\n\n**请求的 URL：** \`${url}\`\n\n**错误信息：** ${errorMessage}\n\n**请检查：**\n1. Next.js 后端服务（API Route）是否已运行。\n2. **网络配置：** 运行 Next.js 的服务器是否被防火墙阻止了外部网络访问。\n3. **反爬虫：** 对于 Bing 或 Apple，您的后端代理需要使用 **无头浏览器** (如 Puppeteer) 而非简单的 \`fetch\` 来绕过它们的反爬虫。请尝试一个更简单的网站，如 \`http://example.com\` 进行测试。`;
            setFetchedContent(markdownError);
        } finally {
            setIsLoading(false);
        }
    };
    const navigateToUrl = (url: string) => {
        if (!url) return;
       
        if (url.toLowerCase().endsWith('.pdf') || url.toLowerCase().includes('.pdf?')) {
            setPdfUrl(url);
            setFetchedContent("");
            setViewMode("pdf");
        } else {
            setPdfUrl("");
            // 关键修复：调用 fetchWebContent 代理抓取内容
            fetchWebContent(url);
        }
        setInputUrl(url);
    };
    const handleUrl = () => {
        let url = inputUrl.trim();
        if (!url || url.startsWith("[本地文件]")) return;
        if (!/^https?:\/\//i.test(url)) {
            if (url.includes(".")) {
                url = "https://" + url;
            } else {
                // 默认使用 Bing 搜索
                url = `https://cn.bing.com/search?q=${encodeURIComponent(url)}`;
            }
        }
        try {
            new URL(url);
            navigateToUrl(url);
        } catch (e) {
            console.error(e);
            if (typeof window !== 'undefined') {
                const message = "请输入有效 URL";
                const customModal = document.createElement('div');
                customModal.innerHTML = `<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;justify-content:center;align-items:center;z-index:10000;"><div style="background:white;padding:20px;border-radius:10px;box-shadow:0 4px 6px rgba(0,0,0,0.1);"><p>${message}</p><button onclick="this.parentElement.parentElement.remove()" style="margin-top:15px;padding:5px 10px;background:#6366f1;color:white;border:none;border-radius:5px;cursor:pointer;">确定</button></div></div>`;
                document.body.appendChild(customModal);
            }
        }
    };
   
    /**
     * 处理渲染内容中的链接点击事件。（现在通过 postMessage 处理）
     */
    useEffect(() => {
        const handleMessage = (e: MessageEvent) => {
            if (e.data.type === 'navigate' && e.data.url) {
                navigateToUrl(e.data.url);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const getContextForModel = (): { type: "pdf" | "web" | "none"; url: string; content: string; warning: string } => {
        if (viewMode === "pdf" && pdfUrl) {
            return { type: "pdf", url: pdfUrl, content: "", warning: "本地 PDF URL 无法被服务器直接访问，后端需要文件本身。" };
        }
       
        if (viewMode === "fetched" && fetchedContent && inputUrl) {
            const isError = fetchedContent.includes("❌"); // 通过错误符号判断是否为错误信息
            return {
                type: "web",
                url: inputUrl,
                content: isError ? "" : fetchedContent,
                warning: isError ? "网页内容抓取失败，将仅使用通用知识。" : ""
            };
        }
       
        return { type: "none", url: "", content: "", warning: "左侧未加载任何内容。" };
    };
    const getModelPrompt = (userMsg: string, context: ReturnType<typeof getContextForModel>, isSummary: boolean): string => {
        const { type, url, content, warning } = context;
       
        let contextInfo = "";
        if (type !== "none") {
            const contentSnippet = content.length > 1000 ? content.substring(0, 1000) + '... (内容已截断)' : content;
           
            if (content) {
                 contextInfo = `请参考以下由代理抓取的内容 (URL: ${url}) 进行回复：\n\n--- 内容片段开始 ---\n${contentSnippet}\n--- 内容片段结束 ---\n`;
            } else if (type === "pdf") {
                 contextInfo = `请注意，以下是一个本地 PDF 文件 (URL: ${url})。请假设您已获取到 PDF 内容并进行回复。`;
            }
          
        }
       
        const instruction = isSummary
            ? `请用中文总结提供的文档内容（控制在300字以内）。请务必使用结构化的 Markdown 格式输出，例如：列表、加粗、二级标题，以及如果内容包含数据，请使用 Markdown 表格呈现。`
            : `请根据提供的上下文回答用户问题：${userMsg}。请使用结构化的 Markdown 格式输出，包括列表、加粗、和表格（如果适用）。`;
        let finalPrompt = `${contextInfo}\n\n${instruction}`;
        if (warning) {
            finalPrompt = `警告：内容提取失败（${warning}）。用户问题是：${userMsg}。请仅依靠通用知识回答，并使用 Markdown 格式。`;
        }
       
        return finalPrompt;
    };
    async function* callOllamaStream(prompt: string, signal: AbortSignal): AsyncGenerator<string> {
        const url = "http://localhost:11434/api/generate";
        let errorOccurred = false;
        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "gpt-oss:20b",
                    prompt,
                    stream: true,
                }),
                signal,
            });
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`HTTP ${res.status}: ${errorText}`);
            }
            if (!res.body) {
                throw new Error("响应体为空，无法进行流式传输。");
            }
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            while (true) {
                if (signal.aborted) {
                    reader.cancel('Operation aborted by user.');
                    console.log("Ollama 流已中止。");
                    return;
                }
               
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const data = JSON.parse(line);
                        const chunk = data.response;
                        if (chunk) {
                            yield chunk;
                        }
                        if (data.done) {
                            return;
                        }
                    } catch (e) {
                        if ((e as Error).name === 'AbortError') {
                            console.log("Ollama 流已中止。");
                            return;
                        }
                        console.error("解析 JSONL 失败:", e, "行内容:", line);
                        errorOccurred = true;
                        yield `\n\n❌ [流解析错误: ${line}]`;
                        return;
                    }
                }
            }
        } catch (err) {
            if ((err as Error).name === 'AbortError') {
                console.log("Ollama 流已中止。");
                return;
            }
            console.error("Ollama 流 API 错误:", err);
            const errorMessage = `❌ Ollama API 连接失败。\n详细错误：${(err as Error).message}\n\n请确保：\n1. Ollama 正在运行: \`ollama serve\`\n2. 模型已拉取: \`ollama pull gpt-oss:20b\`\n3. **更重要的是，由于跨域/同源限制，请使用 Next.js API Route (或其它后端) 作为代理，在服务器端完成内容抓取和 Ollama 调用。**`;
            if (!errorOccurred) {
                yield errorMessage;
            }
        } finally {
            setIsChatting(false);
            abortControllerRef.current = null;
        }
    }
    const summarizeContent = async () => {
        if (isSummarizing) return;
        setIsSummarizing(true);
        setSummary("## 智能总结\n\n正在连接 Ollama 生成总结...");
        const context = getContextForModel();
        const { type, warning } = context;
        let finalSummary = "";
        if (type === "none" || warning) {
            finalSummary = `## 智能总结\n\n**内容提取失败或内容为空。**\n\n原因：${warning || "左侧未加载任何内容。"}`;
            setIsSummarizing(false);
            setSummary(finalSummary);
            return;
        }
       
        const prompt = getModelPrompt("总结", context, true);
       
        try {
            const res = await fetch("http://localhost:11434/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "qwen3-vl:4b",
                    prompt,
                    stream: false,
                }),
            });
           
            if (!res.ok) {
                const err = await res.text();
                throw new Error(`HTTP ${res.status}: ${err}`);
            }
            const data = await res.json();
            const result = data.response || "（无响应）";
            finalSummary = `## 智能总结 (gpt-oss:20b 生成)\n\n${result}`;
           
        } catch (err) {
            finalSummary = `❌ Ollama API 连接失败。\n详细错误：${(err as Error).message}\n\n请确保：\n1. Ollama 正在运行: \`ollama serve\`\n2. 模型已拉取: \`ollama pull gpt-oss:20b\`\n3. **后端 API (Next.js Route Handler) 正在运行，并能够处理 URL 抓取/PDF 解析，然后调用 Ollama。**`;
        }
        setSummary(finalSummary);
        setIsSummarizing(false);
    };
    const handleSend = async () => {
        if (!input.trim() || isChatting) return;
        const controller = new AbortController();
        abortControllerRef.current = controller;
        const userMsg = input;
        setInput("");
       
        setMessages((prev) => [...prev, { user: userMsg, ai: "" }]);
        setIsChatting(true);
        const context = getContextForModel();
        const promptWithContext = getModelPrompt(userMsg, context, false);
       
        let streamedText = "";
        try {
            for await (const chunk of callOllamaStream(promptWithContext, controller.signal)) {
                streamedText += chunk;
                setMessages((prev) => {
                    const newMsgs = [...prev];
                    if (newMsgs.length > 0) {
                        newMsgs[newMsgs.length - 1].ai = streamedText;
                    }
                    return newMsgs;
                });
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }
        } catch (e) {
            if ((e as Error).name !== 'AbortError') {
                const errorMsg = `流处理异常: ${(e as Error).message}`;
                streamedText += errorMsg;
                setMessages((prev) => {
                    const newMsgs = [...prev];
                    if (newMsgs.length > 0) {
                        newMsgs[newMsgs.length - 1].ai = streamedText;
                    }
                    return newMsgs;
                });
            }
        }
    };
    const handleStop = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setIsChatting(false);
            abortControllerRef.current = null;
        }
    };
    return (
        <div className="h-dvh flex flex-col bg-white font-sans antialiased relative">
            <style>{chatStyle}</style>
            {/* 主内容区：左右分栏 */}
            <div ref={containerRef} className="flex-1 flex min-h-0">
                {/* 左侧 PDF/Web 区 */}
                <div
                    style={{ width: `${leftWidth}%` }}
                    className="border-r border-gray-200 flex flex-col min-h-0"
                >
                    <div className="border-b bg-white p-3 flex items-center gap-2 flex-shrink-0">
                        {/* URL/搜索栏 */}
                        <div className="flex-grow flex-shrink min-w-0 relative h-10">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="输入 URL 或搜索关键词（回车跳转）"
                                value={inputUrl}
                                onChange={(e) => setInputUrl(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && handleUrl()}
                                className="pl-10 text-sm"
                            />
                        </div>
                       
                        {(pdfUrl || fetchedContent) && (
                                <Button variant="ghost" size="sm" onClick={() => {
                                    setPdfUrl("");
                                    setFetchedContent("");
                                    setInputUrl("");
                                    setViewMode("none");
                                    setSummary("## 智能总结\n\n请在左侧加载 PDF 或网页，然后点击下方按钮生成总结。**AI 将以结构化的 Markdown 格式输出内容，包括列表和表格等**。");
                                }} className="h-10 text-gray-500 hover:text-red-500 flex-shrink-0">
                                    <X className="h-4 w-4" />
                                </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="h-10 flex-shrink-0"
                        >
                            <Upload className="h-4 w-4 mr-1" />
                            上传 PDF
                        </Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf"
                            onChange={handleUpload}
                            className="hidden"
                        />
                    </div>
                    <div className="flex-1 bg-gray-50 min-h-0">
                        {viewMode === "pdf" && pdfUrl ? (
                            // 保持使用 iframe 渲染 PDF，这是最稳定的方式
                            <div className="h-full bg-white flex flex-col min-h-0 shadow-inner">
                                <iframe
                                    src={pdfUrl}
                                    title="PDF Document Viewer"
                                    className="w-full flex-grow border-0"
                                    style={{ minHeight: '100%' }}
                                    allow="fullscreen"
                                >
                                    您的浏览器不支持内嵌框架，但您可以通过以下链接下载 PDF：
                                    <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-violet-500 underline">下载 PDF</a>
                                </iframe>
                            </div>
                        ) : viewMode === "fetched" && fetchedContent ? (
                            // 🚀 关键修复：使用 MarkdownRenderer 渲染 API 抓取的内容，不再是 iframe
                            <div
                                ref={contentRef}
                                className="h-full bg-white relative p-6 overflow-y-auto"
                            >
                                {isLoading && (
                                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-start justify-center pt-10 z-10">
                                        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
                                    </div>
                                )}
                                {/* MarkdownRenderer 现在会根据内容自动选择 SafeHtmlIframe 或 ReactMarkdown */}
                                <MarkdownRenderer content={fetchedContent} />
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500">
                                <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-gray-100">
                                    <div className="bg-violet-100 text-violet-600 border border-violet-300 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                        <Sparkles className="w-8 h-8" />
                                    </div>
                                    <p className="text-xl font-semibold text-gray-700 mb-2">智能文档分析</p>
                                    <p className="text-sm">
                                        ☝️ 上传 <span className="font-bold text-violet-600">PDF</span> 文件或输入 <span className="font-bold text-violet-600">URL</span> 开始分析和对话。
                                    </p>
                                    <p className="text-sm mt-1 text-gray-500">
                                        （如：<span className="font-bold">公司财报官网</span> 或 <span className="font-bold">PDF 直链</span>）
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {/* 分隔条 */}
                <div
                    className={`w-1 bg-gray-200 hover:bg-violet-500 cursor-col-resize transition-colors ${
                        isDragging ? "bg-violet-600 w-2" : ""
                    }`}
                    onMouseDown={() => setIsDragging(true)}
                />
                {/* 右侧智能区 */}
                <div style={{ width: `${100 - leftWidth}%` }} className="flex flex-col min-h-0">
                    {/* 标签页 */}
                    <div className="flex border-b border-gray-200 flex-shrink-0 bg-white">
                        <button
                            onClick={() => setActiveTab("summary")}
                            className={`flex-1 px-6 py-3 text-sm font-semibold transition-colors ${
                                activeTab === "summary"
                                    ? "text-violet-600 border-b-2 border-violet-600"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                            }`}
                        >
                            📊 总结分析
                        </button>
                        <button
                            onClick={() => setActiveTab("chat")}
                            className={`flex-1 px-6 py-3 text-sm font-semibold transition-colors ${
                                activeTab === "chat"
                                    ? "text-violet-600 border-b-2 border-violet-600"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                            }`}
                        >
                            🤖 AI对话问答
                        </button>
                    </div>
                    {/* 内容区 */}
                    <div className="flex-1 flex flex-col min-h-0 bg-white">
                        {activeTab === "summary" ? (
                            <div className="flex-1 flex flex-col p-6 gap-4 overflow-auto">
                                <div className="flex-1 bg-white p-0 rounded-xl shadow-md text-sm overflow-auto border border-gray-100">
                                    <MarkdownRenderer content={summary} className="p-6" />
                                </div>
                                <Button
                                    onClick={summarizeContent}
                                    disabled={isSummarizing || viewMode === "none"}
                                    className="self-start shadow-md"
                                >
                                    {isSummarizing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                            AI数据科学家正在思考...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="h-4 w-4 mr-1" />
                                            重新生成总结
                                        </>
                                    )}
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {messages.length === 0 ? (
                                        <div className="text-center text-gray-500 py-12">
                                            <p className="text-lg text-gray-600">欢迎使用 AI 智能问答！</p>
                                            <p className="text-sm mt-1">您可以提问关于左侧文档或网页的任何问题。</p>
                                        </div>
                                    ) : (
                                        messages.map((msg, i) => (
                                            <div key={i} className="flex flex-col space-y-3">
                                                {/* 用户消息（右）*/}
                                                {msg.user && (
                                                    <div className="flex justify-end items-start gap-3 w-full">
                                                        <div className="max-w-[80%] px-4 py-2 rounded-2xl bg-violet-600 text-white text-sm shadow-md whitespace-pre-wrap">
                                                            {msg.user}
                                                        </div>
                                                        <img
                                                            src={customUserAvatar}
                                                            alt="User Avatar"
                                                            className="w-8 h-8 rounded-full border border-gray-300 flex-shrink-0 cursor-pointer transition-transform hover:scale-105 avatar-container"
                                                            onContextMenu={(e) => handleContextMenu(e, 'user')}
                                                        />
                                                    </div>
                                                )}
                                                {/* AI 消息（左）*/}
                                                <div className="flex justify-start items-start gap-3 w-full">
                                                        <img
                                                            src={customAIAvatar}
                                                            alt="AI Avatar"
                                                            className="w-8 h-8 rounded-full border border-gray-300 flex-shrink-0 cursor-pointer transition-transform hover:scale-105 avatar-container"
                                                            onContextMenu={(e) => handleContextMenu(e, 'ai')}
                                                        />
                                                    {/* 思考动画/流式输出显示 */}
                                                    {i === messages.length - 1 && isChatting && msg.ai.length === 0 ? (
                                                            <AILoadingIndicator />
                                                    ) : (
                                                        msg.ai && (
                                                                <div
                                                                    className="max-w-[80%] p-0 rounded-2xl text-gray-800 shadow-sm"
                                                                    style={{ backgroundColor: '#E6F4E8' }}
                                                                >
                                                                    <MarkdownRenderer content={msg.ai} className="px-4 py-2" />
                                                                </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                                {/* 输入框 */}
                                <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0 shadow-inner">
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                                            placeholder={isChatting ? "AI数据科学家正在思考..." : "与 AI数据科学家 对话..."}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 transition-shadow"
                                            disabled={isChatting}
                                        />
                                       
                                        {isChatting ? (
                                            <button
                                                onClick={handleStop}
                                                className="w-12 h-12 bg-red-500 text-white hover:bg-red-600 rounded-xl flex items-center justify-center transition-colors shadow-md"
                                                title="停止生成"
                                            >
                                                <Square className="h-5 w-5 fill-white" />
                                            </button>
                                        ) : (
                                            <Button onClick={handleSend} disabled={!input.trim()} className="shadow-md w-12 h-12 rounded-xl p-0">
                                                <Send className="h-5 w-5" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
           
            {/* 渲染上下文菜单 */}
            {contextMenu.visible && (
                <AvatarContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    target={contextMenu.target}
                    onReplace={handleReplaceAvatar}
                    onClose={() => setContextMenu({ visible: false, x: 0, y: 0, target: null })}
                />
            )}
        </div>
    );
};
export default Earnings;
