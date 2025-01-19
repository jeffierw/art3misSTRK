export const convertUrl = (url: string | undefined) => {
  if (url && url.startsWith("https://ipfs.io/ipfs/")) {
    const withoutPrefix = url.replace("https://ipfs.io/ipfs/", "");
    const pathParts = withoutPrefix.split("/");
    return `/cards/${pathParts[1]}`;
  } else {
    url = `/images/card.webp`;
  }
  return url;
};

export const decodeByteArray = (uint8Array: Uint8Array) => {
  const byteArray = new Uint8Array(uint8Array);
  const decoder = new TextDecoder("utf-8");
  const str = decoder.decode(byteArray);
  return str;
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
