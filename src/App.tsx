import {
  AlertTriangle,
  BarChart3,
  ClipboardList,
  Copy,
  Database,
  FileText,
  Gauge,
  Hash,
  Image,
  Layers,
  Link2,
  Loader2,
  MessageSquareText,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
  Wand2
} from "lucide-react";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { niches, platforms, samplePosts, tones } from "./data/knowledge";
import { runAgent } from "./lib/agentEngine";
import type {
  AgentResult,
  CreatorProfile,
  FanStage,
  Niche,
  ParseResult,
  Platform,
  SourceInput,
  Tone,
  UserIntent
} from "./types";

const fanStages: FanStage[] = ["<1k 起步期", "1k-1w 冷启动", "1w-10w 上升期", "10w+ 成熟期"];
const initialSample = samplePosts[0];

const buildInitialProfile = (): CreatorProfile => ({
  platform: initialSample.platform,
  niche: initialSample.niche,
  tone: initialSample.tone,
  fanStage: "1w-10w 上升期",
  monetizationGoal: "提升商单承接率，做出一篇品牌愿意投放的种草内容",
  brandBrief: initialSample.brandBrief
});

const buildInitialSource = (): SourceInput => ({
  sampleId: initialSample.id,
  url: initialSample.url,
  title: initialSample.title,
  content: initialSample.content,
  imageCue: initialSample.imageCue
});

const buildInitialIntent = (): UserIntent => ({
  story: "我想讲熬夜后皮肤暗沉这件事，很多人第一反应是买猛药精华，但其实应该先判断自己的肤况。",
  viewpoint: "不要盲目追求高浓度，先找到自己最需要解决的问题。",
  product: "一款主打温和提亮、适合通勤熬夜党的精华",
  desiredShape: "像真实测评，不要像硬广；最好有一点避坑感。",
  mustMention: "敏感肌要先局部测试，不能承诺立刻变白。",
  avoid: "不要写成夸张功效文，不要说根治、100%有效。"
});

type Stage = "profile" | "parse" | "intent" | "generate" | "evaluate" | "log";

const stages: Array<{ id: Stage; label: string; icon: typeof ClipboardList }> = [
  { id: "profile", label: "博主档案", icon: ClipboardList },
  { id: "parse", label: "对标解析", icon: Search },
  { id: "intent", label: "用户想法", icon: MessageSquareText },
  { id: "generate", label: "共创产出", icon: Wand2 },
  { id: "evaluate", label: "发布评估", icon: Gauge },
  { id: "log", label: "数据日志", icon: FileText }
];

const getInitialStage = (): Stage => {
  const value = new URLSearchParams(window.location.search).get("stage") as Stage | null;
  return value && stages.some((stage) => stage.id === value) ? value : "profile";
};

function App() {
  const [profile, setProfile] = useState<CreatorProfile>(buildInitialProfile);
  const [source, setSource] = useState<SourceInput>(buildInitialSource);
  const [intent, setIntent] = useState<UserIntent>(buildInitialIntent);
  const [activeStage, setActiveStage] = useState<Stage>(getInitialStage);
  const [agentResult, setAgentResult] = useState<AgentResult | null>(null);
  const [parseStatus, setParseStatus] = useState<ParseResult | null>(null);
  const [runningParse, setRunningParse] = useState<string | null>(null);
  const [runningAgent, setRunningAgent] = useState(false);
  const [copied, setCopied] = useState(false);

  const fallbackResult = useMemo(() => runAgent(profile, source, intent), [profile, source, intent]);
  const result = agentResult || fallbackResult;
  const selectedSample = samplePosts.find((sample) => sample.id === source.sampleId) || initialSample;

  const updateProfile = <K extends keyof CreatorProfile>(key: K, value: CreatorProfile[K]) => {
    setProfile((current) => ({ ...current, [key]: value }));
  };

  const updateSource = <K extends keyof SourceInput>(key: K, value: SourceInput[K]) => {
    setSource((current) => ({ ...current, [key]: value }));
    setAgentResult(null);
  };

  const updateIntent = <K extends keyof UserIntent>(key: K, value: UserIntent[K]) => {
    setIntent((current) => ({ ...current, [key]: value }));
    setAgentResult(null);
  };

  const applySample = (sampleId: string) => {
    const sample = samplePosts.find((item) => item.id === sampleId) || initialSample;
    setSource({
      sampleId: sample.id,
      url: sample.url,
      title: sample.title,
      content: sample.content,
      imageCue: sample.imageCue
    });
    setProfile((current) => ({
      ...current,
      platform: sample.platform,
      niche: sample.niche,
      tone: sample.tone,
      brandBrief: sample.brandBrief
    }));
    setParseStatus({ ok: true, mode: "manual", title: sample.title, content: sample.content, message: "已载入内置样例。" });
    setAgentResult(null);
    setActiveStage("intent");
  };

  const resetDemo = () => {
    setProfile(buildInitialProfile());
    setSource(buildInitialSource());
    setIntent(buildInitialIntent());
    setAgentResult(null);
    setParseStatus(null);
    setCopied(false);
    setActiveStage("profile");
  };

  const callParse = async (mode: "professional" | "xhs" | "manual") => {
    setRunningParse(mode);
    setParseStatus(null);
    try {
      const data = await requestJson<ParseResult>("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, url: source.url, title: source.title, content: source.content })
      });
      setParseStatus(data);
      if (data.ok) {
        setSource((current) => ({
          ...current,
          title: data.title || current.title,
          content: data.content || current.content,
          imageCue: data.imageCue || current.imageCue
        }));
        setAgentResult(null);
      }
    } catch (error) {
      setParseStatus({
        ok: false,
        mode,
        message: error instanceof Error ? error.message : "解析请求失败。"
      });
    } finally {
      setRunningParse(null);
    }
  };

  const runCoCreation = async () => {
    setRunningAgent(true);
    try {
      const data = await requestJson<{ ok: boolean; result?: AgentResult; message?: string }>("/api/agent/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, source, intent })
      });
      if (!data.ok || !data.result) {
        const fallback = runAgent(profile, source, intent);
        setAgentResult({
          ...fallback,
          source: "fallback",
          message: data.message || "模型调用失败，已使用本地兜底生成。"
        });
      } else {
        setAgentResult({ ...data.result, source: "deepseek", message: "DeepSeek 已完成真实共创生成。" });
      }
      setActiveStage("generate");
    } catch (error) {
      const fallback = runAgent(profile, source, intent);
      setAgentResult({
        ...fallback,
        source: "fallback",
        message: error instanceof Error ? error.message : "模型请求失败，已使用本地兜底生成。"
      });
      setActiveStage("generate");
    } finally {
      setRunningAgent(false);
    }
  };

  const copyLog = async () => {
    await navigator.clipboard.writeText(JSON.stringify(result.log, null, 2));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Sparkles size={22} />
          </div>
          <div>
            <p>博主 AI 运营助理</p>
            <span>Creator IP Ops Agent</span>
          </div>
        </div>

        <nav className="stage-list" aria-label="工作流">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            return (
              <button
                key={stage.id}
                type="button"
                className={activeStage === stage.id ? "active" : ""}
                onClick={() => setActiveStage(stage.id)}
              >
                <Icon size={18} />
                <span>{index + 1}. {stage.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="side-summary">
          <span>当前工作流</span>
          <strong>{selectedSample.label}</strong>
          <p>{profile.platform} / {profile.niche} / {result.source === "deepseek" ? "DeepSeek" : "本地兜底"}</p>
        </div>

        <div className="side-actions">
          <button type="button" onClick={resetDemo}>
            <RotateCcw size={16} />
            重置
          </button>
          <button type="button" className="primary" onClick={runCoCreation} disabled={runningAgent}>
            {runningAgent ? <Loader2 className="spin" size={16} /> : <Wand2 size={16} />}
            运行 Agent
          </button>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <span className="eyebrow">真实 Agent MVP / 工作台共创模式</span>
            <h1>用爆文结构加工用户自己的想法，而不是替用户凭空创作</h1>
          </div>
          <div className="topbar-actions">
            <button type="button" onClick={copyLog}>
              <Copy size={17} />
              {copied ? "已复制" : "复制日志"}
            </button>
            <button type="button" className="primary" onClick={runCoCreation} disabled={runningAgent}>
              {runningAgent ? <Loader2 className="spin" size={17} /> : <Wand2 size={17} />}
              {runningAgent ? "生成中" : "共创生成"}
            </button>
          </div>
        </header>

        <div className="grid">
          <section className="main-panel">
            {activeStage === "profile" && (
              <Panel icon={<ClipboardList size={20} />} title="博主档案" desc="五个核心赛道都保留，用档案约束 Agent 的表达和商业判断。">
                <Segmented label="主发布平台" value={profile.platform} options={platforms} onChange={(v) => updateProfile("platform", v as Platform)} />
                <Segmented label="内容赛道" value={profile.niche} options={niches} onChange={(v) => updateProfile("niche", v as Niche)} />
                <Segmented label="账号调性" value={profile.tone} options={tones} onChange={(v) => updateProfile("tone", v as Tone)} />
                <label className="field">
                  <span>粉丝阶段</span>
                  <select value={profile.fanStage} onChange={(event) => updateProfile("fanStage", event.target.value as FanStage)}>
                    {fanStages.map((stage) => (
                      <option key={stage}>{stage}</option>
                    ))}
                  </select>
                </label>
                <TextField label="变现目标" value={profile.monetizationGoal} onChange={(value) => updateProfile("monetizationGoal", value)} />
                <TextArea label="品牌 brief" value={profile.brandBrief} onChange={(value) => updateProfile("brandBrief", value)} rows={4} />
              </Panel>
            )}

            {activeStage === "parse" && (
              <Panel icon={<Link2 size={20} />} title="对标爆文解析" desc="先尝试链接解析，失败后用粘贴正文或 OCR 文本继续，不让工作流断掉。">
                <div className="notice">
                  <Database size={18} />
                  <div>
                    <strong>当前数据通道说明</strong>
                    <p>
                      首期尚未购买小红书/抖音专业取数 API，因此「专业取数」和「链接解析」暂作为后续能力预留。
                      接入 Just One API、千瓜、新红、灰豚等数据平台后，可直接把链接解析为标题、正文、互动数据和爆文结构。
                      当前可稳定使用「粘贴/OCR解析」：用户复制笔记正文、口播稿或截图 OCR 文本后，Agent 会继续完成拆解、共创和发布评估。
                    </p>
                  </div>
                </div>

                <div className="sample-strip">
                  {samplePosts.map((sample) => (
                    <button type="button" key={sample.id} className={source.sampleId === sample.id ? "sample active" : "sample"} onClick={() => applySample(sample.id)}>
                      <span>{sample.label}</span>
                      <small>{sample.platform}</small>
                    </button>
                  ))}
                </div>

                <TextField label="小红书 / 抖音 / 视频号对标链接" value={source.url} onChange={(value) => updateSource("url", value)} />
                <TextField label="标题" value={source.title} onChange={(value) => updateSource("title", value)} />
                <TextArea label="正文 / 口播稿 / OCR 文本" value={source.content} onChange={(value) => updateSource("content", value)} rows={8} />

                <div className="parse-actions">
                  <ActionButton icon={<Database size={17} />} loading={runningParse === "professional"} onClick={() => callParse("professional")} label="专业取数" />
                  <ActionButton icon={<Search size={17} />} loading={runningParse === "xhs"} onClick={() => callParse("xhs")} label="链接解析" />
                  <ActionButton icon={<Upload size={17} />} loading={runningParse === "manual"} onClick={() => callParse("manual")} label="粘贴/OCR解析" />
                </div>

                {parseStatus && (
                  <div className={parseStatus.ok ? "status ok" : "status warn"}>
                    {parseStatus.ok ? <ShieldCheck size={18} /> : <AlertTriangle size={18} />}
      <span>{parseStatus.message}</span>
      {!parseStatus.ok && (
        <small>
          当前接口：{window.location.origin}/api/parse
        </small>
      )}
    </div>
  )}
              </Panel>
            )}

            {activeStage === "intent" && (
              <Panel icon={<MessageSquareText size={20} />} title="用户想法输入" desc="这是共创 Agent 的关键：用户提供基础思路，Agent 负责平台化、结构化和商业化。">
                <TextArea label="今天想讲的事情" value={intent.story} onChange={(value) => updateIntent("story", value)} rows={4} />
                <TextArea label="想表达的观点" value={intent.viewpoint} onChange={(value) => updateIntent("viewpoint", value)} rows={3} />
                <TextArea label="想推广的产品或服务" value={intent.product} onChange={(value) => updateIntent("product", value)} rows={3} />
                <TextArea label="希望做成什么样" value={intent.desiredShape} onChange={(value) => updateIntent("desiredShape", value)} rows={3} />
                <TextArea label="需要注意的点" value={intent.mustMention} onChange={(value) => updateIntent("mustMention", value)} rows={3} />
                <TextArea label="不想写成什么样" value={intent.avoid} onChange={(value) => updateIntent("avoid", value)} rows={3} />
                <button type="button" className="run-button" onClick={runCoCreation} disabled={runningAgent}>
                  {runningAgent ? <Loader2 className="spin" size={18} /> : <Wand2 size={18} />}
                  运行共创 Agent
                </button>
              </Panel>
            )}

            {activeStage === "generate" && (
              <Panel icon={<Wand2 size={20} />} title="共创产出" desc={result.message || "标题、正文、脚本和封面方向同步产出。"}>
                <OutputStatus source={result.source || "fallback"} />
                <OutputBlock icon={<Search size={17} />} title="爆文拆解">
                  <p>{result.breakdown.formula}</p>
                  <div className="keyword-list">
                    {result.breakdown.keywords.map((keyword) => (
                      <i key={keyword}>{keyword}</i>
                    ))}
                  </div>
                </OutputBlock>
                <OutputBlock icon={<Hash size={17} />} title="标题 A/B">
                  <div className="title-list">
                    {result.generated.titles.map((title) => (
                      <span key={title}>{title}</span>
                    ))}
                  </div>
                </OutputBlock>
                <OutputBlock icon={<FileText size={17} />} title={`${profile.platform} 笔记正文`}>
                  <pre>{result.generated.note}</pre>
                </OutputBlock>
                <OutputBlock icon={<Layers size={17} />} title="短视频分镜">
                  <div className="script-grid">
                    {result.generated.script.map((item) => (
                      <article key={item.scene}>
                        <strong>{item.scene}</strong>
                        <span>{item.shot}</span>
                        <p>{item.line}</p>
                      </article>
                    ))}
                  </div>
                </OutputBlock>
                <OutputBlock icon={<Image size={17} />} title="封面方案">
                  <div className="cover-grid">
                    {result.generated.coverIdeas.map((idea) => (
                      <article key={idea.style}>
                        <strong>{idea.style}</strong>
                        <span>{idea.text}</span>
                        <p>{idea.direction}</p>
                      </article>
                    ))}
                  </div>
                </OutputBlock>
              </Panel>
            )}

            {activeStage === "evaluate" && (
              <Panel icon={<Gauge size={20} />} title="发布评估" desc="发布前给出热度、商单友好度、风险表达和下一步修改。">
                <div className="score-row">
                  <Metric label="流量潜力" value={result.evaluation.heatScore} tone="heat" />
                  <Metric label="商单友好度" value={result.evaluation.commercialScore} tone="money" />
                </div>
                <div className="verdict">
                  <ShieldCheck size={20} />
                  <strong>{result.evaluation.assistantVerdict}</strong>
                </div>
                <div className="two-column">
                  <OutputBlock icon={<AlertTriangle size={17} />} title="风险预警">
                    {result.evaluation.risks.map((risk) => (
                      <div className="risk-item" key={risk.term}>
                        <strong>{risk.term}</strong>
                        <p>{risk.reason}</p>
                        <span>{risk.suggestion}</span>
                      </div>
                    ))}
                  </OutputBlock>
                  <OutputBlock icon={<BarChart3 size={17} />} title="建议改这 3 点">
                    <ol className="improvements">
                      {result.evaluation.improvements.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ol>
                    <p className="publish-window">{result.evaluation.publishWindow}</p>
                  </OutputBlock>
                </div>
              </Panel>
            )}

            {activeStage === "log" && (
              <Panel icon={<FileText size={20} />} title="结构化数据日志" desc="用于展示 Agent 闭环：输入、生成来源、分数和下一步动作。">
                <div className="report-summary">
                  <article>
                    <span>输入来源</span>
                    <strong>{source.url || "用户粘贴/OCR"}</strong>
                  </article>
                  <article>
                    <span>生成来源</span>
                    <strong>{result.source === "deepseek" ? "DeepSeek API" : "本地兜底"}</strong>
                  </article>
                  <article>
                    <span>成功指标</span>
                    <strong>{result.evaluation.successMetric}</strong>
                  </article>
                </div>
                <pre className="json-log">{JSON.stringify(result.log, null, 2)}</pre>
              </Panel>
            )}
          </section>

          <aside className="assistant-panel">
            <div className="assistant-card">
              <div className="assistant-head">
                <Sparkles size={19} />
                <div>
                  <strong>Agent 判断</strong>
                  <span>{result.source === "deepseek" ? "真实模型生成" : "稳定兜底生成"}</span>
                </div>
              </div>
              <div className="insight">
                <span>当前策略</span>
                <p>先拆对标爆文结构，再把用户想法转译成平台表达，最后做发布前评估。</p>
              </div>
              <div className="insight">
                <span>内容结构</span>
                <ul>
                  {result.breakdown.structure.map((item) => (
                    <li key={item.name}>
                      <strong>{item.name}</strong>
                      <p>{item.detail}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="insight accent">
                <span>下一步</span>
                <p>{activeStage === "intent" ? "补齐自己的想法后运行 Agent。" : result.evaluation.assistantVerdict}</p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Panel({ icon, title, desc, children }: { icon: ReactNode; title: string; desc: string; children: ReactNode }) {
  return (
    <div className="panel-content">
      <div className="section-heading">
        {icon}
        <div>
          <h2>{title}</h2>
          <p>{desc}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function Segmented<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: T[]; onChange: (value: T) => void }) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="segmented">
        {options.map((option) => (
          <button type="button" key={option} className={value === option ? "active" : ""} onClick={() => onChange(option)}>
            {option}
          </button>
        ))}
      </div>
    </label>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextArea({ label, value, rows, onChange }: { label: string; value: string; rows: number; onChange: (value: string) => void }) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea value={value} rows={rows} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function ActionButton({ icon, label, loading, onClick }: { icon: ReactNode; label: string; loading: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} disabled={loading}>
      {loading ? <Loader2 className="spin" size={17} /> : icon}
      {label}
    </button>
  );
}

function OutputStatus({ source }: { source: "deepseek" | "fallback" }) {
  return (
    <div className={source === "deepseek" ? "status ok" : "status warn"}>
      {source === "deepseek" ? <ShieldCheck size={18} /> : <AlertTriangle size={18} />}
      <span>{source === "deepseek" ? "DeepSeek API 已生成真实结果。" : "当前为本地兜底结果；配置 DeepSeek Key 后将自动调用真实模型。"}</span>
    </div>
  );
}

function OutputBlock({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="output-block">
      <div className="block-title">
        {icon}
        <h3>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: number; tone: "heat" | "money" }) {
  return (
    <div className={`metric metric-${tone}`}>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className="meter" aria-hidden="true">
        <i style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const text = await response.text();
  const contentType = response.headers.get("content-type") || "";
  const resolvedUrl = new URL(url, window.location.href).href;

  if (!contentType.includes("application/json")) {
    const looksLikeHtml = text.trim().startsWith("<");
    throw new Error(
      looksLikeHtml
        ? `后端 API 没有返回 JSON。请求地址：${resolvedUrl}。请确认页面和 Node 服务使用的是同一个 127.0.0.1:5173。`
        : `后端返回了非 JSON 内容。请求地址：${resolvedUrl}。内容：${text.slice(0, 120)}`
    );
  }

  const data = JSON.parse(text) as T;
  if (!response.ok) {
    const message =
      typeof data === "object" && data && "message" in data
        ? String((data as { message?: unknown }).message)
        : response.statusText;
    throw new Error(message);
  }
  return data;
}

export default App;
