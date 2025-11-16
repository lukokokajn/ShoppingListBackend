const { v4: uuidv4 }=require("uuid");
const { userCreateSchema, userGetSchema }=require("./user-validation");
const store=require("../data/store");

function createUser(req,res){
  const uuAppErrorMap={};
  const {error,value}=userCreateSchema.validate(req.body,{abortEarly:false});
  if(error){
    uuAppErrorMap["userCreate/invalidDtoIn"]={message:"DtoIn is not valid.",details:error.details.map(d=>d.message),severity:"error"};
    return res.status(400).json({uuAppErrorMap});
  }
  const exists=store.users.find(u=>u.email===value.email);
  if(exists){
    uuAppErrorMap["userCreate/emailNotUnique"]={message:`User with email '${value.email}' already exists.`,severity:"error"};
    return res.status(400).json({uuAppErrorMap});
  }
  const now=new Date().toISOString();
  const newUser={
    id:uuidv4(),
    email:value.email,
    name:{first:value.name.first,last:value.name.last,full:`${value.name.first} ${value.name.last}`},
    createdAt:now,
    updatedAt:now
  };
  store.users.push(newUser);
  return res.json({...newUser,uuAppErrorMap});
}

function getUser(req,res){
  const uuAppErrorMap={};
  const {error,value}=userGetSchema.validate(req.query,{abortEarly:false});
  if(error){
    uuAppErrorMap["userGet/invalidDtoIn"]={message:"DtoIn is not valid.",details:error.details.map(d=>d.message),severity:"error"};
    return res.status(400).json({uuAppErrorMap});
  }
  const user=store.users.find(u=>u.id===value.id);
  if(!user){
    uuAppErrorMap["userGet/userDoesNotExist"]={message:`User with id '${value.id}' does not exist.`,severity:"error"};
    return res.status(404).json({uuAppErrorMap});
  }
  return res.json({...user,uuAppErrorMap});
}

module.exports={createUser,getUser};
