

const errorHandler = (error , req , res , next)=>{
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';
    console.log('statusCode : ',error.statusCode);

    res.status(error.statusCode).render('404',{
        status : error.statusCode,
        message : error.message
    })
}



module.exports = errorHandler