const { body, param, query } = require('express-validator');

const authValidation = {
  register: [
    body('email').isEmail().normalizeEmail(),
    body('username')
      .isLength({ min: 3, max: 30 })
      .matches(/^[a-zA-Z0-9_]+$/),
    body('password').isLength({ min: 6 }),
    body('firstName').optional().isLength({ min: 1, max: 50 }),
    body('lastName').optional().isLength({ min: 1, max: 50 }),
    body('role').optional().isIn(['buyer', 'seller'])
  ],
  login: [body('login').notEmpty(), body('password').notEmpty()]
};

const userValidation = {
  userId: [param('id').isUUID()]
};

const productValidation = {
  create: [
    body('title').isLength({ min: 1, max: 200 }),
    body('description').optional().isLength({ max: 2000 }),
    body('price').isFloat({ min: 0 }),
    body('categoryId').optional().isUUID()
  ],
  productId: [param('id').isUUID()]
};

const paginationValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
];

module.exports = {
  authValidation,
  userValidation,
  productValidation,
  paginationValidation
};
