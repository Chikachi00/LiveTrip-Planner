type MapLinkInput = {
  name?: string;
  city?: string;
  country?: string;
};

const encode = (value: string) => encodeURIComponent(value);

const isChina = (country?: string, city?: string) => {
  const text = `${country ?? ""}${city ?? ""}`;
  return /中国|上海|杭州|长沙|北京|广州|深圳|成都|南京|武汉/.test(text);
};

export const createMapSearchLinks = ({ name, city, country }: MapLinkInput) => {
  const query = [name, city, country].filter(Boolean).join(" ");

  if (!query.trim()) {
    return [];
  }

  const encodedQuery = encode(query);
  const links = [
    {
      label: "Google Maps",
      href: `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`,
    },
    {
      label: "Apple Maps",
      href: `https://maps.apple.com/?q=${encodedQuery}`,
    },
  ];

  if (isChina(country, city)) {
    links.push(
      {
        label: "百度地图",
        href: `https://map.baidu.com/search/${encodedQuery}`,
      },
      {
        label: "高德地图",
        href: `https://ditu.amap.com/search?query=${encodedQuery}`,
      },
    );
  }

  return links;
};
