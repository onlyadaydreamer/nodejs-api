// const jsonwebtoken = require('jsonwebtoken');
const jwt = require('koa-jwt');
const Router = require('koa-router');
const router = new Router({prefix: '/users'});
const { find, findById, create, update, delete: del, login, checkOwner, lsitFollowing, follow, unfollow, listFollowers, checkUserExist } = require('../controllers/users');
const { secret } = require('../config');

const auth = jwt({secret});

// const auth = async (ctx, next) => {
//     // header把所有的头都变成小写了; 如果请求头中没有authorization得到的就是undefined，会报错,所以要提供一个默认值
//     const {authorization = ''} = ctx.request.header;
//     // token在请求头中的形式是 Bearer +' ' + token
//     const token = authorization.replace('Bearer ', '');
//     try {
//         const user = jsonwebtoken.verify(token, secret);
//         // ctx.state通常放一些用户信息
//         ctx.state.user = user;
//     } catch (err) {
//         ctx.throw(401, err.message);
//     }
//     await next();// !!!
// }

router.get('/', find);
router.post('/', create);
router.get('/:id', findById);
router.patch('/:id', auth, checkOwner, update);
router.delete('/:id', auth, checkOwner, del);
router.post('/login', login);
router.get('/:id/following', lsitFollowing);
router.get('/:id/followers/', listFollowers);
// :id 关注的人的id
router.put('/following/:id', auth, checkUserExist, follow);
router.delete('/following/:id', auth, checkUserExist, unfollow);

module.exports = router;