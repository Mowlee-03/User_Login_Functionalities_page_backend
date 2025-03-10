const jwt=require("jsonwebtoken")

const generateToken = (payload) => {
    console.log(payload)
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '20m'
    });
  };

  const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET); // Use a secure secret
    } catch (err) {
        // Handle specific token errors
        if (err.name === 'TokenExpiredError') {
            return { error: 'Token has expired' };
        } else {
            return { error: 'Invalid token' };
        }
    }
};

  const setAuthTokenCookie = (res, token) => {
      res.cookie('authToken', token, {
          httpOnly: false, // Prevent access from JavaScript (mitigates XSS attacks)
          secure: process.env.NODE_ENV==="production",
          sameSite: 'strict', // Protect against CSRF
          maxAge: 20 * 60 * 1000, 
      });
    };


    // const token = req.cookies.authToken;
    // console.log("Extracted token",token);
    // if (!token) {
    //   return res.status(401).json({
    //     status: 401,
    //     message: "Authentication required",
    //   });
    // }

  module.exports={
    generateToken,
    verifyToken,
    setAuthTokenCookie
  }