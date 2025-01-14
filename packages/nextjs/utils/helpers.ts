export const convertUrl = (url: string) => {
  if (url.startsWith("ipfs://")) {
    const withoutPrefix = url.replace("ipfs://", "");
    const pathParts = withoutPrefix.split("/");
    return `/cards/${pathParts[1]}`;
  } else {
    url = `/images/card.webp`;
  }
  return url;
};

export const romanToNumberMap = new Map([
  ["0", 0],
  ["I", 1],
  ["II", 2],
  ["III", 3],
  ["IV", 4],
  ["V", 5],
  ["VI", 6],
  ["VII", 7],
  ["VIII", 8],
  ["IX", 9],
  ["X", 10],
  ["XI", 11],
  ["XII", 12],
  ["XIII", 13],
  ["XIV", 14],
  ["XV", 15],
  ["XVI", 16],
  ["XVII", 17],
  ["XVIII", 18],
  ["XIX", 19],
  ["XX", 20],
  ["XXI", 21],
]);
