import {
  globalRiskTerms,
  nicheKnowledge,
  platformGuides,
  samplePosts,
  toneGuides
} from "../data/knowledge";
import type {
  AgentResult,
  Breakdown,
  CreatorProfile,
  Evaluation,
  GeneratedWork,
  Niche,
  Platform,
  SourceInput,
  UserIntent
} from "../types";

const allPlatforms: Platform[] = ["小红书", "抖音", "视频号", "朋友圈"];

const pick = <T,>(items: T[], index: number) => items[Math.abs(index) % items.length];

const textHash = (text: string) =>
  Array.from(text).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 9973, 17);

const firstSentence = (text: string) =>
  text
    .split(/[。！？!?]/)
    .map((item) => item.trim())
    .find(Boolean) || text.slice(0, 42);

const compact = (text: string, max = 46) => (text.length > max ? `${text.slice(0, max)}...` : text);

const extractTopic = (source: SourceInput, profile: CreatorProfile) => {
  const title = source.title.trim();
  if (title) return title.replace(/[，。！？!?]/g, "");
  const sentence = firstSentence(source.content);
  if (sentence) return sentence;
  return `${profile.niche}账号下一篇商单内容`;
};

const intentText = (intent?: UserIntent) => {
  if (!intent) return "";
  return [
    intent.story && `今天想讲：${intent.story}`,
    intent.viewpoint && `想表达的观点：${intent.viewpoint}`,
    intent.product && `推广对象：${intent.product}`,
    intent.desiredShape && `希望做成：${intent.desiredShape}`,
    intent.mustMention && `必须注意：${intent.mustMention}`,
    intent.avoid && `不要写成：${intent.avoid}`
  ]
    .filter(Boolean)
    .join("\n");
};

const matchedKeywords = (content: string, niche: Niche) => {
  const bank = nicheKnowledge[niche].keywords;
  const found = bank.filter((word) => content.includes(word));
  const fallback = bank.slice(0, 5);
  return Array.from(new Set([...found, ...fallback])).slice(0, 8);
};

const detectRiskTerms = (content: string, niche: Niche) => {
  const terms = [...globalRiskTerms, ...nicheKnowledge[niche].riskTerms];
  return terms
    .filter((term) => content.includes(term))
    .map((term) => ({
      term,
      reason: "容易被平台判断为绝对化、功效化或收益承诺表达。",
      suggestion: term.includes("最低")
        ? "改成「近期入手价友好」或「预算党可以看」。"
        : "改成体验型、条件型表达，例如「更适合」「我自己的感受是」。"
    }));
};

const inferHook = (source: SourceInput, profile: CreatorProfile) => {
  const topic = extractTopic(source, profile);
  if (/[0-9一二三四五六七八九十]/.test(topic)) return `数字化结果钩子：${topic}`;
  if (topic.includes("别") || topic.includes("为什么")) return `反常识/避坑钩子：${topic}`;
  return `人群痛点钩子：${nicheKnowledge[profile.niche].audience}正在关心「${compact(topic, 24)}」。`;
};

export const buildBreakdown = (profile: CreatorProfile, source: SourceInput, intent?: UserIntent): Breakdown => {
  const baseText = `${source.title}\n${source.content}\n${profile.brandBrief}\n${intentText(intent)}`;
  const keywords = matchedKeywords(baseText, profile.niche);
  const platform = platformGuides[profile.platform];
  const knowledge = nicheKnowledge[profile.niche];
  const topic = extractTopic(source, profile);

  return {
    hook: inferHook(source, profile),
    formula: `痛点人群 + 具体场景 + 可验证结果。把「${compact(topic, 22)}」拆成先共鸣、再证据、最后行动。`,
    structure: [
      { name: "开场 3 秒", detail: `直接点出目标人群：${knowledge.audience}。` },
      { name: "问题放大", detail: `用一个真实场景说明为什么现在的做法低效或容易踩雷。` },
      { name: "方法拆解", detail: `围绕 ${keywords.slice(0, 3).join(" / ")} 给出 3-4 个判断标准。` },
      {
        name: "共创转译",
        detail: `把用户自己的想法转成平台表达：${compact(intent?.story || intent?.viewpoint || "先补充今天想讲的事情", 42)}。`
      },
      { name: "商单承接", detail: `自然接入推广对象：${compact(intent?.product || profile.brandBrief || "用体验细节承接产品卖点", 42)}。` },
      { name: "互动收口", detail: platform.cta }
    ],
    keywords,
    coverLogic: `${source.imageCue || "主体产品/场景图"} + 大字结果 + 小字人群限定，避免只做漂亮封面。`,
    interactionCue: platform.cta,
    reusableTemplate: `《${keywords[0]}别乱做，${profile.fanStage}先看这 3 点》：先给结论，再给适合人群，最后给可复制动作。`
  };
};

const titleTemplates = (profile: CreatorProfile, topic: string, keywords: string[]) => [
  `${keywords[0]}别急着买，${profile.fanStage}先看这 3 个判断`,
  `我把「${compact(topic, 18)}」拆成了能接商单的内容模板`,
  `${nicheKnowledge[profile.niche].audience.split("、")[0]}最容易忽略的 ${keywords[1] || "关键点"}`,
  `不是内容不行，是你少了这个 ${profile.platform} 开场`
];

const buildNote = (profile: CreatorProfile, source: SourceInput, breakdown: Breakdown, intent?: UserIntent) => {
  const knowledge = nicheKnowledge[profile.niche];
  const tone = toneGuides[profile.tone];
  const topic = extractTopic(source, profile);
  const intro = pick(tone.do, textHash(topic));

  return [
    `${breakdown.hook}`,
    "",
    `${intro}：这篇内容不要从产品开始讲，要先从用户正在纠结的场景切入。`,
    "",
    intent?.story ? `今天这篇的真实起点：${intent.story}` : `今天这篇先从「${compact(topic, 28)}」切入。`,
    intent?.viewpoint ? `我的核心观点：${intent.viewpoint}` : `核心观点：先解决用户为什么关心，再讲产品或方法。`,
    "",
    `1. 先定位人群：${knowledge.audience}`,
    `2. 再给判断标准：${breakdown.keywords.slice(0, 4).join("、")}`,
    `3. 最后承接价值：${intent?.product || profile.brandBrief || knowledge.commercialAngles[0]}`,
    intent?.mustMention ? `4. 注意点：${intent.mustMention}` : "",
    "",
    `可以直接复用的表达：${pick(knowledge.sentencePatterns, textHash(source.content))}，如果你也在做${profile.niche}，先把这一步补上。`,
    intent?.avoid ? `这版会避开：${intent.avoid}` : "",
    "",
    `互动结尾：${platformGuides[profile.platform].cta}`
  ]
    .filter(Boolean)
    .join("\n");
};

const buildScript = (profile: CreatorProfile, source: SourceInput, breakdown: Breakdown, intent?: UserIntent) => {
  const topic = extractTopic(source, profile);
  const keywords = breakdown.keywords;
  return [
    {
      scene: "0-3s",
      shot: "近景口播 + 结果字幕",
      line: intent?.viewpoint || `先别急着发「${compact(topic, 18)}」，这类内容最容易输在开头。`
    },
    {
      scene: "3-8s",
      shot: "对标内容/产品细节切换",
      line: `爆款不是只靠文案顺，它先抓住了 ${keywords[0]} 和 ${keywords[1]} 这两个判断点。`
    },
    {
      scene: "8-18s",
      shot: "三段式清单卡片",
      line: `第一讲场景，第二讲证据，第三再讲${intent?.product ? "推广对象" : "品牌"}。顺序反了，就会像硬广。`
    },
    {
      scene: "18-28s",
      shot: "封面草图 + 评论区引导",
      line: `${platformGuides[profile.platform].cta}`
    }
  ];
};

const buildCoverIdeas = (profile: CreatorProfile, source: SourceInput, breakdown: Breakdown) => {
  const topic = extractTopic(source, profile);
  return [
    {
      style: "结果大字版",
      text: `${breakdown.keywords[0]}先看这 3 点`,
      direction: `主体放 ${source.imageCue || "核心产品/场景"}，右上角放人群标签，适合${profile.platform}。`
    },
    {
      style: "避坑对比版",
      text: "别再这样发",
      direction: "左右对比错误表达和优化后表达，让用户一眼知道能学到什么。"
    },
    {
      style: "商单友好版",
      text: compact(topic, 14),
      direction: "保留品牌露出但降低硬广感，用真实体验细节做视觉证据。"
    }
  ];
};

export const buildGeneratedWork = (
  profile: CreatorProfile,
  source: SourceInput,
  breakdown: Breakdown,
  intent?: UserIntent
): GeneratedWork => {
  const topic = extractTopic(source, profile);
  const titles = titleTemplates(profile, topic, breakdown.keywords);
  const note = buildNote(profile, source, breakdown, intent);
  const script = buildScript(profile, source, breakdown, intent);
  const coverIdeas = buildCoverIdeas(profile, source, breakdown);
  const platformVariants = allPlatforms.reduce<Record<Platform, string>>((acc, platform) => {
    const guide = platformGuides[platform];
    acc[platform] = `${platform}版：${guide.rhythm} 标题建议《${titles[allPlatforms.indexOf(platform) % titles.length]}》。`;
    return acc;
  }, {} as Record<Platform, string>);

  return { titles, note, script, coverIdeas, platformVariants };
};

export const buildEvaluation = (
  profile: CreatorProfile,
  source: SourceInput,
  breakdown: Breakdown,
  generated: GeneratedWork,
  intent?: UserIntent
): Evaluation => {
  const allText = `${source.title}\n${source.content}\n${generated.note}\n${generated.titles.join("\n")}\n${intentText(intent)}`;
  const riskHits = detectRiskTerms(allText, profile.niche);
  const hash = textHash(allText + profile.platform + profile.niche);
  const heatScore = Math.min(94, 68 + breakdown.keywords.length * 2 + (hash % 9) - riskHits.length * 4);
  const commercialScore = Math.min(96, 70 + (profile.brandBrief ? 12 : 4) + (hash % 8) - riskHits.length * 3);
  const verdict =
    heatScore >= 85
      ? "可以进入发布前润色，重点保留开头冲突和评论区承接。"
      : "值得继续优化，先把人群和结果说得更具体。";

  const risks =
    riskHits.length > 0
      ? riskHits
      : [
          {
            term: "硬广感",
            reason: "品牌 brief 已出现，若开头直接讲产品，容易降低完读率。",
            suggestion: "把产品信息放到第二段之后，用体验证据承接。"
          }
        ];

  return {
    heatScore,
    commercialScore,
    assistantVerdict: verdict,
    risks,
    improvements: [
      `标题补上明确人群，例如「${nicheKnowledge[profile.niche].audience.split("、")[0]}」。`,
      `正文第一屏保留 ${breakdown.keywords.slice(0, 2).join(" + ")}，减少泛泛形容词。`,
      intent?.story ? `把「${compact(intent.story, 20)}」放进开头真实场景，增强个人感。` : "补充一个自己的真实场景，让内容不像套模板。",
      `结尾加入低门槛互动：${platformGuides[profile.platform].cta}`
    ].slice(0, 3),
    publishWindow: platformGuides[profile.platform].publishWindow,
    successMetric: profile.platform === "小红书" ? "收藏率 > 8%，评论率 > 1.5%" : "3 秒完播率 > 38%，互动率 > 4%"
  };
};

export const runAgent = (profile: CreatorProfile, source: SourceInput, intent?: UserIntent): AgentResult => {
  const fallbackSample = samplePosts[0];
  const normalizedSource = {
    ...source,
    title: source.title.trim() || fallbackSample.title,
    content: source.content.trim() || fallbackSample.content,
    url: source.url.trim() || fallbackSample.url
  };
  const breakdown = buildBreakdown(profile, normalizedSource, intent);
  const generated = buildGeneratedWork(profile, normalizedSource, breakdown, intent);
  const evaluation = buildEvaluation(profile, normalizedSource, breakdown, generated, intent);

  return {
    breakdown,
    generated,
    evaluation,
    log: {
      agent: "creator-ip-ops-assistant",
      version: "mvp-0.1",
      mode: "stable-demo",
      source_url: normalizedSource.url,
      platform: profile.platform,
      niche: profile.niche,
      tone: profile.tone,
      fan_stage: profile.fanStage,
      input_hash: textHash(`${normalizedSource.url}${normalizedSource.title}${normalizedSource.content}`),
      user_intent_present: Boolean(intentText(intent)),
      scores: {
        heat: evaluation.heatScore,
        commercial: evaluation.commercialScore
      },
      next_action: evaluation.assistantVerdict
    },
    source: "fallback",
    message: "本地规则引擎兜底生成"
  };
};
