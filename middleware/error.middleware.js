function asyncMiddleware(handler){
    return async(req, res, next)=> {
        try{
                await handler(req, res)
        }
        catch(Ex){
            next(Ex)
        }
    }
}

module.exports = asyncMiddleware;