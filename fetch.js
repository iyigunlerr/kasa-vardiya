const https = require('https');
https.get('https://kasa-vardiya.vercel.app/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const match = data.match(/href="(\/_next\/static\/css\/[^"]+\.css)"/);
    if(match) {
      https.get('https://kasa-vardiya.vercel.app' + match[1], (cRes) => {
        let css = '';
        cRes.on('data', chunk => css += chunk);
        cRes.on('end', () => {
          const rootMatch = css.match(/:root\{[^\}]+\}/);
          const darkMatch = css.match(/\.dark\{[^\}]+\}/);
          console.log(rootMatch ? rootMatch[0].replace(/;/g, ';\n') : 'no root');
          console.log(darkMatch ? darkMatch[0].replace(/;/g, ';\n') : 'no dark');
        });
      });
    } else {
      console.log('no css link found');
    }
  });
});
