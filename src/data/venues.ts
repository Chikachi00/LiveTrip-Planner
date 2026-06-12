import type { TripPlan } from "../types";

export type Venue = {
  id: string;
  name: string;
  nameJa?: string;
  city: string;
  country: string;
  area: string;
  nearestStations: string[];
  capacity?: number;
  venueType:
    | "arena"
    | "stadium"
    | "hall"
    | "livehouse"
    | "exhibition"
    | "theater"
    | "other";
  accessScore: number;
  crowdRiskScore: number;
  hotelDifficultyScore: number;
  dayTripDifficultyScore: number;
  recommendedHotelAreas: string[];
  avoidHotelAreas?: string[];
  arrivalAdvice: string;
  leavingAdvice: string;
  hotelAdvice: string;
  transportAdvice: string;
  notes?: string;
};

export const venues: Venue[] = [
  {
    id: "k-arena-yokohama",
    name: "K-Arena Yokohama",
    nameJa: "Kアリーナ横浜",
    city: "横滨",
    country: "日本",
    area: "Minato Mirai",
    nearestStations: ["新高岛", "横滨站", "みなとみらい"],
    capacity: 20000,
    venueType: "arena",
    accessScore: 4,
    crowdRiskScore: 5,
    hotelDifficultyScore: 4,
    dayTripDifficultyScore: 4,
    recommendedHotelAreas: ["横滨站", "樱木町", "关内", "川崎", "Minato Mirai"],
    avoidHotelAreas: ["过远的东京西侧"],
    arrivalAdvice: "建议开演前 90 分钟到达场馆周边，给物贩、入场和人流预留缓冲。",
    leavingAdvice: "散场后横滨站方向压力明显，建议预留 30-60 分钟离场缓冲，必要时反向走到周边站点。",
    hotelAdvice: "优先考虑横滨站、樱木町、关内或川崎，能降低散场后返程压力。",
    transportAdvice: "从东京方向来回可行，但终演较晚时建议提前确认末班车和换乘路径。",
    notes: "场馆新、容量大，散场动线和横滨站方向人流是主要风险。",
  },
  {
    id: "yokohama-arena",
    name: "Yokohama Arena",
    nameJa: "横浜アリーナ",
    city: "横滨",
    country: "日本",
    area: "新横滨",
    nearestStations: ["新横滨"],
    capacity: 17000,
    venueType: "arena",
    accessScore: 5,
    crowdRiskScore: 4,
    hotelDifficultyScore: 3,
    dayTripDifficultyScore: 3,
    recommendedHotelAreas: ["新横滨", "横滨站", "樱木町", "川崎", "品川"],
    arrivalAdvice: "新横滨交通便利，但大型演出时车站和餐饮排队会变长。",
    leavingAdvice: "散场后新横滨站会拥挤，赶新干线或末班车时要预留更长换乘时间。",
    hotelAdvice: "新横滨最省心；横滨站和川崎适合平衡价格与交通。",
    transportAdvice: "新干线、JR 和地铁选择较多，适合跨城市远征。",
  },
  {
    id: "nissan-stadium",
    name: "Nissan Stadium",
    nameJa: "日産スタジアム",
    city: "横滨",
    country: "日本",
    area: "新横滨 / 小机",
    nearestStations: ["小机", "新横滨"],
    capacity: 72000,
    venueType: "stadium",
    accessScore: 3,
    crowdRiskScore: 5,
    hotelDifficultyScore: 5,
    dayTripDifficultyScore: 5,
    recommendedHotelAreas: ["新横滨", "横滨站", "川崎", "品川", "樱木町"],
    avoidHotelAreas: ["距离铁路主线过远的区域"],
    arrivalAdvice: "体育场容量很大，建议至少提前 2 小时到达并确认入场口。",
    leavingAdvice: "散场后小机和新横滨方向都会高压，返程要按 60-90 分钟缓冲估算。",
    hotelAdvice: "大型场次酒店会涨价，优先提前锁定新横滨、横滨站或川崎。",
    transportAdvice: "当天往返风险高，尤其是跨城市或国际航班衔接场景。",
    notes: "超大容量体育场，散场和住宿是核心风险。",
  },
  {
    id: "zepp-yokohama",
    name: "Zepp Yokohama",
    nameJa: "KT Zepp Yokohama",
    city: "横滨",
    country: "日本",
    area: "Minato Mirai",
    nearestStations: ["新高岛", "横滨站", "みなとみらい"],
    capacity: 2000,
    venueType: "livehouse",
    accessScore: 4,
    crowdRiskScore: 3,
    hotelDifficultyScore: 3,
    dayTripDifficultyScore: 3,
    recommendedHotelAreas: ["横滨站", "樱木町", "关内", "川崎", "Minato Mirai"],
    arrivalAdvice: "Livehouse 场次建议确认整理番号和入场队列，提前到达但不必过早。",
    leavingAdvice: "散场压力低于大型 arena，但横滨站方向仍需预留换乘时间。",
    hotelAdvice: "横滨站和樱木町都方便，预算紧张时可考虑川崎。",
    transportAdvice: "东京方向当天往返可行，但要确认终演时间和末班车。",
  },
  {
    id: "tokyo-dome",
    name: "Tokyo Dome",
    nameJa: "東京ドーム",
    city: "东京",
    country: "日本",
    area: "水道桥",
    nearestStations: ["水道桥", "后乐园", "春日"],
    capacity: 55000,
    venueType: "stadium",
    accessScore: 5,
    crowdRiskScore: 5,
    hotelDifficultyScore: 4,
    dayTripDifficultyScore: 3,
    recommendedHotelAreas: ["水道桥", "饭田桥", "上野", "秋叶原", "神田"],
    arrivalAdvice: "交通选择很多，但巨蛋周边餐饮和周边排队压力较大。",
    leavingAdvice: "散场后水道桥站非常拥挤，可考虑步行到饭田桥、御茶之水或后乐园分流。",
    hotelAdvice: "水道桥最方便，上野和秋叶原更适合兼顾价格和交通。",
    transportAdvice: "东京市内换乘方便，但散场后不要把转乘时间估得太紧。",
  },
  {
    id: "makuhari-messe",
    name: "Makuhari Messe",
    nameJa: "幕張メッセ",
    city: "千叶",
    country: "日本",
    area: "海滨幕张",
    nearestStations: ["海滨幕张"],
    capacity: 30000,
    venueType: "exhibition",
    accessScore: 3,
    crowdRiskScore: 4,
    hotelDifficultyScore: 4,
    dayTripDifficultyScore: 4,
    recommendedHotelAreas: ["海滨幕张", "千叶", "东京站周边", "上野", "秋叶原"],
    avoidHotelAreas: ["东京西侧深处"],
    arrivalAdvice: "展馆型场地步行距离和排队区域较长，建议提前确认 Hall 编号。",
    leavingAdvice: "海滨幕张返东京方向车流集中，散场后返程压力明显。",
    hotelAdvice: "海滨幕张最省力但房量有限；千叶和东京东侧是常见替代。",
    transportAdvice: "当天往返东京可行但耗时，终演较晚时要确认京叶线末班。",
  },
  {
    id: "saitama-super-arena",
    name: "Saitama Super Arena",
    nameJa: "さいたまスーパーアリーナ",
    city: "埼玉",
    country: "日本",
    area: "埼玉新都心",
    nearestStations: ["埼玉新都心", "北与野"],
    capacity: 37000,
    venueType: "arena",
    accessScore: 4,
    crowdRiskScore: 4,
    hotelDifficultyScore: 3,
    dayTripDifficultyScore: 3,
    recommendedHotelAreas: ["大宫", "埼玉新都心", "上野", "池袋", "赤羽"],
    arrivalAdvice: "车站到场馆动线清晰，但大型场次周边餐饮和入场会排队。",
    leavingAdvice: "散场后埼玉新都心站拥挤，可考虑北与野或在周边等人流下降。",
    hotelAdvice: "大宫住宿选择更多，东京北侧也适合兼顾交通。",
    transportAdvice: "东京市内当天往返通常可行，但跨城远征建议留宿。",
  },
  {
    id: "osaka-jo-hall",
    name: "Osaka-jō Hall",
    nameJa: "大阪城ホール",
    city: "大阪",
    country: "日本",
    area: "大阪城公园",
    nearestStations: ["大阪城公园", "森之宫", "京桥"],
    capacity: 16000,
    venueType: "hall",
    accessScore: 4,
    crowdRiskScore: 4,
    hotelDifficultyScore: 3,
    dayTripDifficultyScore: 3,
    recommendedHotelAreas: ["京桥", "梅田", "心斋桥", "天王寺", "淀屋桥"],
    arrivalAdvice: "公园步行距离较长，雨天和夏季建议多留体力。",
    leavingAdvice: "散场后大阪城公园站压力高，可向森之宫或京桥方向分流。",
    hotelAdvice: "京桥最方便，梅田和心斋桥适合兼顾餐饮与交通。",
    transportAdvice: "大阪市内交通方便，但演出后换乘仍需预留时间。",
  },
  {
    id: "pia-arena-mm",
    name: "Pia Arena MM",
    nameJa: "ぴあアリーナMM",
    city: "横滨",
    country: "日本",
    area: "Minato Mirai",
    nearestStations: ["みなとみらい", "樱木町", "新高岛"],
    capacity: 12000,
    venueType: "arena",
    accessScore: 4,
    crowdRiskScore: 4,
    hotelDifficultyScore: 4,
    dayTripDifficultyScore: 3,
    recommendedHotelAreas: ["樱木町", "横滨站", "关内", "Minato Mirai", "川崎"],
    arrivalAdvice: "周边商业设施多，但入场前餐饮高峰明显，建议提前解决补给。",
    leavingAdvice: "散场后可向樱木町、横滨站或新高岛分流，不要只盯一个车站。",
    hotelAdvice: "Minato Mirai 和樱木町最舒服，横滨站和川崎更灵活。",
    transportAdvice: "东京方向可当天往返，但终演后仍建议留足换乘时间。",
  },
  {
    id: "pacifico-yokohama",
    name: "Pacifico Yokohama",
    nameJa: "パシフィコ横浜",
    city: "横滨",
    country: "日本",
    area: "Minato Mirai",
    nearestStations: ["みなとみらい", "樱木町"],
    capacity: 5000,
    venueType: "exhibition",
    accessScore: 4,
    crowdRiskScore: 3,
    hotelDifficultyScore: 4,
    dayTripDifficultyScore: 3,
    recommendedHotelAreas: ["Minato Mirai", "樱木町", "横滨站", "关内", "川崎"],
    arrivalAdvice: "会展场馆入口和 Hall 位置要提前确认，避免临场绕路。",
    leavingAdvice: "散场可向樱木町或みなとみらい分流，步行时间要纳入计划。",
    hotelAdvice: "Minato Mirai 最省心但价格偏高，樱木町和关内更均衡。",
    transportAdvice: "横滨市内交通方便，东京方向当天往返需关注末班。",
  },
  {
    id: "mercedes-benz-arena-shanghai",
    name: "上海梅赛德斯-奔驰文化中心",
    city: "上海",
    country: "中国",
    area: "世博园",
    nearestStations: ["中华艺术宫", "世博大道"],
    capacity: 18000,
    venueType: "arena",
    accessScore: 4,
    crowdRiskScore: 4,
    hotelDifficultyScore: 3,
    dayTripDifficultyScore: 3,
    recommendedHotelAreas: ["世博园", "陆家嘴", "人民广场", "徐家汇", "打浦桥"],
    arrivalAdvice: "建议提前确认入口和安检要求，热门场次地铁口会排队。",
    leavingAdvice: "散场后地铁和网约车需求集中，建议错峰离场或步行到更远上车点。",
    hotelAdvice: "世博园最方便，陆家嘴和人民广场适合兼顾交通与餐饮。",
    transportAdvice: "上海市内交通方便，但跨城当天往返要确认高铁末班。",
  },
  {
    id: "hangzhou-olympic-sports-gymnasium",
    name: "杭州奥体中心体育馆",
    city: "杭州",
    country: "中国",
    area: "奥体博览城",
    nearestStations: ["奥体中心", "博览中心"],
    capacity: 18000,
    venueType: "arena",
    accessScore: 4,
    crowdRiskScore: 4,
    hotelDifficultyScore: 4,
    dayTripDifficultyScore: 3,
    recommendedHotelAreas: ["奥体", "钱江世纪城", "钱江新城", "滨江", "杭州东站"],
    arrivalAdvice: "大型演出建议提前 90 分钟到达奥体片区，预留安检和步行时间。",
    leavingAdvice: "散场后地铁和打车会集中，赶高铁请预留更保守的时间。",
    hotelAdvice: "奥体和钱江世纪城最方便，杭州东站适合第二天返程。",
    transportAdvice: "市内可达性不错，跨城返程建议优先留宿或确认末班高铁。",
  },
  {
    id: "helong-sports-center-changsha",
    name: "长沙贺龙体育中心",
    city: "长沙",
    country: "中国",
    area: "侯家塘",
    nearestStations: ["侯家塘", "南门口"],
    capacity: 55000,
    venueType: "stadium",
    accessScore: 4,
    crowdRiskScore: 5,
    hotelDifficultyScore: 4,
    dayTripDifficultyScore: 4,
    recommendedHotelAreas: ["侯家塘", "五一广场", "南门口", "黄兴广场", "长沙站"],
    arrivalAdvice: "体育场容量大，建议提前到达并确认看台入口，周边餐饮高峰明显。",
    leavingAdvice: "散场后网约车和地铁压力很高，可步行远离场馆后再打车。",
    hotelAdvice: "侯家塘最省体力，五一广场和南门口更适合餐饮与城市活动。",
    transportAdvice: "外地观众不建议卡点当天往返，高铁或航班要留足散场缓冲。",
  },
  {
    id: "cadillac-arena-beijing",
    name: "北京凯迪拉克中心",
    city: "北京",
    country: "中国",
    area: "五棵松",
    nearestStations: ["五棵松"],
    capacity: 18000,
    venueType: "arena",
    accessScore: 5,
    crowdRiskScore: 4,
    hotelDifficultyScore: 3,
    dayTripDifficultyScore: 3,
    recommendedHotelAreas: ["五棵松", "公主坟", "西单", "复兴门", "北京西站"],
    arrivalAdvice: "地铁直达便利，但热门场次安检和商业区人流会叠加。",
    leavingAdvice: "散场后五棵松站拥挤，打车建议走到更外侧道路。",
    hotelAdvice: "五棵松最方便，北京西站和公主坟适合次日交通。",
    transportAdvice: "市内交通选择多，跨城返程仍需关注末班高铁和机场距离。",
  },
  {
    id: "baoneng-guanzhi-cultural-center-guangzhou",
    name: "广州宝能观致文化中心",
    city: "广州",
    country: "中国",
    area: "黄埔",
    nearestStations: ["苏元", "萝岗"],
    capacity: 18000,
    venueType: "arena",
    accessScore: 3,
    crowdRiskScore: 4,
    hotelDifficultyScore: 3,
    dayTripDifficultyScore: 4,
    recommendedHotelAreas: ["萝岗", "科学城", "天河", "广州东站", "珠江新城"],
    arrivalAdvice: "场馆距离市中心较远，建议提前确认地铁和步行路线。",
    leavingAdvice: "散场后回天河或珠江新城耗时较长，打车排队风险较高。",
    hotelAdvice: "预算允许可住萝岗或科学城，想兼顾城市活动可住天河但要接受通勤。",
    transportAdvice: "不建议把返程航班或高铁排得太紧，黄埔回核心区需要时间。",
  },
];

const normalize = (value?: string) =>
  (value ?? "")
    .toLowerCase()
    .replace(/[·・\s\-_/（）()]/g, "")
    .trim();

export const findVenueById = (id?: string) => {
  if (!id) {
    return undefined;
  }

  return venues.find((venue) => venue.id === id);
};

export const findVenueByName = (name?: string) => {
  const target = normalize(name);

  if (!target) {
    return undefined;
  }

  return venues.find((venue) => {
    const names = [venue.name, venue.nameJa, `${venue.city}${venue.name}`];
    return names.some((candidate) => {
      const normalized = normalize(candidate);
      return normalized === target || target.includes(normalized) || normalized.includes(target);
    });
  });
};

export const findVenueForPlan = (plan: Pick<TripPlan, "venueId" | "venue">) => {
  return findVenueById(plan.venueId) ?? findVenueByName(plan.venue);
};

export const formatVenueType = (type: Venue["venueType"]) => {
  const labels: Record<Venue["venueType"], string> = {
    arena: "Arena",
    stadium: "Stadium",
    hall: "Hall",
    livehouse: "Livehouse",
    exhibition: "Exhibition",
    theater: "Theater",
    other: "Other",
  };

  return labels[type];
};
