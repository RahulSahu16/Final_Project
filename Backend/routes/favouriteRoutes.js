import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// TOGGLE FAVOURITE
router.post("/:propertyId", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { propertyId } = req.params;

    const user = await User.findById(userId);

    const alreadyFav = user.favourites.includes(propertyId);

    if (alreadyFav) {
      // REMOVE
      user.favourites = user.favourites.filter(
        (id) => id.toString() !== propertyId
      );
    } else {
      // ADD
      user.favourites.push(propertyId);
    }

    await user.save();

    res.json({
      success: true,
      favourites: user.favourites,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/favourites", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("favourites");

    res.json({
      favourites: user.favourites,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching favourites" });
  }
});

export default router;