import express from 'express'
import protect from '../middleware/authMiddleware.js'
import restrictTo from '../middleware/roleMiddleware.js'
import {
    getMyProfile,
    getAllCustomers,
    getCustomer,
    updateCustomer,
    addInverter,
    getCustomerInverters,
    deleteInverter,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
} from '../controllers/customerController.js';

const customRouter = express.Router();
customRouter.use(protect);
customRouter.get('/my-profile', getMyProfile)
customRouter.get('/', restrictTo('sales', 'service_manager', 'admin'), getAllCustomers)
customRouter.get('/inverters/by-customer', getCustomerInverters)
customRouter.post('/inverters', addInverter)
customRouter.delete('/inverters/:id', deleteInverter)
customRouter.post('/:id/addresses', addAddress)
customRouter.put('/:customerId/addresses/:addressId', updateAddress)
customRouter.delete('/:customerId/addresses/:addressId', deleteAddress)
customRouter.patch('/:customerId/addresses/:addressId/default', setDefaultAddress)
customRouter.get('/:id', getCustomer)
customRouter.get('/:id/inverters', getCustomerInverters)
customRouter.post('/:id/inverters', addInverter)
customRouter.put('/:id', updateCustomer)

export default customRouter;