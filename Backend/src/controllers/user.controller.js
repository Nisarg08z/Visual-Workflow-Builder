import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import { User } from "../models/user.model.js"

const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    
    console.log("Received body:", req.body);

    const { fullName, email, username, password } = req.body;

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        console.log("Validation failed: missing fields");
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        console.log("User exists:", existedUser);
        throw new ApiError(409, "User with email or username already exists");
    }

    const user = await User.create({
        fullName,
        email: email.toLowerCase(),
        password,
        username
    });

    console.log("---------> User created:", user);

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        console.log("Failed to fetch created user");
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {

    console.log("DEBUG BODY RECEIVED:", req.body);
    const { email, password } = req.body

    if (!email) {
        throw new ApiError(400, "email is required")
    }

    const user = await User.findOne({
        $or: [{ email }]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const accessTokenOptions = {
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
        maxAge: 24 * 60 * 60 * 1000
    };
    const refreshTokenOptions = {
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, accessTokenOptions)
        .cookie("refreshToken", refreshToken, refreshTokenOptions)
        .json(new ApiResponse(200, {
            user: loggedInUser, accessToken, refreshToken
        }, "User logged In Successfully"));
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")

        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefereshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            req.user,
            "User fetched successfully"
        ))
})

const addProject = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { projectId } = req.body;

    if (!projectId) {
        return res.status(400).json({ message: "project ID is required" });
    }

    await User.findByIdAndUpdate(userId, {
        $pull: { SaveProject: projectId },
    });

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
            $push: { SaveProject: { $each: [projectId], $position: 0 } },
        },
        { new: true }
    );

    if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
    }

    if (updatedUser.SaveProject.length > 50) {
        updatedUser.SaveProject = updatedUser.SaveProject.slice(0, 50);
        await updatedUser.save();
    }

    return res.status(200).json({
        message: "Project Save",
        SaveProject: updatedUser.SaveProject,
    });
});

const getProjects = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const SaveProject = await User.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(userId) },
        },
        {
            $lookup: {
                from: "project",
                localField: "SaveProject",
                foreignField: "_id",
                as: "SaveProject",
            },
        },
        { $unwind: "$SaveProject" },
        {
            $lookup: {
                from: "users",
                localField: "SaveProject.owner",
                foreignField: "_id",
                as: "uploader",
            },
        },
        { $unwind: "$uploader" },
        {
            $project: {
                _id: "$SaveProject._id",
            },
        },
        { $sort: { watchedAt: -1 } },
    ]);

    return res
        .status(200)
        .json(new ApiResponse(true, "saved projects fetched successfully", SaveProject));
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    getProjects,
    addProject
}