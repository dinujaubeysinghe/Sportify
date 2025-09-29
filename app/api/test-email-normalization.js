const { body, validationResult } = require('express-validator');

const testEmailNormalization = async () => {
  const email = 'john.smith@sportify.com';
  const password = 'password123';
  
  console.log(`Original email: ${email}`);
  
  // Test validation
  const validationRules = [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
  ];
  
  // Simulate request
  const req = {
    body: { email, password }
  };
  
  // Run validation
  for (const rule of validationRules) {
    await rule.run(req);
  }
  
  const errors = validationResult(req);
  console.log(`Validation errors: ${errors.array().length}`);
  errors.array().forEach(error => {
    console.log(`- ${error.msg}`);
  });
  
  console.log(`Normalized email: ${req.body.email}`);
};

testEmailNormalization();
