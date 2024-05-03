// let n = 15;
// let res= []
// for(let i=1;i<=n;i++){
//     if(i%3===0&&i%5===0){
//         res.push('fizzbuzz')
//     }
//     else if(i%3===0){
//         res.push('fiz')
//     }
//    else if(i%5===0){
//         res.push('buzz')
//     }else{
        
//         res.push(i.toString())
//     }
// }
// console.log(res);
// let  s = "Hello";
// let small = s.toLowerCase()
// console.log(small);
// let str = 'my name is shabeen'
// let arr = str.split(' ')
// console.log(arr);
// let nums = [1,15,6,3]
// let sum1 = nums.reduce((acc,curr)=>{
//     return acc + curr; 
// },0)
// let sum2 = []
// for(let i=0;i<nums.length;i++ ){
//     if(nums[i]>=10){
//         let f = Math.floor(nums[i]/10)
//         let s = nums[i]%10
//         sum2.push(f,s)
        
//     }else{
//         sum2.push(nums[i])
//     }
// }
// console.log(sum2);

// var a = 20 ;
// a = a+10;

// var arr = [1,2,3,4]
// arr.push(5)

// var obj = {
//     a:10,
//     b:20
// }
// obj.a = 30;


//[1,2,4,5,7,6,6]
// for(let i=0;i<arr.length;i++){
//     arr[i].toString().split('')
// }


// let res = arr.map((item)=>{
//     if(item>10){
//        let str = item.toString().split('')
//        sum = 0
//        for(let i=0;i<str.length;i++){
//             sum += parseInt(str[i])
            
//        }
       
//        return sum
//     }else{
//         return item
//     }
// })
// console.log(res);

// let n = 234;
// let str = n.toString().split('')
// console.log(str);

// let arr= []
// for(let i=0;i<num;i++){
//     if(i<10&&i%2==0){
//         arr.push(i)
//     }else{
//         let f = Math.floor(i/10)
//         let s = i%10
//         if((f+s)%2==0){
//             arr.push(i)
//         }
//     }
// }
// console.log(arr);
// let num = 28
// let arr= []
//     for(let i=0;i<num;i++){
//         if(num%i==0){
//             arr.push(i)
//         }
//     }
//     console.log(arr);

// let a = '123'
// let b = 45
// let c= a+b
// console.log(typeof(c));

// let a = '123'
// let b = Number(a)
// console.log(typeof(b));
// let nums = [7,7,5,5,6,6,1,1,1]
// let sort = nums.sort()
//     console.log(sort[Math.floor(sort.length/2)]) 
// let num = 12345;
// let str = Array.from(String(num),Number)
// console.log(str);
// let num = 12345
// let a = num.toString().split('')

// let nums = [1,2,0]
// let sort = nums.sort((a,b)=>a-b)
// console.log(sort);
// let max = sort[sort.length-1]+1
// console.log(max);
// for(let i = 1 ; i<=max;i++){
//     if(sort[i]>=1){
//         if(sort[i]!==i){
//             console.log(i);
            
//         }
//     }
// }
// let nums1 = [1,2,3,0,0,0]
// let nums2 = [2,5,6]
// let arr = [...nums1,...nums2].sort()
// let out = []
// for(let i=0;i<arr.length;i++){
//     if(arr[i]!==0){
//         out.push(arr[i])
//     }
// }
//    console.log(out);
// let num = 14
// for(let i=1;i<=num;i++){
//     if(i*i==num){
//         console.log('true');
//     }
// }
