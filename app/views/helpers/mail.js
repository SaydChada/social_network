module.exports = {
    "delete": function (name, context) {
        let block = blocks[name];
        if (!block) {
            block = blocks[name] = [];
        }

        block.push(context.fn(this));
    }
};