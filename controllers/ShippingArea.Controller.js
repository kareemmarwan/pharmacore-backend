const asyncHandler = require("express-async-handler");
const ShippingArea = require("../models/ShippingArea.Model");


// @desc Get all shipping areas
// @route GET /api/shipping-areas
// @access Public or Admin
const getShippingAreas = asyncHandler(async (req, res) => {

  const areas = await ShippingArea.find();

  const formattedAreas = areas.map(area => ({
    _id: area._id,
    name: area.name, // { ar, en }
    city: area.city,
    shippingCost: area.shippingCost,
    status: area.status,
    createdAt: area.createdAt
  }));

  res.status(200).json(formattedAreas);
});


// @desc Get single shipping area
// @route GET /api/shipping-areas/:id
// @access Admin
const getShippingAreaById = asyncHandler(async (req, res) => {

  const area = await ShippingArea.findById(req.params.id);

  if (!area) {
    res.status(404);
    throw new Error("Shipping area not found");
  }

  const lang = req.query.lang || "ar";

  const formattedArea = {
    _id: area._id,
    name: area.name[lang],
    city: area.city,
    shippingCost: area.shippingCost,
    status: area.status
  };

  res.status(200).json(formattedArea);
});


// @desc Create shipping area
// @route POST /api/shipping-areas
// @access Admin
const createShippingArea = asyncHandler(async (req, res) => {

  const { nameAr, nameEn, city, shippingCost, status } = req.body;
  console.log( nameAr, nameEn, city, shippingCost, status )

  if (!nameAr || !nameEn || !shippingCost || !city) {
    res.status(400);
    throw new Error("Area name and shipping cost are required");
  }

  const existing = await ShippingArea.findOne({
    $or: [
      { "name.ar": nameAr },
      { "name.en": nameEn }
    ]
  });

  if (existing) {
    res.status(400);
    throw new Error("Shipping area already exists");
  }

  const area = await ShippingArea.create({
    name: { ar: nameAr, en: nameEn },
    city,
    shippingCost,
    status: status || "active"
  });

  res.status(201).json(area);
});


// @desc Update shipping area
// @route PUT /api/shipping-areas/:id
// @access Admin
const updateShippingArea = asyncHandler(async (req, res) => {
  const area = await ShippingArea.findById(req.params.id);

  if (!area) {
    res.status(404);
    throw new Error("Shipping area not found");
  }

  const { nameAr, nameEn, city, shippingCost, status } = req.body;

  if (nameAr) area.name.ar = nameAr;
  if (nameEn) area.name.en = nameEn;
  if (city) area.city = city;
  if (shippingCost !== undefined) area.shippingCost = shippingCost;
  if (status) area.status = status;

  const updatedArea = await area.save();

  res.status(200).json(updatedArea);
});


// @desc Delete shipping area
// @route DELETE /api/shipping-areas/:id
// @access Admin
const deleteShippingArea = asyncHandler(async (req, res) => {

  const area = await ShippingArea.findById(req.params.id);

  if (!area) {
    res.status(404);
    throw new Error("Shipping area not found");
  }

  await area.deleteOne();

  res.status(200).json({
    success: true,
    message: "Shipping area deleted successfully"
  });

});


module.exports = {
  getShippingAreas,
  getShippingAreaById,
  createShippingArea,
  updateShippingArea,
  deleteShippingArea
};