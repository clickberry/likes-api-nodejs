var express = require('express');
var Like = require('../models/like');

var permission=require('../middleware/permissions-mw')('relation');

var Bus = require('../lib/bus-service');
var bus = new Bus({});

var router = express.Router();

module.exports = function (passport) {
    router.get('/heartbeat', function (req, res) {
        res.send();
    });

    router.get('/:relationToken/up',
        passport.authenticate('access-token', {session: false, assignProperty: 'payload'}),
        permission.extractPayload('relationToken'),
        function (req, res, next) {
            var userId = req.payload.userId;
            var relationId = req.relation.id;

            Like.getRelationLikes(relationId, 1, 10, function(err, likes){
                if(err){
                    return next(err);
                }

                var likeDtos=likes.map(mapToLikeDto);
                res.send(likeDtos);
            });
        });

    router.get('/:relationToken/down',
        passport.authenticate('access-token', {session: false, assignProperty: 'payload'}),
        permission.extractPayload('relationToken'),
        function (req, res, next) {
            var userId = req.payload.userId;
            var relationId = req.relation.id;

            Like.getRelationLikes(relationId, -1, 10, function(err, likes){
                if(err){
                    return next(err);
                }

                var likeDtos=likes.map(mapToLikeDto);
                res.send(likeDtos);
            });
        });

    router.post('/:relationToken/up',
        passport.authenticate('access-token', {session: false, assignProperty: 'payload'}),
        permission.extractPayload('relationToken'),
        function (req, res, next) {
            var userId = req.payload.userId;
            var relationId = req.relation.id;

            var like=new Like({
                relationId: relationId,
                userId:userId,
                type: 1
            });

            like.save(function(err){
                if(err){
                    return next(err);
                }

                res.send();
            });
        });

    router.post('/:relationToken/down',
        passport.authenticate('access-token', {session: false, assignProperty: 'payload'}),
        permission.extractPayload('relationToken'),
        function (req, res, next) {
            var userId = req.payload.userId;
            var relationId = req.relation.id;

            var like=new Like({
                relationId: relationId,
                userId:userId,
                type: -1
            });

            like.save(function(err){
                if(err){
                    return next(err);
                }

                res.send();
            });
        });

    router.delete('/:relationToken',
        passport.authenticate('access-token', {session: false, assignProperty: 'payload'}),
        permission.extractPayload('relationToken'),
        function (req, res, next) {
            var userId = req.payload.userId;
            var relationId = req.relation.id;

            var like=new Like({
                relationId: relationId,
                userId:userId,
                type: 0
            });

            like.save(function(err){
                if(err){
                    return next(err);
                }

                res.send();
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

function mapToLikeDto(like){
    return {
        relationId: like.relationid,
        userId: like.userid,
        type: like.type,
        date: like.timestamp.getDate()
    }
}
