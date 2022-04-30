// v2
let o = {
  name:"cherry",
  age:18,
  _age:18
}

Object.defineProperty(o,"age",{
  configurable:true,
  enumerable:true,
  set( newValue ){
    console.log(`age 被重新赋值为 ${newValue}`);
    o._age = newValue
  },
  get(){
    console.log("age 被访问");
    return o._age
  }
})

//使用闭包，将对象中的所有属性defineReactive
function defineReactive(target , key , value , enumerable){
  Object.defineProperty(target , key ,{
    configurable:true,
    enumerable:enumerable,
    get(){
      console.log(`${value} 被访问`);
      return value
    },
    set( newValue ){
      console.log(`${value} 被重新赋值为 ${ newValue }`);
      value = newValue
    }
  })
}
Object.keys(o).forEach(key=>{
  defineReactive(o,key,o[key],true)
})

console.log(o.age);
o.age = 19
console.log(o);
