import express from 'express'
import {
    createAMC,
    getAllAMCs,
    getAMC,
    updateAMC,
    getExpiringAMCs,
    checkAMCStatus,
    generatePreventiveTickets,
    getAMCStats,
} from '../controllers/amcController.js'
import protect from '../middleware/authMiddleware.js'
import restrictTo from '../middleware/roleMiddleware.js'

const amcRouter = express.Router()
amcRouter.use(protect)

// AMC stats (admin/sales)
amcRouter.get('/stats', restrictTo('admin', 'sales'), getAMCStats)

// Expiring AMCs - renewal tracking (admin/sales)
amcRouter.get('/expiring', restrictTo('admin', 'sales'), getExpiringAMCs)

// Check AMC status for a customer-inverter pair (all authenticated)
amcRouter.get('/check', checkAMCStatus)

// Generate preventive maintenance tickets (admin/sales)
amcRouter.post('/generate-preventive', restrictTo('admin', 'sales'), generatePreventiveTickets)

// CRUD
amcRouter.post('/', restrictTo('admin', 'sales'), createAMC)
amcRouter.get('/', restrictTo('admin', 'sales'), getAllAMCs)
amcRouter.get('/:id', restrictTo('admin', 'sales'), getAMC)
amcRouter.patch('/:id', restrictTo('admin', 'sales'), updateAMC)

export default amcRouter
