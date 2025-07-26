import express from "express";
import User from "../models/User.js";
import Session from "../models/Session.js";
import Cart from "../models/Cart.js";
import { checkSession } from "../middleware/auth.js";

const router = express.Router();

// Register new user
router.post("/register", async (req, res) => {
  // console.log(req.body);
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const user = new User({
      email,
      password,
      name,
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const sessionId = req.signedCookies.sid;
    const session = await Session.findById(sessionId);

    if (session) {
      session.expires = Math.round(Date.now() / 1000) + 60 * 60 * 24 * 30;
      session.userId = user._id;

      if (session.data?.cart?.length) {
        const existingCart = await Cart.findOne({ userId: user._id })

        if (existingCart) {
          const mergedCourses = [...existingCart.courses]

          for (const item of session.data.cart) {
            const found = mergedCourses.find(
              (c) => c.courseId.toString() === item.courseId.toString()
            );

            if (found) {
              found.quantity += item.quantity || 1;
            } else {
              mergedCourses.push({ ...item, quantity: item.quantity || 1 });
            }
          }

          existingCart.courses = mergedCourses;
          await existingCart.save();
        } else {
          await Cart.create({
            userId: user.id,
            courses: session.data.cart.map((item) => ({
              ...item,
              quantity: item.quantity || 1,
            })),
          });
        }
        session.data.cart = [];
      }

      await session.save();

      res.cookie("sid", session.id, {
        httpOnly: true,
        signed: true,
        maxAge: 60 * 60 * 1000 * 27 * 30,
      });

      return res.json({
        message: "Login successful",
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
      });
    }

    const newSession = await Session.create({ userId: user._id });
    res.cookie("sid", newSession.id, {
      httpOnly: true,
      signed: true,
      maxAge: 60 * 60 * 1000 * 27 * 30,
    });

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/logout', async (req, res) => {
  const sessionId = req.signedCookies.sid;
  await Session.findByIdAndDelete(sessionId);
  res.json({ message: "Logout successfully !!" })
})

//usedata
router.get("/profile", async (req, res) => {
  try {
    const sessionId = req.signedCookies.sid;
    const session = await Session.findById(sessionId);

    if (!session || !session.userId) {
      return res.status(404).json({ error: "User not logged in!!" });
    }

    if (session.expires < Math.floor(Date.now() / 1000)) {
      await session.deleteOne()
      return res.status(404).json({ error: "User not logged in!!" });
    }

    console.log(session.userId);
    const user = await User.findById(session.userId).lean();

    // console.log(user);

    res.json({
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

