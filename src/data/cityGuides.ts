import type { TripPlan } from "../types";

export type CityGuide = {
  id: string;
  city: string;
  country: string;
  recommendedAreas: string[];
  budgetAreas: string[];
  convenientAreas: string[];
  avoidAreas: string[];
  transportNotes: string;
  hotelNotes: string;
  lateNightNotes: string;
  eventTips: string;
  notes?: string;
};

export const cityGuides: CityGuide[] = [
  {
    id: "yokohama",
    city: "Yokohama",
    country: "日本",
    recommendedAreas: ["横滨站", "樱木町", "关内", "川崎", "Minato Mirai"],
    budgetAreas: ["川崎", "关内", "新横滨"],
    convenientAreas: ["横滨站", "樱木町", "Minato Mirai", "新横滨"],
    avoidAreas: ["东京西侧深处", "离铁路主线过远的区域"],
    transportNotes: "横滨站换乘便利但人流大；Minato Mirai 场馆散场后可向多个车站分流。",
    hotelNotes: "横滨站交通方便但价格可能偏高；川崎性价比较好；樱木町适合顺便旅游。",
    lateNightNotes: "终演较晚时不要把回东京的换乘估得太紧，优先确认末班车。",
    eventTips: "横滨多场馆集中在 Minato Mirai 和新横滨，选择住宿时要看具体场馆。",
  },
  {
    id: "tokyo",
    city: "Tokyo",
    country: "日本",
    recommendedAreas: ["上野", "秋叶原", "饭田桥", "新宿", "池袋", "神田"],
    budgetAreas: ["上野", "浅草", "赤羽", "蒲田"],
    convenientAreas: ["东京站", "新宿", "池袋", "饭田桥", "秋叶原"],
    avoidAreas: ["只看市中心但远离场馆的区域", "末班后需要多次换乘的区域"],
    transportNotes: "东京轨道交通密集，但不同场馆方向差异很大，住宿应跟随场馆位置选择。",
    hotelNotes: "不建议只看市中心；巨蛋可看饭田桥/上野，湾岸活动可看东京东侧。",
    lateNightNotes: "大型场次散场后换乘站会拥挤，建议多预留 30 分钟。",
    eventTips: "东京适合多日远征，但不要把跨城移动和演出入场排得太紧。",
  },
  {
    id: "chiba-makuhari",
    city: "Chiba / Makuhari",
    country: "日本",
    recommendedAreas: ["海滨幕张", "千叶", "东京东侧", "上野", "秋叶原"],
    budgetAreas: ["千叶", "船桥", "津田沼"],
    convenientAreas: ["海滨幕张", "东京站周边", "上野", "秋叶原"],
    avoidAreas: ["东京西侧深处", "需要多次换乘的区域"],
    transportNotes: "幕张回东京方向依赖京叶线，大型活动散场后返程压力较大。",
    hotelNotes: "海滨幕张最省力但房量有限，千叶和东京东侧是常见替代。",
    lateNightNotes: "终演较晚时务必确认京叶线末班和东京站内换乘距离。",
    eventTips: "展会和演唱会叠加时，建议提前锁定住宿并减少当天额外行程。",
  },
  {
    id: "saitama",
    city: "Saitama",
    country: "日本",
    recommendedAreas: ["大宫", "埼玉新都心", "赤羽", "上野", "池袋"],
    budgetAreas: ["大宫", "赤羽", "浦和"],
    convenientAreas: ["埼玉新都心", "大宫", "赤羽"],
    avoidAreas: ["东京南侧过远区域"],
    transportNotes: "埼玉新都心到东京北侧方便，但散场后站内人流会集中。",
    hotelNotes: "大宫住宿选择更多，东京北侧适合兼顾价格和交通。",
    lateNightNotes: "东京回程通常可行，但终演较晚时要确认回酒店末班。",
    eventTips: "大型 arena 场次建议将住宿放在北侧或大宫，减少散场返程压力。",
  },
  {
    id: "osaka",
    city: "Osaka",
    country: "日本",
    recommendedAreas: ["梅田", "心斋桥", "京桥", "天王寺", "淀屋桥"],
    budgetAreas: ["天王寺", "新今宫", "京桥"],
    convenientAreas: ["梅田", "难波", "京桥", "淀屋桥"],
    avoidAreas: ["离地铁主线过远的区域"],
    transportNotes: "大阪市内交通方便，但大阪城、湾岸和难波方向差异明显。",
    hotelNotes: "梅田交通最稳，心斋桥餐饮方便，京桥适合大阪城 Hall。",
    lateNightNotes: "散场后换乘仍需预留时间，尤其是需要跨线回酒店时。",
    eventTips: "大阪适合顺路旅行，但连续场次要控制餐饮和夜间活动。",
  },
  {
    id: "shanghai",
    city: "Shanghai",
    country: "中国",
    recommendedAreas: ["人民广场", "陆家嘴", "徐家汇", "世博园", "静安寺"],
    budgetAreas: ["打浦桥", "中山公园", "上海火车站"],
    convenientAreas: ["人民广场", "陆家嘴", "徐家汇", "上海站", "虹桥"],
    avoidAreas: ["离地铁较远的外环区域"],
    transportNotes: "上海轨道交通覆盖好，但大型演出散场后地铁和网约车都会排队。",
    hotelNotes: "根据场馆选区域；世博园看梅奔，五角场看北部场馆，虹桥适合次日返程。",
    lateNightNotes: "高铁返程要确认虹桥末班和从场馆到虹桥的实际耗时。",
    eventTips: "本地交通方便，但跨城当天往返不应卡最后一班。",
  },
  {
    id: "hangzhou",
    city: "Hangzhou",
    country: "中国",
    recommendedAreas: ["奥体", "钱江世纪城", "钱江新城", "滨江", "杭州东站"],
    budgetAreas: ["滨江", "杭州东站", "武林广场"],
    convenientAreas: ["奥体", "钱江世纪城", "杭州东站"],
    avoidAreas: ["离地铁过远的景区边缘"],
    transportNotes: "奥体片区活动多时散场压力明显，赶高铁需要更保守估算。",
    hotelNotes: "奥体和钱江世纪城最方便，杭州东站适合第二天返程。",
    lateNightNotes: "终演后跨江和打车需求集中，建议提前规划返程路线。",
    eventTips: "如果同时安排西湖游览，建议不要压缩演出当天休息时间。",
  },
  {
    id: "changsha",
    city: "Changsha",
    country: "中国",
    recommendedAreas: ["侯家塘", "五一广场", "南门口", "黄兴广场", "长沙站"],
    budgetAreas: ["长沙站", "袁家岭", "侯家塘"],
    convenientAreas: ["侯家塘", "五一广场", "黄兴广场"],
    avoidAreas: ["离地铁较远且夜间打车不便的区域"],
    transportNotes: "核心区餐饮和夜生活密集，演出散场后网约车需求会明显上升。",
    hotelNotes: "五一广场方便吃喝但可能更吵，侯家塘更贴近贺龙体育中心。",
    lateNightNotes: "夜间返程建议预留打车等待时间，不要把第二天早班排得太紧。",
    eventTips: "长沙适合短途远征，但体育场级别活动需要重视散场人流。",
  },
  {
    id: "beijing",
    city: "Beijing",
    country: "中国",
    recommendedAreas: ["五棵松", "公主坟", "西单", "复兴门", "北京西站"],
    budgetAreas: ["北京西站", "公主坟", "和平里"],
    convenientAreas: ["五棵松", "西单", "东直门", "北京西站"],
    avoidAreas: ["距离地铁较远的郊区"],
    transportNotes: "北京城市尺度大，机场、高铁站和场馆之间需要留足移动时间。",
    hotelNotes: "住宿跟随场馆方向选择，比单纯住市中心更重要。",
    lateNightNotes: "大型演出后打车排队常见，建议走到外侧道路或地铁分流。",
    eventTips: "冬季和雨雪天气会放大交通风险，建议更早出发。",
  },
  {
    id: "guangzhou",
    city: "Guangzhou",
    country: "中国",
    recommendedAreas: ["天河", "珠江新城", "萝岗", "科学城", "广州东站"],
    budgetAreas: ["科学城", "广州东站", "体育西"],
    convenientAreas: ["天河", "珠江新城", "广州东站"],
    avoidAreas: ["距离地铁较远的黄埔边缘区域"],
    transportNotes: "部分场馆距离核心区较远，地铁末班和打车等待都需要提前确认。",
    hotelNotes: "黄埔场馆可住萝岗或科学城，想兼顾城市活动可住天河但通勤更长。",
    lateNightNotes: "散场后回天河或珠江新城可能耗时较长，不建议卡点赶交通。",
    eventTips: "广州适合周末远征，但湿热天气下要预留体力和补水时间。",
  },
];

const normalize = (value?: string) =>
  (value ?? "")
    .toLowerCase()
    .replace(/[·・\s\-_/（）()]/g, "")
    .trim();

const aliases: Record<string, string[]> = {
  yokohama: ["横滨", "橫濱", "yokohama"],
  tokyo: ["东京", "東京", "tokyo"],
  "chiba-makuhari": ["千叶", "千葉", "幕张", "幕張", "makuhari", "chiba"],
  saitama: ["埼玉", "さいたま", "saitama"],
  osaka: ["大阪", "osaka"],
  shanghai: ["上海", "shanghai"],
  hangzhou: ["杭州", "hangzhou"],
  changsha: ["长沙", "長沙", "changsha"],
  beijing: ["北京", "beijing"],
  guangzhou: ["广州", "廣州", "guangzhou"],
};

export const findCityGuide = (city?: string) => {
  const target = normalize(city);

  if (!target) {
    return undefined;
  }

  return cityGuides.find((guide) => {
    const names = [guide.city, guide.country, ...(aliases[guide.id] ?? [])];
    return names.some((name) => {
      const normalized = normalize(name);
      return normalized === target || target.includes(normalized) || normalized.includes(target);
    });
  });
};

export const findCityGuideForPlan = (plan: Pick<TripPlan, "city">) =>
  findCityGuide(plan.city);
