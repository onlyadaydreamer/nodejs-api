const jsonwebtoken = require('jsonwebtoken');
const User = require('../models/users');
const {secret} = require('../config');


class UserCtl {
    async find(ctx) {
        // ctx.set('Allow', 'GET, POST');
        ctx.body = await User.find();
    }
    async findById(ctx) {
        const { fields } = ctx.query;
        // filter(f => f) 过滤不存在的字段
        const selectedFields = fields ? fields.split(';').filter(f => f).map( f => ' +' + f).join('') : '';
        // mongoose select('+educitons+business') 过滤字段
        const user = await User.findById(ctx.params.id).select(selectedFields);
        if (!user) { ctx.throw(404, '用户不存在');}
        ctx.body = user;
    }
    async create(ctx) {
        ctx.verifyParams({
            name: { type: 'string', required: true },
            password: {type: 'string', required: true}
        });
        const {name} = ctx.request.body;
        const repeatedUser = await User.findOne({name});
        if (repeatedUser) {ctx.throw(409, '用户已存在')} // 409 冲突
        const user = await new User(ctx.request.body).save();
        ctx.body = user;
    }
    async checkOwner (ctx, next) {
        // ctx.state.user 是认证之后的用户
        if (ctx.params.id !== ctx.state.user._id) {
            ctx.throw(403, '没有权限');
        }
        await next();
    }
    /**
     *用户注册时不该传入过多信息，因为会让用户感到疲惫，可以放入用户更新接口中
     * @param {*} ctx 
     */
    async update(ctx) {
        ctx.verifyParams({
            name: { type: 'string', required: false },
            password: {type: 'string', required: false },
            avatar_url: { type: 'string', required: false},
            gender: { type: 'string', required: false},
            headline: { type: 'string', required: false},
            locations: { type: 'array', itemType: 'string', required: false},
            business: { type: 'string', required: false},
            employments: { type: 'array', itemType: 'object', required: false},
            educations: { type: 'array', itemType: 'object', required: false},
        });
        const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body, {
            new: true
        });
        if (!user) { ctx.throw(404) }
        ctx.body = user
    }
    async delete(ctx) {
        const user = await User.findByIdAndRemove(ctx.params.id);
        if (!user) { ctx.throw(404); }
        ctx.status = 204; // 没有内容，但是成功了
    }
    async login(ctx) {
        ctx.verifyParams({
            name: {type: 'string', required: true},
            password: {type: 'string', required: true}
        });
        const user = await User.findOne(ctx.request.body);
        if (!user) { ctx.throw(401, '用户名或密码不正确')}
        const {_id, name} = user;
        const token = jsonwebtoken.sign({_id, name}, secret, {expiresIn: '1d'});
        ctx.body = {token};
    }
    // 获取关注用户列表
    async lsitFollowing(ctx) {
        // 如果不加populate('following') 只返回一个id
        const user = await User.findById(ctx.params.id).select('+following').populate('following');
        if (!user) {
            ctx.throw(404);
        }
        ctx.body = user.following;
    }
    // 获取粉丝列表
    async listFollowers (ctx) {
        // 从所有用户中找到关注某个人的用户
        const users = await User.find({following: ctx.params.id});
        ctx.body = users;
    }
    async checkUserExist(ctx, next) {
        const user = await User.findById(ctx.params.id);
        if (!user) {
            ctx.throw(404);
        }
        await next();
    }
    async follow(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+following');
        // me.following是mongoose数据类型, ctx.params.id是字符串类型
        if (!me.following.map(id => id.toString()).includes(ctx.params.id)) {
            me.following.push(ctx.params.id);
            me.save();// 保存到数据库
        }
        ctx.status = 204;
    }
    async unfollow(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+following');
        // 找到不想关注的人在自己的关注列表里的索引
        const index = me.following.map(id => id.toString()).indexOf(ctx.params.id);
        if (index > -1) {
            me.following.splice(index, 1);
            me.save();
        }
        ctx.status = 204;
    } 
}

module.exports = new UserCtl();