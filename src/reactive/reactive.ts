// v2
let o = {
  name:"cherry",
  age:18,
  _age:18
}

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

// console.log(o.age);
// o.age = 19
// console.log(o);

// 递归 defineReactive
 
let deepO = {
  name:"cherry",
  age:18,
  address:{
    city:["重庆","上海"],
    email:"cherry.com"
  }
}

// 深度DefineReactive
function deepDefineReactive(deepO){
  Object.keys(deepO).forEach(key=>{
    if (Array.isArray(deepO[key])) {
      deepO[key].forEach((value,index)=>{
        if (value instanceof Object) {
          deepDefineReactive(value)
        }else{
          defineReactive( deepO[key],index ,value,true )
        }
      })  
    }else if (deepO[key] instanceof Object) {
      deepDefineReactive(deepO[key])
    }
    defineReactive(deepO,key,deepO[key],true)
  })
}

deepDefineReactive(deepO)

console.log(deepO.address.city[1] = "北京");
console.log(deepO.address.city);
console.log(deepO);

console.log(deepO.age);


