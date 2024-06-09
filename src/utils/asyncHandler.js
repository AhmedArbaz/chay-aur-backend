// 1st way kabhi asay promeses ko use karin gay kabhi trycatch ko
const asyncHandler = (requestHandler) => {
  (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };

// 2nd way

// const asyncHandler = () =>{}                 normal arrow function
// const asyncHandler = (func)=>{}              arrow function with parameter
// const asyncHandler = (func) => async()=>{}

// arrow_function with parameter also with HIGH order & for wait we use async

//ya function hay wraper jo kay ham as utility use kartay hain

/*

const asyncHandler =(fun) => async(req,res,next)=>{
    try {
        await fn(req, res, next)
    } catch (error) {
        res.status(err.code || 400).json({
            success: false,
            message: err.message
        })
    }
}
    */
