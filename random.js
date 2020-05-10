window.Game = window.Game || {};


(function() {


const A = [];
for(let a=0; a<8; ++a)
  A[a] = Math.pow(256, a-8);

Game.make_random = function(random) {
  if(random === null)
    random = Math;

  let i = 0;
  let j = 100;
  const S = [];

  if(Array.isArray(random)) {
    S.splice(0);
    S.push(...random);
  } else {
    for(let a = 0; a < 256; ++a) {
      S.push(a);
      const b = Math.floor(random.random() * (a + 1));
      [S[a], S[b]] = [S[b], S[a]];
    }
  }

  return {
    random() {
      const f = function() {
        const r = (S[i] + S[j]) % 256;
        [S[i], S[j]] = [S[j], S[i]];
        i = (i + 1) % 256;
        j = (j + S[i]) % 256;
        return r;
      };
      let result = 0;
      for(let a=0; a<8; ++a)
        result += f() * A[a];
      return result;
    },
    state: S,
  };
};


}());
