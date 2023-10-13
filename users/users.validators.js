const Joi = require("joi");

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  subscription: Joi.string().optional(),
});

const userValidationMiddleware = (req, res, next) => {
  const newUser = req.body;

  const { error } = userSchema.validate(newUser);

  if (error) {
      return res
          .status(400)
          .send({ error: error.message });
  }

  return next();
};

const userSubscriptionSchema = Joi.object({
  subscription: Joi.string().valid("starter", "pro", "business").required(),
});

const userSubscriptionValidator = (req, res, next) => {
  const { error } = userSubscriptionSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: error.message,
    });
  }

  return next();
};



module.exports = {
  userValidationMiddleware,
  userSubscriptionValidator,
};
