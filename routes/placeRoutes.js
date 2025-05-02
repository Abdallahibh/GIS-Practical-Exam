
const express = require('express');
const router = express.Router();
const {
  createPlace,
  getPlaces,
  getPlaceById,
  updatePlace,
  deletePlace,
  getNearbyPlaces,
  getDistanceToPlace
} = require('../controllers/placeController');

router.post('/', createPlace);
router.get('/', getPlaces);
router.get('/:id', getPlaceById);
router.put('/:id', updatePlace);
router.delete('/:id', deletePlace);
router.get('/nearby/search', getNearbyPlaces);
router.get('/:id/distance', getDistanceToPlace);

module.exports = router;
