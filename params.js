//FUNCTIONS FOR ALLOWING URL PARAMS

//BREAKS UP A URL BY /
const breakurl = (urlstring) => {
  const tokens = urlstring.split("/");
  return tokens;
};

//REMOVES TRAINING SLASH
const ts = (str) => {
  const letters = str.split("");
  if (letters[letters.length - 1] === "/") {
    letters.splice(letters.length - 1, 1);
    return letters.join("");
  }
  return str;
};

//COMPARE URLS AND CREATE PARAMS
const matchurls = (url1, url2, req) => {
  const url1b = breakurl(ts(url1));
  const url2b = breakurl(ts(url2));
  console.log(url1b, url2b);
  const p = {};

  if (url1b.length === url2b.length) {
    for (let i = 0; i < url1b.length; i++) {
      if (url1b[i].search(":") === -1) {
        if (url1b[i] === url2b[i]) {
        } else {
          return false;
        }
      } else {
        p[url1b[i].slice(1)] = url2b[i];
      }
    }
  } else {
    return false;
  }
  req.params = { ...p };
  return true;
};

module.exports = {
  matchurls,
};
