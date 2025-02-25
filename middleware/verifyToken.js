const jwt = require('jsonwebtoken');

// ** Middleware for user verify
const verifyToken = async(req,res, next)=>{
    const token = req?.cookies?.token;
    // ** Validate if token is not available
    if(!token){
      return res.status(401).json({message:'Access denied. No token provided.'})
    }
  
    // ** Verify if token have than sent,if not than err
    try{
      const decoded = jwt.verify(token,process.env.JWT_SECRET);
      req.user = decoded;
      next()
    }
    catch(err){
      return res.status(401).json(({ message: 'Invalid or expired token.' }));
    }
  
  };

module.exports = verifyToken;