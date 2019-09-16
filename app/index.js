const Koa = require('koa');
const path = require('path');
// const bodyParser = require('koa-bodyparser');
const koaBody = require('koa-body');
const koaStatic = require('koa-static');
const error = require('koa-json-error');
const parameter = require('koa-parameter');
const mongoose = require('mongoose');
const app = new Koa()
const routing = require('./routes');
const { connectionStr } = require('./config'); 

/* app.use(async (ctx, next) => {
    try{
        await next()
    } catch (err) {
        ctx.status = err.status || err.statusCode;
        ctx.body = {
            message: err.message
        }
    }
}); */
app.use(koaStatic(path.join(__dirname, 'public')));
mongoose.connect(connectionStr, { useNewUrlParser: true }, () => console.log('mongodb 连接成功'));
mongoose.connection.on('error', console.error);

app.use(error({
    postFormat: (e, {stack, ...rest}) => process.env.NODE_ENV === 'production' ? rest : {stack, ...rest}
}));
// app.use(bodyParser())
app.use(koaBody({
    multipart: true,
    formidable: {
        uploadDir: path.join(__dirname, '/public/uploads'),
        keepExtensions: true
    }
}));
app.use(parameter(app));// 传入app,这样ctx上就有了verifyParams方法
routing(app);

app.listen(3000, () => console.log('程序启动在3000端口...'));