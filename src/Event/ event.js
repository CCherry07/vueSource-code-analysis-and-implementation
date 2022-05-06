var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var MyEvent = /** @class */ (function () {
    function MyEvent() {
        // this.eventQueueMap  = new Map()
        this.eventQueueObj = {};
    }
    //订阅事件
    MyEvent.prototype.on = function (methodType, method) {
        (this.eventQueueObj[methodType] || (this.eventQueueObj[methodType] = [])).push(method);
        // this.pushEventQueue(methodType , method)
    };
    //移除订阅的事件
    MyEvent.prototype.off = function (type, funcHander) {
        var _this = this;
        if (funcHander === void 0) { funcHander = null; }
        if (!type) {
            this.eventQueueObj = {};
        }
        else if (type && !funcHander) {
            delete this.eventQueueObj[type];
        }
        else {
            this.eventQueueObj[type].forEach(function (func, index) {
                if (func === funcHander) {
                    _this.eventQueueObj[type].splice(index, 1);
                    _this.eventQueueObj[type].lenth === 0 && delete _this.eventQueueObj[type];
                }
            });
        }
    };
    //发布事件
    MyEvent.prototype.emit = function (type) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (!type)
            return;
        var ctx = args[0], other = args.slice(1);
        this.eventQueueObj[type].forEach(function (func) {
            func.call.apply(func, __spreadArray([ctx], other, false));
        });
    };
    MyEvent.createEvent = function () {
        return new MyEvent();
    };
    return MyEvent;
}());
