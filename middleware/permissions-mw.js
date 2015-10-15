var jwt = require('jsonwebtoken');
var config = require('../config');

module.exports=function(relationName){
    relationName = relationName || 'relation';

    this.extractPayload = function (paramName) {
        return function (req, res, next) {
            jwt.verify(req.params[paramName], config.get('token:relationSecret'), function (err, payload) {
                if (err) {
                    return next(err);
                }

                setRelation(req, payload);
                next();
            });
        };
    };

    function getRelation(req) {
        return req[relationName];
    }

    function setRelation(req, relation) {
        req[relationName] = relation;
    }

    return this;
};