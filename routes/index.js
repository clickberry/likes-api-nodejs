var express = require('express');
var Like = require('../models/like');

var permission = require('../middleware/permissions-mw')('relation');

var Bus = require('../lib/bus-service');
var bus = new Bus({});

var router = express.Router();

module.exports = function (passport) {
    router.get('/heartbeat', function (req, res) {
        res.send();
    });

    router.get('/up',
        passport.authenticate('access-token', {session: false, assignProperty: 'payload'}),
        permission.extractPayload('relationToken'),
        function (req, res, next) {
            var userId = req.payload.userId;
            var relationId = req.relation.id;

            Like.getUserLikes(relationId, 1, function (err, likes) {
                if (err) {
                    return next(err);
                }

                var likeDtos = likes.map(mapToLikeDto);
                res.send(likeDtos);
            });
        });

    router.get('/down',
        passport.authenticate('access-token', {session: false, assignProperty: 'payload'}),
        permission.extractPayload('relationToken'),
        function (req, res, next) {
            var userId = req.payload.userId;
            var relationId = req.relation.id;

            Like.getUserLikes(relationId, -1, function (err, likes) {
                if (err) {
                    return next(err);
                }

                var likeDtos = likes.map(mapToLikeDto);
                res.send(likeDtos);
            });
        });

    router.get('/:relationToken/up',
        passport.authenticate('access-token', {session: false, assignProperty: 'payload'}),
        permission.extractPayload('relationToken'),
        function (req, res, next) {
            var userId = req.payload.userId;
            var relationId = req.relation.id;

            Like.get(relationId, 1, 10, null, function (err, likes, page) {
                if (err) {
                    return next(err);
                }

                var likeDtos = likes.map(mapToLikeDto);
                res.send(likeDtos);
            });
        });

    router.get('/:relationToken/down',
        passport.authenticate('access-token', {session: false, assignProperty: 'payload'}),
        permission.extractPayload('relationToken'),
        function (req, res, next) {
            var userId = req.payload.userId;
            var relationId = req.relation.id;

            Like.get(relationId, -1, 10, null, function (err, likes, page) {
                if (err) {
                    return next(err);
                }

                var likeDtos = likes.map(mapToLikeDto);
                res.send(likeDtos);
            });
        });

    router.post('/:relationToken/up',
        passport.authenticate('access-token', {session: false, assignProperty: 'payload'}),
        permission.extractPayload('relationToken'),
        function (req, res, next) {
            var userId = req.payload.userId;
            var relationId = req.relation.id;

            var like = new Like({
                relationId: relationId,
                userId: userId,
                type: 1
            });

            like.create(function (err) {
                if (err) {
                    return next(err);
                }

                bus.publishLikeSignal(mapForBus(like), function(err){
                    if (err) {
                        return next(err);
                    }

                    res.sendStatus(201);
                });
            });
        });

    router.post('/:relationToken/down',
        passport.authenticate('access-token', {session: false, assignProperty: 'payload'}),
        permission.extractPayload('relationToken'),
        function (req, res, next) {
            var userId = req.payload.userId;
            var relationId = req.relation.id;

            var like = new Like({
                relationId: relationId,
                userId: userId,
                type: -1
            });

            like.create(function (err) {
                if (err) {
                    return next(err);
                }

                bus.publishLikeSignal(mapForBus(like), function(err){
                    if (err) {
                        return next(err);
                    }

                    res.sendStatus(201);
                });
            });
        });

    router.delete('/:relationToken',
        passport.authenticate('access-token', {session: false, assignProperty: 'payload'}),
        permission.extractPayload('relationToken'),
        function (req, res, next) {
            var userId = req.payload.userId;
            var relationId = req.relation.id;

            var like = new Like({
                relationId: relationId,
                userId: userId,
                type: 0
            });

            like.create(function (err) {
                if (err) {
                    return next(err);
                }

                bus.publishLikeSignal(mapForBus(like), function(err){
                    if (err) {
                        return next(err);
                    }

                    res.send();
                });
            });
        });


    router.get('/:relationToken/disable',
        passport.authenticate('access-token', {session: false, assignProperty: 'payload'}),
        permission.extractPayload('relationToken'),
        function (req, res, next) {
            var userId = req.payload.userId;
            var relationId = req.relation.id;

            res.send();
        });

    router.post('/:relationToken/disable',
        passport.authenticate('access-token', {session: false, assignProperty: 'payload'}),
        permission.extractPayload('relationToken'),
        function (req, res, next) {
            var userId = req.payload.userId;
            var relationId = req.relation.id;

            res.send();
        });

    router.delete('/:relationToken/disable',
        passport.authenticate('access-token', {session: false, assignProperty: 'payload'}),
        permission.extractPayload('relationToken'),
        function (req, res, next) {
            var userId = req.payload.userId;
            var relationId = req.relation.id;

            res.send();
        });

    return router;
};

function mapToLikeDto(like) {
    return {
        relationId: like.relationid,
        userId: like.userid,
        type: like.type,
        created: like.timestamp.getDate()
    }
}

function mapForBus(like) {
    return {
        relationId: like.relationid,
        userId: like.userid,
        type: like.type,
        timestamp: like.timestamp
    }
}