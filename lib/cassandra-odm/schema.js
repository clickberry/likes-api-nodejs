function Schema(obj) {
    if (!(this instanceof Schema)) {
        return new Schema(obj);
    }

    this.obj = obj;
    this.statics = {};
    this.methods = {};
}

module.exports = Schema;