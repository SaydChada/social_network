'use strict';

module.exports = {
    serializeStrategy : function(user, done) {
        user = {
            username: user.username,
            email: user.email,
            role: user.role,
            _id: user._id,
            avatar: user.avatar,
            friends : user.friends,
            created: user.created
        };
        done(null, user);
    }
};