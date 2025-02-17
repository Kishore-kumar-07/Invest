const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/Token');
const { userModel } = require('../models/userSchema');

const login = async (req, res) => {
    try{
        const username = req.body.username;
        const password = req.body.password;

        if(!username || !password){
            return res.status(500).json({error:true,message:"invalid credentials"})
        }

        const user = await userModel.findOne({username:username})
        if(!user){
            return  res.status(500).json({error:true,message:"User Not Found"})
        }
        
        const passwordMatch =  await bcrypt.compare(password,user.password);
        if(passwordMatch){
            const authToken = await generateToken(username,"user");
            if(authToken === ""){
            return res.status(400).json({error:true, message:"auth token not generated"});
            }
            res.cookie("token", authToken);
            return res.status(200).json({error:false,message:{token:authToken,userType: "user"}})
        }
        else{
            return res.status(500).json({error:true,message:"Password not Matching"})
        }
    }
    catch(e){
        return res.status(404).json({error:true,message:e.message})
    }
}

const signup = async(req, res) =>{
    const username = req.body.username;
    const password = req.body.password;
    if(!username || !password ){
        return res.status(401).json({error: true, message:"invalid credentials"})
    }
    try{
        const response = await userModel.findOne({username:username});
        if(response){
            return res.status(401).json({error: true, message:"User Name already exists"});
        }

        const hashPassword = await bcrypt.hash(password, 10);

        try{
            const doc = await userModel.create({username: username, password: hashPassword})
            if(doc){
                const authToken = await generateToken(username,"user");
                if(authToken === ""){
                return res.status(400).json({error:true, message:"auth token not generated"});
                }
                // res.cookie("token", authToken);
                return res.status(200).json({error:false,message:{token:authToken,userType: "user"}})
            }
        }
        catch(err){
            console.log(err.message)
            return res.status(500).json({error:true, message: err.message})
        }
    }
    catch(err){
        console.log(err.message)
        return res.status(520).json({error:true, message: err.message})
    }
}

const getUser = async(req, res) =>{
    const userName = req.user;
    try{
        const user = await userModel.findOne({username: userName});
        if(user){
            return res.status(200).json({error:false, message:user})
        }
        else{
            return res.status(404).json({error:true, message:"User not found"})
        }
    }
    catch(e){
        return res.status(500).json({error:true, message:e.message})
    }
}

module.exports = {login, signup, getUser}