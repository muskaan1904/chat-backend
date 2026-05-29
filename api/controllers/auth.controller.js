import { genToken } from "../../utils/genToken.js";
import { Auth } from "../models/auth.schema.js";


// SIGNUP
// export const signup = async (req, res, next) => {

//     try {
//         console.log(req.body);
//         const { username, email, password } = req.body;

//         // validation
//         if (!username || !email || !password) {
//             return res.status(400).json({
//                 message: "All fields are required",
//             });
//         }

//         // check existing user
//         const isUserExist = await Auth.findOne({ email });

//         if (isUserExist) {
//             return res.status(400).json({
//                 message: "Email already exists",
//             });
//         }

//         // create user
//         const user = await Auth.create({
//             username,
//             email,
//             password,
//         });

//         return res.status(201).json({
//             success: true,
//             message: "User registered successfully",
//             user,
//         });

//     } catch (err) {

//         return res.status(500).json({
//             message: err.message
//         });

//     }
// };

export const signup = async (req, res) => {
    try {
        console.log(req.body, "muskann");

        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }

        const isUserExist = await Auth.findOne({ email });

        if (isUserExist) {
            return res.status(400).json({
                message: "Email already exists",
            });
        }

        const user = await Auth.create({
            username,
            email,
            password,
        });
        console.log(user, "hello");
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user,
        });

    } catch (err) {
        console.log("SIGNUP ERROR:", err);

        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};



// SIGNIN
export const signin = async (req, res, next) => {

    try {

        console.log(req.body);

        const { email, password } = req.body;


        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }


        const user = await Auth.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password",
            });
        }

        // this come from auth schema , where we define a function 
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email or password",
            });
        }

        // TOKEN

        const token = await genToken(user._id, user.email, user.username);
        if (!token) {
            return res.status(400).json({
                message: "something went wrong"
            })
        }
        return res.status(200)
            .cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "development" ? false : true,
                sameSite: process.env.NODE_ENV === "development" ? "strict" : "none",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            }).json({
                message: "signin successfully",
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email
                }
            })



    } catch (err) {

        return res.status(500).json({
            message: err.message,
        });

    }
};


// signout

export const logout = async (req, res, next) => {
    try {

        return res.status(200)
            .clearCookie("token", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "development" ? false : true,
                sameSite: process.env.NODE_ENV === "development" ? "strict" : "none",
            }).json({
                message: "logout successfully",
            });

    }
    catch (err) {
        return res.status(500).json({
            message: err.message,
        });
    }
};

// get-all users

export const getUsers = async (req, res, next) => {

    try {
        const users = await Auth.find({ "_id": { "$ne": req.user.id } }).select("-password")

        if (users.length === 0) {
            return res.status(400).json({
                message: "No users found"
            })
        }
        return res.status(200).json({
            message: "success",
            data: users
        })

    }
    catch (err) {
        return res.status(500).json({
            error: err.message
        });

    }

}
