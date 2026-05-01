import Product from "../models/Product.js";

// CREATE
export const createProduct = async (req, res) => {
  const product = await Product.create({
    ...req.body,
    image: req.file?.path,
  });
  res.status(201).json(product);
};

// GET ALL
export const getProducts = async (req, res) => {
  const products = await Product.find();
  res.json(products);
};

// GET ONE
export const getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  res.json(product);
};

// UPDATE
export const updateProduct = async (req, res) => {
  const updated = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
};

// DELETE
export const deleteProduct = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};