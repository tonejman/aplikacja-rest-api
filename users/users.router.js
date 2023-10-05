const { Router } = require("express");
const usersController = require("./users.controller");
const {
  userValidationMiddleware,
  userSubscriptionValidator,
} = require("./users.validators");
const { authMiddleware } = require("../auth/auth.middleware");

const usersRouter = Router();

usersRouter.post('/signup', userValidationMiddleware, usersController.signupHandler);
usersRouter.post('/login', userValidationMiddleware, usersController.loginHandler);
usersRouter.post('/logout', authMiddleware, usersController.logoutHandler);
usersRouter.get('/current', authMiddleware, usersController.currentHandler);
usersRouter.patch(
  "/",
  authMiddleware,
  userSubscriptionValidator,
  usersController.subscriptionHandler
);


module.exports = {
  usersRouter,
};