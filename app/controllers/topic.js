const Topic = require('../models/topic');

class TopicCtl {
    async find(ctx) {
        ctx.body = await Topic.find();
    }
    async findById(ctx) {
        const { fields } = ctx.query;
        const selectFields = fields ? fields.split(';').filter(f => f).map(f => '+' + f).join() : '';
    }
}