const commonDomains = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "aol.com",
  "outlook.com",
  "msn.com",
  "live.com",
  "icloud.com",
  "googlemail.com",
];

// A simple Levenshtein distance function to find similarity
function levenshtein(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix = new Array(bn + 1);
  for (let i = 0; i <= bn; ++i) {
    matrix[i] = new Array(an + 1);
  }
  for (let i = 0; i <= bn; ++i) {
    matrix[i][0] = i;
  }
  for (let j = 0; j <= an; ++j) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= bn; ++i) {
    for (let j = 1; j <= an; ++j) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }
  return matrix[bn][an];
}

export function suggestEmail(email: string): string | null {
  const emailParts = email.split("@");
  if (emailParts.length !== 2) return null;

  const username = emailParts[0];
  const domain = emailParts[1];

  if (!domain) return null;

  let closestDomain: string | null = null;
  let minDistance = Infinity;

  // Find the most similar domain from our list
  for (const commonDomain of commonDomains) {
    const distance = levenshtein(domain, commonDomain);
    if (distance > 0 && distance <= 2) {
      // Threshold of 2 is reasonable, and distance > 0 means it's not an exact match
      if (distance < minDistance) {
        minDistance = distance;
        closestDomain = commonDomain;
      }
    }
  }

  if (closestDomain) {
    return `${username}@${closestDomain}`;
  }

  return null;
}
