const userDao = require('./users.service');
const authService = require('../auth/auth.service');
const jimp = require('jimp');
const mimetypes = require('mime-types');
const { v4 } = require('uuid');
const path = require('path');
const fs = require('fs/promises');
const User = require('./users.model');

const signupHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const createdUser = await userDao.createUser({ email, password });

    return res.status(201).send({
      user: {
        email: createdUser.email,
        subscription: createdUser.subscription,
        avatarURL: createdUser.avatarURL,
      },
    });
  } catch (e) {
    const { message } = e;

    if (e instanceof userDao.DuplicatedKeyError) {
      return res.status(409).send({ message });
    }

    return next(e);
  }
};

const loginHandler = async (req, res, next) => {
  try {
    const userEntity = await userDao.getUser(req.body.email);
    const userPasswordValidate = await userEntity.validatePassword(
      req.body.password
    );

    if (!userEntity || !userPasswordValidate) {
      return res.status(401).send({ message: "Wrong credentials." });
    }

    const userPayload = {
      email: userEntity.email,
      subscription: userEntity.subscription,
    };

    const token = authService.generateAccessToken(userPayload);
    await userDao.updateUser(userEntity.email, { token });

    return res.status(200).send({
      user: userPayload,
      token,
    });
  } catch (e) {
    return next(e);
  }
};

const logoutHandler = async (req, res, next) => {
  try {
    const { email } = req.user;
    await userDao.updateUser(email, { token: null });

    return res.status(204).send();
  } catch (e) {
    return next(e);
  }
};

const currentHandler = async (req, res, next) => {
  try {
    const { email, subscription } = req.user;
    return res.status(200).send({ user: { email, subscription } });
  } catch (e) {
    return next(e);
  }
};

const subscriptionHandler = async (req, res, next) => {
  try {
    const user = await userDao.updateSubscription(req.user, req.body);
    if (!user) {
      return res.status(404).json({ message: "Not found" });
    }
    return res.send({ email: user.email, subscription: user.subscription });
  } catch (err) {
    return next(err);
  }
};

const updateUserAvatarHandler = async (req, res, next) => {
  try {
    const { email } = req.body;
    const avatarImage = await jimp.read(req.file.path);
    const resizedAvatar = avatarImage.resize(250, 250);
    await resizedAvatar.writeAsync(req.file.path);
    const fileName = `${email}_${v4()}.${mimetypes.extension(
      req.file.mimetype
    )}`;
    await fs.rename(
      req.file.path,
      path.join(__dirname, '..', 'public/avatars', fileName)
    );

    const updatedUser = await User.findOneAndUpdate(
      { email },
      {
        avatarURL: `${req.protocol}://${req.headers.host}/avatars/${fileName}`,
      },
      { new: true }
    );
    if (updatedUser) {
      return res.status(200).send({ result: updatedUser.avatarURL });
    } else {
      return res.status(401).send({ message: "Not authorized" });
    }
  } catch (e) {
    console.error(e);
    next(e);
  }
};

module.exports = {
  signupHandler,
  loginHandler,
  logoutHandler,
  currentHandler,
  subscriptionHandler,
  updateUserAvatarHandler,
};
