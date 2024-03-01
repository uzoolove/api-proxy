// include dependencies
import express from 'express';
import cors from 'cors';
import proxy from 'http-proxy-middleware';
import greenlock from 'greenlock-express';





// proxy middleware options
const options = {
  target: 'http://frontendschool.shop:33010', // target host
  changeOrigin: true, // needed for virtual hosted sites
  ws: true, // proxy websockets
  router: {
    'motizen.frontendschool.shop:33080': 'http://frontendschool.shop:33010',
    'todo.frontendschool.shop:443': 'http://frontendschool.shop:33010',
    'todo-api.frontendschool.shop:443': 'http://frontendschool.shop:33020',
    'frontendschool.shop:443': 'http://frontendschool.shop:33030',
    'api.frontendschool.shop:443': 'http://frontendschool.shop:33040',
  },
};

// create the proxy (without context)
const todoApiProxy = proxy.createProxyMiddleware(options);

// mount `exampleProxy` in web server
const app = express();

app.use('/', (req, res, next) => {
  console.log(req.headers)
  next();
});

app.use(cors({
  origin: [
    /^https?:\/\/localhost/,
    /^https?:\/\/127.0.0.1/,
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