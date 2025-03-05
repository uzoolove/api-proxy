// include dependencies
import express from 'express';
import cors from 'cors';
import proxy from 'http-proxy-middleware';
import greenlock from 'greenlock-express';





// proxy middleware options
const options = {
  target: 'http://fesp.shop:33030', // target host
  changeOrigin: false, // needed for virtual hosted sites
  onProxyReq: (proxyReq, req, res) => {
    // 클라이언트의 IP 주소를 프록시 요청 헤더에 추가
    proxyReq.setHeader('x-forwarded-for', req.ip);
  },
  ws: true, // proxy websockets
  router: {
    'todo.fesp.shop': 'http://fesp.shop:33010',
    'todo-api.fesp.shop': 'http://fesp.shop:33020',
    'fesp.shop': 'http://fesp.shop:33030',
    'api.fesp.shop': 'http://fesp.shop:33040',
    '11.fesp.shop': 'http://fesp.shop:33011',
  },
  onError: (err, req, res) => {
    console.error(`프록시 오류 발생: ${err.message}`);
    console.error(`대상 호스트: ${req.headers.host}`);
    console.error(`요청 URL: ${req.url}`);
    res.writeHead(500, {
      'Content-Type': 'text/plain'
    });
    res.end(`프록시 요청 중 오류가 발생했습니다: ${err.message}`);
  },
  logLevel: 'debug',
  logProvider: () => console
};

// create the proxy (without context)
const todoApiProxy = proxy.createProxyMiddleware(options);

// mount `exampleProxy` in web server
const app = express();

app.use('/', (req, res, next) => {
  console.log(`${req.headers.host}${req.url}`)
  next();
});

app.use(cors({
  origin: [
    /^https?:\/\/localhost/,
    /^https?:\/\/127.0.0.1/,
    /netlify.app$/,
    new RegExp(process.env.DOMAIN)
  ],
  credentials: true,
}));

app.use('/', todoApiProxy);

greenlock.init({
  packageRoot: '.',
  configDir: './greenlock.d',
  maintainerEmail: "uzoolove@gmail.com",
  cluster: false
}).serve(app); // Serves on 80 and 443

// app.listen(33080);