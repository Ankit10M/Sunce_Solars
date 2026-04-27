import express from 'express';
import {
    createJobCard,
    getJobCard,
    getAllJobCards,
    updateDiagnosis,
    updateRepairDecision,
    addSpare,
    updateTesting,
    updateDispatch,
} from '../controllers/jobCardController.js';
import protect from '../middleware/authMiddleware.js';
import restrictTo from '../middleware/roleMiddleware.js';

const jobRoute = express.Router();
jobRoute.use(protect)

jobRoute.get('/', getAllJobCards)
jobRoute.get('/:id', getJobCard)
jobRoute.post('/', restrictTo('engineer', 'service_manager', 'admin'), createJobCard)
jobRoute.post('/:id/spares', restrictTo('engineer', 'store_manager', 'admin'), addSpare)
jobRoute.put('/:id/diagnosis', restrictTo('engineer', 'service_manager', 'admin'), updateDiagnosis)
jobRoute.put('/:id/decision', restrictTo('engineer', 'service_manager', 'admin'), updateRepairDecision)
jobRoute.put('/:id/testing', restrictTo('engineer', 'service_manager', 'admin'), updateTesting)
jobRoute.put('/:id/dispatch', restrictTo('engineer', 'service_manager', 'admin'), updateDispatch)

export default jobRoute;