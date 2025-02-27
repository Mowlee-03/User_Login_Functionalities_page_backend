const db = require("../config/db");
const { hashPassword, verifyPassword } = require("../utils/password");
const { setAuthTokenCookie, generateToken, verifyToken } = require("../utils/token");
const jwt=require("jsonwebtoken")
const nodemailer=require("nodemailer")


const usersignup = async (req, res) => {
    try {
        const {
            email,
            password,
            username,
            phone_number
        } = req.body;

        const emailCheckquery = 'SELECT email FROM user WHERE email=?';
        const [existingUser] = await db.promise().execute(emailCheckquery, [email]);
        console.log("Query result:", existingUser);  // Debugging line to check the result
        if (existingUser.length > 0) {
            return res.status(400).json({
                status: 400,
                message: 'Email already exists',
            });
        }

        const hashpass = hashPassword(password);

        const data = [email, hashpass, username, phone_number];
        const insertQuery = 'INSERT INTO user(email, password, username, phone_number) VALUES(?, ?, ?, ?)';

        await db.promise().execute(insertQuery, data);

        res.status(200).json({
            status: 200,
            message: "Account Created Successfully"
        });

    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "An Error Occurred",
            err: error.message
        });
    }
};

const loginuser=async (req,res) => {
    try {
        const {username,password} = req.body
        const userQuery='SELECT * FROM user WHERE username=?';
        const [Users]=await db.promise().execute(userQuery,[username])

        if (Users.length===0) {
            return res.status(404).json({
                status:404,
                message:"User Not Found"
            })
        }

        const userdata=Users[0]
        const validatePassword=await verifyPassword(password,userdata.password)
        if (!validatePassword) {
           return res.status(403).json({
                status:403,
                message:"Invalid Password"
            })
        }

        const token=generateToken({id:userdata.id,username:userdata.username})
        setAuthTokenCookie(res,token)
        res.status(200).json({
            status:200,
            message:"Login Successfull",
        })
        
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "An Error Occurred",
            err: error.message
        });
    }
} 


const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate input
        if (!email) {
            return res.status(400).json({
                status: 400,
                message: "Email is required",
            });
        }

        // Check if user exists by email
        const userQuery = "SELECT * FROM user WHERE email = ?";
        const [users] = await db.promise().execute(userQuery, [email]);

        if (users.length === 0) {
            return res.status(404).json({
                status: 404,
                message: "User not found with that email",
            });
        }

        const userData = users[0];

        const resetToken = jwt.sign(
            { id: userData.id, email: userData.email },
            process.env.JWT_SECRET,  // Make sure to set a secret in your environment variables
            { expiresIn: '10m' }
        );
       
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            port:587,
            secure:false,
            auth: {
                user:process.env.EMAIL_USER ,  // Your email address
                pass: process.env.EMAIL_PASS,  // Your email password or app password
            },
        });

        const restlink=`${process.env.FRONTEND_URL}/resetpassword?id=${userData.id}&token=${resetToken}`
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userData.email,
            subject: 'Password Reset Request',
            html: `<p>Click the following link to reset your password:</p><a href="${restlink}">${restlink}</a>`, 
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            status: 200,
            message: "Email sent successfully",
        });
    } catch (error) {
       return res.status(500).json({
            status: 500,
            message: "An error occurred. Please try again later.",
            err:error.message
        });
    }
};


const resetpassword=async (req,res) => {
    try {
        const {id,token,password}=req.body
        const findUser='SELECT * FROM user WHERE id=?'
        const [user]=await db.promise().execute(findUser,[id])
        if (user.length===0) {
            return res.status(404).json({
                status:404,
                message:"User Not Found"
            })
        }
        const userData=user[0]
        const verifiedtoken=verifyToken(token)
        if (verifiedtoken.error) {
            return res.status(403).json({
                status: 403,
                message: verifiedtoken.error,
            });
        }
        console.log(verifiedtoken);
        if (verifiedtoken.id!=userData.id||verifiedtoken.email!=userData.email) {
            return res.status(403).json({
                status:403,
                message:"Unauthorized"
            })
        }
        
        const hashedPassword = hashPassword(password); // Ensure hashPassword hashes securely
        const updatePasswordQuery = 'UPDATE user SET password = ? WHERE id = ?';

        await db.promise().execute(updatePasswordQuery, [hashedPassword, id]);

        res.status(200).json({
            status:200,
            message:"Password Updated Successfully"
        })
        

    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "An error occurred. Please try again later.",
            err:error.message
        });
    }
}




const viewalluser=async (req,res) => {
    try {
        const query='SELECT * FROM user';

        db.query(query,(err,result)=>{
            if(err){
                res.json({
                    status:400,
                    error:err
                })
                return
            }
            res.json({
                status:200,
                message:'success',
                data:result
            })
        })
        
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "An Error Occurred",
            err: error.message
        })
    }
}

module.exports = {
    usersignup,
    viewalluser,
    loginuser,
    forgotPassword,
    resetpassword
};
