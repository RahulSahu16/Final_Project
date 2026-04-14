import Property from "../models/Property.js";

export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate("owner", "email");
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }
    res.json(property);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch property" });
  }
};

export const createProperty = async (req, res) => {
  try {
    console.log("Creating property...");
    console.log("req.body:", req.body);
    console.log("req.user:", req.user);
    console.log("req.files:", req.files);

    const imagePaths = req.files ? req.files.map(file => file.filename) : [];

    const newProperty = new Property({
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      address: req.body.address,
      totalRooms: req.body.totalRooms,
      amenities: req.body.amenities || [],
      rules: req.body.rules,
      images: imagePaths,
      owner: req.user.id,
    });

    console.log("New property object:", newProperty);

    await newProperty.save();

    console.log("Property saved successfully");

    res.status(201).json(newProperty);
  } catch (err) {
    console.log("Error creating property:", err);
    res.status(500).json({ error: err.message || "Failed to create property" });
  }
};

export const getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find().populate("owner", "email");
    res.json(properties);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch properties" });
  }
};

export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ error: "Not found" });
    }

    // 🔥 AUTH CHECK
    if (property.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await property.deleteOne();

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
};

export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ error: "Not found" });
    }

    if (property.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const imagePaths = req.files ? req.files.map(file => file.filename) : property.images;

    const updated = await Property.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        address: req.body.address,
        totalRooms: req.body.totalRooms,
        amenities: req.body.amenities || [],
        rules: req.body.rules,
        images: imagePaths,
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
};