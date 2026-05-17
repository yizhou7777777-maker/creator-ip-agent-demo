import type { Niche, Platform, SamplePost, Tone } from "../types";

export const platforms: Platform[] = ["小红书", "抖音", "视频号", "朋友圈"];

export const niches: Niche[] = ["美妆护肤", "母婴亲子", "家居家装", "时尚穿搭", "个人IP专家"];

export const tones: Tone[] = ["接地气测评", "妈妈视角", "松弛生活", "轻奢情绪", "专业干货"];

export const nicheKnowledge: Record<
  Niche,
  {
    audience: string;
    valueAnchor: string;
    keywords: string[];
    sentencePatterns: string[];
    commercialAngles: string[];
    riskTerms: string[];
  }
> = {
  美妆护肤: {
    audience: "想少踩雷、愿意为确定性买单的精致女生",
    valueAnchor: "真实测评、成分解释、肤感对比、场景种草",
    keywords: ["空瓶", "成分", "肤感", "通勤", "黄黑皮", "敏感肌", "持妆", "不拔干"],
    sentencePatterns: ["我先说结论", "这支不是谁用都合适", "预算有限可以先看这个"],
    commercialAngles: ["品牌新品试用", "功效测评", "节日礼盒", "护肤套组"],
    riskTerms: ["根治", "药效", "医美级", "100%有效"]
  },
  母婴亲子: {
    audience: "时间紧、怕买错、喜欢直接抄作业的新手妈妈",
    valueAnchor: "安全感、清单化、避坑、真实使用场景",
    keywords: ["待产包", "新手妈妈", "闭眼入", "避坑", "睡眠", "辅食", "安全感", "省心"],
    sentencePatterns: ["新手妈妈直接抄", "这件我会无限回购", "别急着买贵的"],
    commercialAngles: ["母婴用品清单", "宝宝护理", "家庭消耗品", "成长阶段方案"],
    riskTerms: ["绝对安全", "医生都推荐", "包治", "无副作用"]
  },
  家居家装: {
    audience: "想把小空间住出审美和秩序感的年轻家庭",
    valueAnchor: "前后对比、空间方案、氛围感、收纳效率",
    keywords: ["小户型", "松弛感", "收纳", "动线", "软装", "氛围灯", "入住", "改造"],
    sentencePatterns: ["这个改动最值", "不是买贵，是买对", "小空间先解决这件事"],
    commercialAngles: ["家居好物", "软装搭配", "空间改造", "清洁收纳"],
    riskTerms: ["甲醛清零", "永久除味", "全网最低", "唯一选择"]
  },
  时尚穿搭: {
    audience: "想快速提升风格质感、需要被种草理由说服的人",
    valueAnchor: "风格识别、场景搭配、显贵感、情绪价值",
    keywords: ["显贵", "通勤", "松弛", "显瘦", "比例", "胶囊衣橱", "质感", "氛围"],
    sentencePatterns: ["这套真的很提气", "普通人穿也不费力", "重点不是单品，是比例"],
    commercialAngles: ["服饰上新", "穿搭合集", "配饰种草", "节日造型"],
    riskTerms: ["全网最低", "必瘦", "唯一", "永不过时"]
  },
  个人IP专家: {
    audience: "想建立专业信任、把知识变成咨询或课程的人",
    valueAnchor: "专业判断、案例拆解、方法论、行动清单",
    keywords: ["方法论", "案例", "复盘", "避坑", "增长", "转化", "定位", "信任感"],
    sentencePatterns: ["先给结论", "这个问题的本质是", "真正要改的是这一步"],
    commercialAngles: ["课程咨询", "知识服务", "陪跑训练营", "行业顾问"],
    riskTerms: ["保证变现", "稳赚", "包过", "内幕"]
  }
};

export const toneGuides: Record<Tone, { voice: string; do: string[]; avoid: string[] }> = {
  接地气测评: {
    voice: "像朋友认真试过之后给建议，结论清楚，少形容词堆叠。",
    do: ["先说结论", "给适合/不适合人群", "用体验细节证明"],
    avoid: ["过度夸张", "空泛赞美", "像广告硬广"]
  },
  妈妈视角: {
    voice: "从真实家庭场景出发，强调省心、安全感和少走弯路。",
    do: ["列清单", "讲场景", "给替代方案"],
    avoid: ["制造焦虑", "绝对化承诺", "专业术语过密"]
  },
  松弛生活: {
    voice: "画面感强，语气轻，突出生活秩序和审美获得感。",
    do: ["前后对比", "描述空间细节", "给低门槛改造建议"],
    avoid: ["堆砌高级词", "只讲审美不讲使用", "过度精致化"]
  },
  轻奢情绪: {
    voice: "有风格态度，但要落在普通人能复制的搭配理由上。",
    do: ["强调场景", "解释比例和质感", "保留情绪价值"],
    avoid: ["炫耀感", "只喊显贵", "单品罗列"]
  },
  专业干货: {
    voice: "专业但不冰冷，先给判断，再给案例和行动步骤。",
    do: ["结构清晰", "可执行", "用案例支撑"],
    avoid: ["术语堆叠", "泛泛鸡汤", "承诺收益"]
  }
};

export const platformGuides: Record<Platform, { rhythm: string; cta: string; publishWindow: string }> = {
  小红书: {
    rhythm: "标题要有具体人群和结果，正文用短段落、清单和情绪钩子承接。",
    cta: "评论区告诉我你的账号阶段，我帮你看一个选题角度。",
    publishWindow: "工作日 12:00-13:30 或 20:30-22:30"
  },
  抖音: {
    rhythm: "前三秒必须出现冲突或结果，脚本用口播推进，画面切换要快。",
    cta: "想要同款脚本模板，评论区打你的赛道。",
    publishWindow: "工作日 18:30-21:30，周末 10:30-12:00"
  },
  视频号: {
    rhythm: "更重信任和观点完整度，用案例开场，结尾收束成方法。",
    cta: "转给正在做账号的朋友，少踩一个坑。",
    publishWindow: "工作日 07:30-09:00 或 21:00-22:30"
  },
  朋友圈: {
    rhythm: "像熟人分享，不要太像公域爆款，用真实经历和轻 CTA。",
    cta: "需要我把清单发你，可以私信我。",
    publishWindow: "工作日 11:30-13:00 或 20:00-22:00"
  }
};

export const samplePosts: SamplePost[] = [
  {
    id: "beauty-serum",
    label: "美妆护肤 · 功效精华",
    platform: "小红书",
    niche: "美妆护肤",
    tone: "接地气测评",
    url: "https://www.xiaohongshu.com/explore/demo-beauty-serum",
    title: "熬夜脸别乱买精华，这 3 类成分先看清",
    content:
      "我以前一熬夜就急着买猛药型精华，结果越用越不稳定。后来发现熬夜脸真正要先处理的是暗沉、干纹和屏障压力。烟酰胺适合想提亮的人，但敏感肌要看浓度；玻色因更适合预算高、想稳一点的人；泛醇和神经酰胺是我换季一定会留的组合。结论是：别只看贵不贵，先看你现在最想解决的问题。",
    imageCue: "白色桌面、三支精华、成分标签和肤感对比小字",
    brandBrief: "品牌希望突出一款温和提亮精华，目标是小红书种草和蒲公英商单转化。"
  },
  {
    id: "mom-bag",
    label: "母婴亲子 · 待产包",
    platform: "小红书",
    niche: "母婴亲子",
    tone: "妈妈视角",
    url: "https://www.xiaohongshu.com/explore/demo-mom-bag",
    title: "待产包别照单全买，真正用得上的就这 8 件",
    content:
      "第一胎准备待产包时，我买了一堆看起来很安心的东西，最后发现很多都没拆封。真正高频使用的是产褥垫、一次性内裤、吸管杯、柔纸巾、宝宝小方巾、包被、恒温壶和便携收纳袋。我的经验是：先买刚需，剩下的根据医院和宝宝情况再补。新手妈妈不要被大清单吓到，够用比齐全更重要。",
    imageCue: "待产包平铺图、8 个物品编号、柔和家庭光线",
    brandBrief: "品牌主推母婴收纳袋和待产组合包，希望强调省心和不浪费。"
  },
  {
    id: "home-small",
    label: "家居家装 · 小户型改造",
    platform: "小红书",
    niche: "家居家装",
    tone: "松弛生活",
    url: "https://www.xiaohongshu.com/explore/demo-small-home",
    title: "30㎡ 小家显大，不靠断舍离靠这 4 个动线细节",
    content:
      "小户型最怕东西都买对了，但动线还是乱。我的改造顺序是先把入户、餐桌、沙发和床边四个高频区重新规划。入户只留当天会用的东西，餐桌旁做窄柜，沙发边放移动边几，床边用壁挂替代落地柜。不是东西少了家才大，而是每件东西都有固定位置，家才会松下来。",
    imageCue: "小户型俯拍动线图、收纳前后对比、温暖自然光",
    brandBrief: "品牌希望推广可移动边几和窄柜，强调小空间秩序感。"
  },
  {
    id: "style-coat",
    label: "时尚穿搭 · 通勤外套",
    platform: "抖音",
    niche: "时尚穿搭",
    tone: "轻奢情绪",
    url: "https://www.douyin.com/video/demo-style-coat",
    title: "普通女生穿出贵气感，不是靠大牌，是靠外套比例",
    content:
      "很多通勤穿搭看起来用力，是因为外套长度、肩线和内搭颜色都在抢戏。真正显贵的外套通常有三个细节：肩线利落但不垫太夸张，长度卡在大腿中部或脚踝上方，内搭只保留一个视觉重点。今天这套我用灰色长外套配同色系针织和直筒裤，整个人会被拉长，也不会像在硬凹职场感。",
    imageCue: "通勤街拍、灰色长外套、三套搭配对比",
    brandBrief: "服饰品牌上新羊毛混纺外套，希望突出质感、通勤和显高。"
  },
  {
    id: "ip-consultant",
    label: "个人 IP · 专家内容",
    platform: "视频号",
    niche: "个人IP专家",
    tone: "专业干货",
    url: "https://channels.weixin.qq.com/demo-ip-consultant",
    title: "为什么你的专业内容没人咨询？先改这 3 个表达习惯",
    content:
      "很多知识型博主不是不专业，而是表达顺序错了。用户先关心自己遇到的问题，再关心你的方法，最后才会判断你是否值得信任。建议先用一个具体场景开场，再给判断，最后给一个能马上执行的步骤。比如不要说我擅长品牌定位，而是说如果你的账号发了 30 篇还没有咨询，先检查主页第一屏有没有说明你能解决什么问题。",
    imageCue: "白板方法论、账号主页结构示意、咨询转化漏斗",
    brandBrief: "个人 IP 教练希望推广账号诊断服务，目标是提高私信咨询率。"
  }
];

export const globalRiskTerms = ["最有效", "保证", "稳赚", "第一", "全网最低", "永久", "唯一", "0风险"];
