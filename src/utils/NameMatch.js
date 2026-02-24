function nameSimilarity(name1, name2) {
    const normalize = name =>
      name
        .toLowerCase()
        .replace(/[^a-z\s]/g, '') // remove special chars
        .replace(/\s+/g, ' ') // normalize spaces
        .trim();
  
    name1 = normalize(name1);
    name2 = normalize(name2);
  
    // Early exact match
    if (name1 === name2) return 100;
  
    const tokens1 = name1.split(' ');
    const tokens2 = name2.split(' ');
  
    // 1. Token Set Overlap Score
    const commonTokens = tokens1.filter(token => tokens2.includes(token));
    const totalTokens = new Set([...tokens1, ...tokens2]).size;
    const tokenMatchScore = (commonTokens.length / totalTokens) * 100;
  
    // 2. Levenshtein Distance Score
    const levDistance = levenshteinDistance(name1, name2);
    const maxLength = Math.max(name1.length, name2.length);
    const levenshteinScore = ((maxLength - levDistance) / maxLength) * 100;
  
    // 3. Regex Substring Score (how many parts of name1 exist in name2)
    let regexHits = 0;
    tokens1.forEach(token => {
      const regex = new RegExp(token, 'i');
      if (regex.test(name2)) regexHits++;
    });
    const regexScore = (regexHits / tokens1.length) * 100;
  
    // 4. Weighted Average
    const finalScore = (tokenMatchScore * 0.4) + (levenshteinScore * 0.4) + (regexScore * 0.2);
  
    return Math.round(finalScore);
  }
  
  function levenshteinDistance(a, b) {
    const dp = Array.from({length: a.length + 1}, () => new Array(b.length + 1).fill(0));
  
    for (let i = 0; i <= a.length; i++) dp[i][0] = i;
    for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        if (a[i - 1] === b[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(
            dp[i - 1][j],    // delete
            dp[i][j - 1],    // insert
            dp[i - 1][j - 1] // substitute
          );
        }
      }
    }
  
    return dp[a.length][b.length];
  }

  module.exports= {nameSimilarity}