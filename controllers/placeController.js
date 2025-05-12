const Place = require("../models/Place");
const mongoose = require("mongoose");
const axios = require("axios");

exports.searchNearbyPlaces = async (req, res) => {
  const { lat, lng, type } = req.query;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  try {
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
      {
        params: {
          location: `${lat},${lng}`,
          radius: 2000,
          type,
          key: apiKey,
        },
      }
    );

    // console.log(response.data);

    res.json(response.data.results);
  } catch (error) {
    console.error("Error fetching places from Google Maps API:", error);
    res.status(500).json({ error: "Failed to fetch places" });
  }
};

exports.createPlace = async (req, res) => {
  try {
    const place = await Place.create(req.body);
    res.status(201).json(place);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getPlaces = async (req, res) => {
  const places = await Place.find();
  res.json(places);
};

exports.getPlaceById = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ msg: "Place not found" });
    res.json(place);
  } catch (err) {
    res.status(400).json({ error: "Invalid ID" });
  }
};

exports.updatePlace = async (req, res) => {
  try {
    const place = await Place.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!place) return res.status(404).json({ msg: "Place not found" });
    res.json(place);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deletePlace = async (req, res) => {
  try {
    const place = await Place.findByIdAndDelete(req.params.id);
    if (!place) return res.status(404).json({ msg: "Place not found" });
    res.json({ msg: "Place deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getNearbyPlaces = async (req, res) => {
  const { lat, lng, category, radius } = req.query;
  try {
    const places = await Place.find({
      category: category,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseFloat(radius) * 1000,
        },
      },
    }).limit(5);
    res.json(places);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getDistanceToPlace = async (req, res) => {
  const { lat, lng } = req.query;
  const placeId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(placeId)) {
    return res.status(400).json({ error: "Invalid Place ID" });
  }

  try {
    const place = await Place.findById(placeId);
    if (!place) return res.status(404).json({ msg: "Place not found" });

    const userLocation = {
      type: "Point",
      coordinates: [parseFloat(lng), parseFloat(lat)],
    };

    const distance = await Place.aggregate([
      {
        $geoNear: {
          near: userLocation,
          distanceField: "dist.calculated",
          key: "location",
          spherical: true,
          query: { _id: place._id },
        },
      },
    ]);

    res.json({ distanceInMeters: distance[0]?.dist?.calculated || 0 });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
