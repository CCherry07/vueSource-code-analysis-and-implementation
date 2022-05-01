//函数的拦截
// 先将原有的函数保存在一个方法变量上，
// 然后修改原有的函数，
// 为了原来代码的功能一致通常在修改后的方法中调用方法变量。
// demo
function foo(name) {
    console.log(name);
}
var tempfoo = foo;
foo = function (name) {
    console.log("func 被拦截");
    tempfoo(name);
};
foo("cherry"); // func 被拦截 cherry
// push
var ARRAY_METHOD = [
    "push",
    "pop",
    "shift",
    "unshift",
    "reverse",
    "sort",
    "splice"
];
//使用原型继承 ，修改型链的结构
var testArr = [1, 2, 3, 4, 5];
var interceptArrayProto = Object.create(Array.prototype);
ARRAY_METHOD.forEach(function (method) {
    //拦截函数
    interceptArrayProto[method] = function () {
        console.log(method);
        return Array.prototype[method].apply(this, arguments);
    };
});
try {
    testArr.__proto__ = interceptArrayProto;
}
catch (error) {
    Object.keys(interceptArrayProto).forEach(function (funcKey) {
        testArr[funcKey] = interceptArrayProto[funcKey];
    });
}
