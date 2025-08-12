const { body, param } = require('express-validator');
const BusTypes = ['30-seater', '56-seater', '70-seater'];

exports.createAgencyValidation = [
  body('name')
    .notEmpty().withMessage('Agency name is required')
    .trim()
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    
  body('buses')
    .isArray({ min: 1 }).withMessage('At least one bus is required')
    .custom(buses => {
      if (!buses.every(bus => bus.number && bus.type)) {
        throw new Error('Each bus must have number and type');
      }
      return true;
    }),
    
  body('buses.*').customSanitizer((bus) => {
    // Auto-set capacity if not provided
    if (!bus.capacity) {
      const capacityMap = {
        '30-seater': 30,
        '56-seater': 56,
        '70-seater': 70
      };
      bus.capacity = capacityMap[bus.type];
    }
    return bus;
  }),
    
  body('buses.*.number')
    .notEmpty().withMessage('Bus number is required')
    .trim()
    .toUpperCase()
    .matches(/^[A-Z0-9-]+$/).withMessage('Bus number can only contain letters, numbers and hyphens'),
    
  body('buses.*.type')
    .notEmpty().withMessage('Bus type is required')
    .isIn(BusTypes).withMessage(`Bus type must be one of: ${BusTypes.join(', ')}`),
    
  body('contactEmail')
    .optional()
    .isEmail().withMessage('Invalid email format'),
    
  body('contactPhone')
    .optional()
    .isMobilePhone().withMessage('Invalid phone number')
];

exports.updateAgencyValidation = [
  param('id')
    .isMongoId().withMessage('Invalid agency ID'),
    
  body('name')
    .optional()
    .notEmpty().withMessage('Agency name cannot be empty')
    .trim()
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    
  body('buses')
    .optional()
    .isArray({ min: 1 }).withMessage('At least one bus is required')
    .custom(buses => {
      if (!buses.every(bus => bus.number && bus.type)) {
        throw new Error('Each bus must have number and type');
      }
      return true;
    }),
    
  body('buses.*').customSanitizer((bus) => {
    if (!bus.capacity) {
      const capacityMap = {
        '30-seater': 30,
        '56-seater': 56,
        '70-seater': 70
      };
      bus.capacity = capacityMap[bus.type];
    }
    return bus;
  }),
    
  body('buses.*.number')
    .optional()
    .notEmpty().withMessage('Bus number is required')
    .trim()
    .toUpperCase()
    .matches(/^[A-Z0-9-]+$/).withMessage('Bus number can only contain letters, numbers and hyphens'),
    
  body('buses.*.type')
    .optional()
    .notEmpty().withMessage('Bus type is required')
    .isIn(BusTypes).withMessage(`Bus type must be one of: ${BusTypes.join(', ')}`),
    
  body('contactEmail')
    .optional()
    .isEmail().withMessage('Invalid email format'),
    
  body('contactPhone')
    .optional()
    .isMobilePhone().withMessage('Invalid phone number')
];