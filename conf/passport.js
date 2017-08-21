'use strict';

module.exports = {
    serializeStrategy : function(user, done) {
        user = {
            username: user.username,
            email: user.email,
            role: user.role,
            _id: user._id,
            created: user.created
        };
        done(null, user);
    }
};