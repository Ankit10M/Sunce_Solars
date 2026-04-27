import Customer from '../models/Customer.js';
import User from '../models/User.js';
import Inverter from '../models/Inverter.js';

export const getMyProfile = async (req, res) => {
    try {
        if (req.user.role !== 'customer') {
            return res.status(403).json({ success: false, message: 'Only customers can access this' });
        }
        const customer = await Customer.findOne({ user: req.user._id })
            .populate('user', 'name email isActive');

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer profile not found' });
        }
        
        const inverters = await Inverter.find({ customer: customer._id });
        res.status(200).json({ success: true, customer, inverters });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.find()
            .populate('user', 'name email isActive lastLogin')
            .sort({ createdAt: -1 })
        res.status(200).json({ success: true, count: customers.length, customers })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}
export const getCustomer = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id)
            .populate('user', 'name email isActive lastLogin');

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found.' });
        }
        const inverters = await Inverter.find({ customer: customer._id });
        res.status(200).json({ success: true, customer, inverters });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateCustomer = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id)
        if (!customer) {
            return res.status(404).json({ success: false, message: 'cutomer not found' })
        }
        if (req.user.role == 'customer' && customer.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'You can update your own profile' })
        }
        const { name, companyName, phone, alternatePhone, address } = req.body;

        if (name) customer.name = name;
        if (companyName) customer.companyName = companyName;
        if (phone) customer.phone = phone;
        if (alternatePhone) customer.alternatePhone = alternatePhone;
        if (address) customer.address = { ...customer.address.toObject(), ...address };
        await customer.save();

        return res.status(200).json({ success: true, message: 'Profile Updated', customer })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const addInverter = async (req, res) => {
    try {
        let customerId = req.params.id;
        
        // If customer role, fetch their own customer profile
        if (req.user.role === 'customer' && !req.params.id) {
            const customer = await Customer.findOne({ user: req.user._id });
            if (!customer) {
                return res.status(404).json({ success: false, message: 'Customer profile not found.' });
            }
            customerId = customer._id;
        }
        
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found.' });
        }
        
        // Verify customer ownership if logged in as customer
        if (req.user.role === 'customer' && customer.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'You can only add inverters to your own profile.' });
        }
        
        const { make, model, capacity, serialNumber, installationDate, plantLocation, warrantyStartDate, warrantyEndDate } = req.body;
        const inverter = await Inverter.create({
            customer: customer._id,
            make,
            model,
            capacity,
            serialNumber,
            installationDate,
            plantLocation,
            warrantyStartDate: warrantyStartDate || undefined,
            warrantyEndDate: warrantyEndDate || undefined,
        });

        res.status(201).json({ success: true, message: 'Inverter registered.', inverter });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Serial number already exists.' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getCustomerInverters = async (req, res) => {
    try {
        // Support both :id param and query param
        let customerId = req.params.id || req.query.customerId;
        
        if (!customerId) {
            return res.status(400).json({ success: false, message: 'Customer ID required' });
        }

        const inverters = await Inverter.find({ customer: customerId })
            .select('_id make model serialNumber capacity plantLocation installationDate')
            .sort({ createdAt: -1 });
        
        return res.status(200).json({ success: true, count: inverters.length, inverters })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const deleteInverter = async (req, res) => {
    try {
        const { id } = req.params;
        const inverter = await Inverter.findById(id);
        
        if (!inverter) {
            return res.status(404).json({ success: false, message: 'Inverter not found' });
        }

        // Verify ownership if customer
        if (req.user.role === 'customer') {
            const customer = await Customer.findOne({ user: req.user._id });
            if (!customer || inverter.customer.toString() !== customer._id.toString()) {
                return res.status(403).json({ success: false, message: 'You can only delete your own inverters' });
            }
        }

        await Inverter.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'Inverter deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const addAddress = async (req, res) => {
    try {
        const customerId = req.params.id || (await Customer.findOne({ user: req.user._id }))?._id;
        
        if (!customerId) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        // Verify ownership
        if (req.user.role === 'customer' && customer.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'You can only add addresses to your own profile' });
        }

        const { street, city, state, country, pincode, type, isDefault } = req.body;
        
        if (!customer.addresses) {
            customer.addresses = [];
        }

        // If marking as default, unmark other defaults
        if (isDefault) {
            customer.addresses.forEach(addr => addr.isDefault = false);
        }

        const newAddress = {
            street,
            city,
            state,
            country: country || 'India',
            pincode,
            type: type || 'home',
            isDefault: isDefault || (!customer.addresses.length > 0)
        };

        customer.addresses.push(newAddress);
        await customer.save();

        res.status(201).json({ success: true, message: 'Address added successfully', addresses: customer.addresses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const updateAddress = async (req, res) => {
    try {
        const { customerId, addressId } = req.params;
        const customer = await Customer.findById(customerId);
        
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        // Verify ownership
        if (req.user.role === 'customer' && customer.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'You can only update your own addresses' });
        }

        const { street, city, state, country, pincode, type, isDefault } = req.body;
        const address = customer.addresses.id(addressId);
        
        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        // If marking as default, unmark other defaults
        if (isDefault) {
            customer.addresses.forEach(addr => addr.isDefault = false);
        }

        address.street = street || address.street;
        address.city = city || address.city;
        address.state = state || address.state;
        address.country = country || address.country;
        address.pincode = pincode || address.pincode;
        address.type = type || address.type;
        address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

        await customer.save();
        res.status(200).json({ success: true, message: 'Address updated successfully', addresses: customer.addresses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const deleteAddress = async (req, res) => {
    try {
        const { customerId, addressId } = req.params;
        const customer = await Customer.findById(customerId);
        
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        // Verify ownership
        if (req.user.role === 'customer' && customer.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'You can only delete your own addresses' });
        }

        customer.addresses.id(addressId).deleteOne();
        
        // If deleted address was default and others exist, mark first as default
        if (customer.addresses.length > 0 && !customer.addresses.some(a => a.isDefault)) {
            customer.addresses[0].isDefault = true;
        }

        await customer.save();
        res.status(200).json({ success: true, message: 'Address deleted successfully', addresses: customer.addresses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const setDefaultAddress = async (req, res) => {
    try {
        const { customerId, addressId } = req.params;
        const customer = await Customer.findById(customerId);
        
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        // Verify ownership
        if (req.user.role === 'customer' && customer.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'You can only update your own addresses' });
        }

        const address = customer.addresses.id(addressId);
        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        customer.addresses.forEach(addr => addr.isDefault = false);
        address.isDefault = true;

        await customer.save();
        res.status(200).json({ success: true, message: 'Default address updated', addresses: customer.addresses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}