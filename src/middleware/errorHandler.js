module.exports=function(err,req,res,next){
  console.error(err);
  const status=err.status||500;
  const code=err.code||"system/internalError";
  const uuAppErrorMap={};
  uuAppErrorMap[code]={message:err.message||"Unexpected error.",severity:"error"};
  res.status(status).json({uuAppErrorMap});
};
