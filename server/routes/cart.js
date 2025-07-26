import express from "express";
import Session from "../models/Session.js";
import Cart from "../models/Cart.js";

const router = express.Router();

// GET cart
router.get("/", async (req, res) => {
  const sessionId = req.signedCookies.sid;
  const session = await Session.findById(sessionId).populate(
    "data.cart.courseId"
  );

  if (!session.userId) {
    const cartCourses = session.data.cart.map(({ courseId, quantity }) => {
      const { id, name, price, image } = courseId;
      return {
        id,
        name,
        price,
        image,
        quantity
      };
    });

    return res.json(cartCourses);
  }

  const data = await Cart.findOne({ userId: session.userId }).populate('courses.courseId')
  const result = data.courses.map(({ courseId, quantity }) => {
    const { id, name, price, image } = courseId;
    return {
      id,
      name,
      price,
      image,
      quantity
    };
  })

  res.status(200).json(result)

});

// Add to cart
router.post("/", async (req, res) => {
  const sessionId = req.signedCookies.sid;
  const courseId = req.body.courseId;

  const session = await Session.findById(sessionId)

  if (session.userId) {
    const results = await Cart.updateOne(
      {
        userId: session.userId,
        "courses.courseId": courseId,
      },
      {
        $inc: { "courses.$.quantity": 1 },
      }
    );

    if (results.matchedCount === 0) {
      await Cart.updateOne(
        { userId: session.userId },
        {
          $push: {
            "courses": { courseId, quantity: 1 },
          },
        }
      );
    }

    return res.status(201).json({ messs: "Course added to cart" });
  }

  const results = await Session.updateOne(
    {
      _id: sessionId,
      "data.cart.courseId": courseId,
    },
    {
      $inc: { "data.cart.$.quantity": 1 },
    }
  );

  if (results.matchedCount === 0) {
    await Session.updateOne(
      { _id: sessionId },
      {
        $push: {
          "data.cart": { courseId, quantity: 1 },
        },
      }
    );

    // console.log(results);
  }

  res.status(201).json({ messs: "Course added to cart" });
});

// Remove course from cart
router.delete("/:courseId", async (req, res) => {
  const sessionId = req.signedCookies.sid;
  const { courseId } = req.params;

  console.log({ sessionId, courseId });

  const result = await Session.updateOne(
    { _id: sessionId },
    { $pull: { "data.cart": { courseId } } }
  );

  console.log(result);
  res.json({ message: "Successfully deleted" });
});

// Clear cart
router.delete("/", async (req, res) => {
  //Add your code here
});

export default router;
