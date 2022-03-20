const authorModel = require('../models/authorModel')
const jwt = require('jsonwebtoken')


const isValid=function(value){
    if(typeof value==='undefined' || value===null) return false
    if(typeof value==='string' && value.trim().length===0) return false
    return true;
}

const isValidTitle=function(title){
    return ['Mr','Mrs','Miss'].indexOf(title)!==-1
}

const isValidRequestBody=function(author){
    return Object.keys(author).length>0
}

const createAuthor = async function (req, res) {
    try {
        const author = req.body
        if(!isValidRequestBody(author)){
            return res.status(400).send({status:false,message:"Invalid authors parameters"})
        }
        const{firstName,lastName,title,email,password}=author
        if(!isValid(firstName)){
            return res.status(400).send({status:false,message:"firstname is required"})
        }

        if(!isValid(lastName)){
           return res.status(400).send({status:false,message:"lastname is required"})
        }

        if(!isValid(title)){
            return res.status(400).send({status:false,message:"title is required"})
        }
        if(!isValidTitle(title)){
            return res.status(400).send({status:false,message:"title should contain Mr,Mrs,Miss"})
        }

        if(!isValid(email)){
             return res.status(400).send({status:false,message:"email is required"})
        }
        if(!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))){
            return res.status(400).send({status:false,message:"Provide valid email address"})
        }

        if(!isValid(password)){
            return res.status(400).send({status:false,message:"password is required"})
        }

        const isEmailAlreadyUsed=await authorModel.findOne({email})
       if(isEmailAlreadyUsed){
           return res.status(400).send({status:false,message:`${email} email adress is already registered`})
       }
        const data={firstName,lastName,title,email,password} 
        const authorData = await authorModel.create(data)
        res.status(201).send({ status: true,message:"author created successfully", data: authorData })
    }
    catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

const login = async function (req, res) {
    try {
        const body=req.body;
        if(!isValidRequestBody(body)){
            return res.status(400).send({status:false,message:"Invalid request parameters"})
        }
        let emailId = body.email
        let password = body.password
        if (!(emailId)) {
            return res.status(400).send({ status: false, msg: " emailId required" })
        }
        if(!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailId))){
            return res.status(400).send({status:false,message:"Provide valid email address"})
        }

        if (!(password)) {
            return res.status(400).send({ status: false, msg: " password required" })
        }

        let authorDetails = await authorModel.findOne({ email: emailId, password: password })
        if (!authorDetails) {
            return res.status(400).send({ status: false, msg: "Not Found" })
        } else {
            let token = jwt.sign({ authorId: authorDetails._id,
                iat:Math.floor(Date.now()/1000),
                exp:Math.floor(Date.now()/1000)+10*60*60 }, "Room No-38")
            res.header("x-api-key", token)
            res.status(201).send({ status: true, msg: "You login successful", data: token })
        }
    }
    catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}
module.exports.createAuthor = createAuthor
module.exports.login = login