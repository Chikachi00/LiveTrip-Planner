import type { PreferredMapProvider } from "../lib/userPreferences";

type MapLinkInput = {
  name?: string;
  city?: string;
  country?: string;
  preferredProvider?: PreferredMapProvider;
};

type MapLink = {
  provider: PreferredMapProvider;
  label: string;
  href: string;
};

const encode = (value: string) => encodeURIComponent(value);

const isChina = (country?: string, city?: string) => {
  const text = `${country ?? ""}${city ?? ""}`;
  return /中国|上海|杭州|长沙|北京|广州|深圳|成都|南京|武汉/.test(text);
};

export const createMapSearchLinks = ({
  name,
  city,
  country,
  preferredProvider,
}: MapLinkInput) => {
  const query = [name, city, country].filter(Boolean).join(" ");

  if (!query.trim()) {
    return [];
  }

  const encodedQuery = encode(query);
  const links: MapLink[] = [
    {
      provider: "google",
      label: "Google Maps",
      href: `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`,
    },
    {
      provider: "apple",
      label: "Apple Maps",
      href: `https://maps.apple.com/?q=${encodedQuery}`,
    },
  ];

  if (isChina(country, city)) {
    links.push(
      {
        provider: "baidu",
        label: "百度地图",
        href: `https://map.baidu.com/search/${encodedQuery}`,
      },
      {
        provider: "amap",
        label: "高德地图",
        href: `https://ditu.amap.com/search?query=${encodedQuery}`,
      },
    );
  }

  if (!preferredProvider) {
    return links;
  }

  return [...links].sort((a, b) => {
    if (a.provider === preferredProvider) {
      return -1;
    }

    if (b.provider === preferredProvider) {
      return 1;
    }

    return 0;
  });
};
