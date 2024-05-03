// const multer = require('multer')
// const path = require('path')

// const storage = multer.diskStorage({
//     destination : function (req,file,cb){
//         cb(null,'public/uploads');
//     },
//     filename:function (req,file,cb){
//         cb(null,Date.now() + "-" + file.realname)
//     }
// })

// const upload = multer ({
//     storage : storage,
//     limits : { files : 5 }
// })

// module.exports = upload