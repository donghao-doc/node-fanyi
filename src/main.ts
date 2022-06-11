const https = require('https');
const querystring = require('querystring');
const md5 = require('md5');
const { appid, secret } = require('./private');

export const translate = (word: string) => {
  let isEnglish = false;
  if (/[a-zA-Z]/.test(word[0])) isEnglish = true;
  const salt = Math.random();
  const sign = md5(`${appid}${word}${salt}${secret}`);
  const query: string = querystring.stringify({ 
    q: word, 
    from: isEnglish ? 'en' : 'zh', 
    to: isEnglish ? 'zh' : 'en', 
    appid, salt, sign
  });
  const options = {
    hostname: 'api.fanyi.baidu.com',
    port: 443,
    path: `/api/trans/vip/translate?${query}`,
    method: 'GET'
  };

  const req = https.request(options, (res) => {
    const chunks = [];
    res.on('data', chunk => {
      chunks.push(chunk)
    });
    res.on('end', () => {
      const content = Buffer.concat(chunks).toString()
      const result = JSON.parse(content)
      if (result.error_code) {
        console.error(result.error_msg)
        process.exit(2)
      } else {
        result.trans_result.map(item => {
          console.log(item.dst)
        })
        process.exit(0)
      }
    })
  });

  req.on('error', (e) => {
    console.error(e);
  });

  req.end();
}