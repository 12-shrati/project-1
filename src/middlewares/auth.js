const jwt = require('jsonwebtoken')



let authentication = async function (req, res, next) {
    try {
        let token = req.headers["x-api-key"]
        if (!token) {
            return res.status(401).send({ status: false, msg: "token required" })
        }

        let decodedToken = jwt.verify(token, "Room No-38")
        if (!decodedToken) {
            return res.status(401).send({ status: false, msg: "token invalid" })
        }
        next()

    }
    catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}




let authorization = function (req, res, next) {
    try {
        let authorId = req.params.authorId
        if (!authorId) {
            return res.status(400).send({ status: false, msg: "authorId required" })
        }
        let token = req.headers["x-api-key"]
        let decodedToken = jwt.verify(token, "Room No-38")
        if (decodedToken.authorId != authorId) {
            res.status(403).send({ status: false, msg: "unAthorized access" })
        }
        req.authorId=authorId
        next()
        
    }
    catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}


module.exports.authentication = authentication
module.exports.authorization = authorization
