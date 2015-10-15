module.exports = function (tableName, schema, client) {
    function Model(obj) {
        this.schema = schema;
        this.obj = obj;
    }

    Model.client = client;

    for (var staticFunc in schema.statics) {
        Model[staticFunc] = function () {
            schema.statics[staticFunc].apply(Model, arguments);
        };
    }

    for (var method in schema.methods) {
        Model.prototype[method] = function () {
            schema.methods[method].apply(this, arguments);
        };
    }

    return Model;
};
