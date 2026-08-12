const fs = require('fs');
let content = fs.readFileSync('src/feature-module/frontend/home/home-4/DynamicSections.jsx', 'utf8');

const regexes = [
  // 1 & 2
  {
    regex: /(<div style={{\s*color: \"#6021e7\", borderRadius: \"999px\",\s*padding: \"3px 14px\", fontSize: \"16px\", fontWeight: 999, marginTop: \"-6px\",\s*minWidth: \"94px\", textAlign: \"center\", letterSpacing: \"0\.2px\",\s*}}>[\s\n]*\{d\.productPrice\}[\s\n]*<\/div>)/g,
    replacement: '{d.productPrice && (\n$1\n)}'
  },
  // 3, 4, 7
  {
    regex: /(<div style={{\s*position: \"absolute\", top: \"10px\", right: \"10px\", zIndex: 3,\s*background: \"rgba\(255,255,255,0\.92\)\", borderRadius: \"10px\",\s*padding: \"4px 10px\", fontSize: \"13px\", fontWeight: 800,\s*color: theme\.priceBadgeBg,\s*}}>\{d\.productPrice\}<\/div>)/g,
    replacement: '{d.productPrice && (\n$1\n)}'
  },
  // 5
  {
    regex: /(<div style={{ display: \"flex\", flexDirection: \"column\" }}><span style={{ fontSize: \"9px\", color: \"#9CA3AF\", textTransform: \"uppercase\", fontWeight: 500, letterSpacing: \"0\.3px\" }}>Price<\/span><span style={{ fontSize: \"15px\", fontWeight: 700, color: theme\.accent }}>\{d\.productPrice\}<\/span><\/div>)/g,
    replacement: '{d.productPrice && (\n$1\n)}'
  },
  // 6
  {
    regex: /(<div\s*style={{\s*fontSize: \"17px\",\s*color: \"#333\",\s*fontWeight: 800,\s*letterSpacing: \"-0\.2px\",\s*}}\s*>\s*\{d\.productPrice\}\s*<\/div>)/g,
    replacement: '{d.productPrice && (\n$1\n)}'
  },
  // 8
  {
    regex: /(<div\s*style={{\s*fontSize: \"17px\",\s*color: \"#333\",\s*fontWeight: 800,\s*marginBottom: \"4px\",\s*letterSpacing: \"-0\.3px\"\s*}}\s*>\s*\{d\.productPrice\}\s*<\/div>)/g,
    replacement: '{d.productPrice && (\n$1\n)}'
  },
  // 9
  {
    regex: /(<div style={{ fontSize: \"15px\", fontWeight: 900, color: theme\.priceBadgeBg }}>\{d\.productPrice\}<\/div>)/g,
    replacement: '{d.productPrice && (\n$1\n)}'
  },
  // 10
  {
    regex: /(<div\s*style={{\s*fontSize: \"15px\",\s*fontWeight: 900,\s*color: \"#920CFF\",\s*flexShrink: 0,\s*}}\s*>\s*\{d\.productPrice\}\s*<\/div>)/g,
    replacement: '{d.productPrice && (\n$1\n)}'
  },
  // 11
  {
    regex: /(<div\s*style={{\s*fontSize: \"17px\",\s*color: theme\.priceBadgeBg,\s*fontWeight: 900,\s*letterSpacing: \"-0\.5px\",\s*margin: \"4px 0\",\s*}}\s*>\s*\{d\.productPrice\}\s*<\/div>)/g,
    replacement: '{d.productPrice && (\n$1\n)}'
  },
  // 12
  {
    regex: /(<div\s*style={{\s*fontSize: \"15px\",\s*color: theme\.priceBadgeBg,\s*fontWeight: 900,\s*letterSpacing: \"-0\.5px\",\s*margin: \"4px 0\",\s*width: \"100%\",\s*display: \"flex\",\s*justifyContent: \"center\",\s*alignItems: \"center\"\s*}}\s*>\s*\{d\.productPrice\}\s*<\/div>)/g,
    replacement: '{d.productPrice && (\n$1\n)}'
  },
  // 13
  {
    regex: /(<div style={{ color: theme\.priceBadgeBg, fontSize: \"16px\", fontWeight: 800, marginBottom: \"6px\" }}>\{d\.productPrice\}<\/div>)/g,
    replacement: '{d.productPrice && (\n$1\n)}'
  }
];

let replacedContent = content;
regexes.forEach(({ regex, replacement }) => {
  replacedContent = replacedContent.replace(regex, replacement);
});

fs.writeFileSync('src/feature-module/frontend/home/home-4/DynamicSections.jsx', replacedContent);
console.log("Done");
