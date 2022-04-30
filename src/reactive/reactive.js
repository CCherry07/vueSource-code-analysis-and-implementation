// v2
var o = {
    name: "cherry",
    age: 18,
    _age: 18
};
// Object.defineProperty(o,"age",{
//   configurable:true,
//   enumerable:true,
//   set( newValue ){
//     console.log(`age 被重新赋值为 ${newValue}`);
//     o._age = newValue
//   },
//   get(){
//     console.log("age 被访问");
//     return o._age
//   }
// })
//使用闭包，将对象中的所有属性defineReactive
function defineReactive(target, key, value, enumerable) {
    Object.defineProperty(target, key, {
        configurable: true,
        enumerable: enumerable,
        get: function () {
            console.log("".concat(value, " \u88AB\u8BBF\u95EE"));
            return value;
        },
        set: function (newValue) {
            console.log("".concat(value, " \u88AB\u91CD\u65B0\u8D4B\u503C\u4E3A ").concat(newValue));
            value = newValue;
        }
    });
}
Object.keys(o).forEach(function (key) {
    defineReactive(o, key, o[key], true);
});
// console.log(o.age);
// o.age = 19
// console.log(o);
// 递归 defineReactive
var deepO = {
    name: "cherry",
    age: 18,
    address: {
        city: ["重庆", "上海"],
        email: "cherry.com"
    }
};
function deepDefineReactive(deepO) {
    Object.keys(deepO).forEach(function (key) {
        if (deepO[key] instanceof Array) {
            deepO[key].forEach(function (value, index) {
                if (value instanceof Object) {
                    deepDefineReactive(value);
                }
                else {
                    defineReactive(deepO[key], index, value, true);
                }
            });
        }
        else if (deepO[key] instanceof Object) {
            deepDefineReactive(deepO[key]);
        }
        else {
            defineReactive(deepO, key, deepO[key], true);
        }
    });
}
deepDefineReactive(deepO);
console.log(deepO.address.city[1]);
console.log(deepO.age);
