var moment = require('moment');
var cassandra = require('../lib/cassandra-odm');

var likeSchema = cassandra.Schema({
    id: {
        type: Number,
        key: true
    },
    userId: {
        type: String
    }
});

likeSchema.methods.save = function (callback) {
    var relationId = this.obj.relationId;
    var userId = this.obj.userId;
    var type = this.obj.type;

    var timestamp = cassandra.TimeUuid.now();

    var query1 = 'insert into likesRelationByType (relationId, type, timestamp, userId) values (?, ?, ?, ?)';
    var params1 = [relationId, type, timestamp, userId];

    var query2 = 'insert into likesRelationByUser (relationId, userId, type) values (?, ?, ?)';
    var params2 = [relationId, userId, type];

    Likes.client.execute(query1, params1, {prepare: true}, function (err) {
        if (err) {
            return callback(err);
        }

        Likes.client.execute(query2, params2, {prepare: true}, function (err) {
            if (err) {
                return callback(err);
            }

            callback();
        });
    });
};


likeSchema.statics.getRelationLikes = function (relationId, type, top, callback) {
    var count = top;
    var totalLikes = [];
    var timeUuid = new cassandra.TimeUuid(new Date(2999, 11, 31));
    var likeHashTable = new LikeHashTable();

    getTop(top, relationId, type, timeUuid, likeHashTable, function topCallback(err, likes, lastTimestamp) {
        if (err) {
            return callback(err);
        }

        var cutLikes = likes.slice(0, count);
        totalLikes = totalLikes.concat(cutLikes);

        if (lastTimestamp && totalLikes.length < top) {
            getTop(top, relationId, type, lastTimestamp, likeHashTable, topCallback);
        } else {
            callback(null, totalLikes);
        }
    });
};


function getTop(top, relationId, type, timestamp, likeHashTable, callback) {
    var limit = top * 2;
    var query1 = 'select * from likesRelationByType where relationId=? and type=? and timestamp<? order by type desc, timestamp desc limit ?';
    var params1 = [relationId, type, timestamp, limit];

    Likes.client.execute(query1, params1, {prepare: true}, function (err, likesByType) {
        if (err) {
            return callback(err);
        }

        var rowCount = likesByType.rowLength;
        var lastTimestamp = rowCount == limit ? likesByType.rows[rowCount - 1].timestamp : false;
        if (!rowCount) {
            return callback(null, [], false);
        }

        var userIds = likeHashTable.getUniqueUserIds(likesByType.rows);
        var keys = getKeys(userIds);

        if (!keys) {
            return callback(null, [], lastTimestamp)
        }

        var query2 = 'select * from likesRelationByUser where relationId=? and userId in (' + keys + ')';
        var params2 = [relationId];

        Likes.client.execute(query2, params2, {prepare: true}, function (err, likesByUser) {
            if (err) {
                return callback(err);
            }

            var likes = likeHashTable.getMatchedLikes(likesByUser.rows, type);

            callback(err, likes, lastTimestamp);
        });
    });
}

var Likes = module.exports = cassandra.model('likes', likeSchema);


function getKeys(keys) {
    var strKeys = keys.map(function (item) {
        return "'" + item + "'";
    });

    return strKeys.join(',');
}

function LikeHashTable() {
    var hashTable = {};
    this.getUniqueUserIds = function (likes) {
        var userIds = [];
        likes.forEach(function (item) {
            if (!hashTable[item.userid]) {
                hashTable[item.userid] = item;
                userIds.push(item.userid);
            }
        });

        return userIds;
    };

    this.getMatchedLikes = function (likes, type) {
        var matched = [];
        likes.forEach(function (item) {
            if (item.type === type) {
                var like = hashTable[item.userid];
                matched.push(like);
            }
        });

        var sorted = matched.sort(function (item1, item2) {
            if (item1.timestamp.getDate() > item2.timestamp.getDate()) {
                return -1;
            }
            if (item1.timestamp.getDate() < item2.timestamp.getDate()) {
                return 1;
            }

            return 0;
        });

        return sorted;
    };
}
