const userDao = require('./users.service');
const authService = require('../auth/auth.service');
const jimp = require('jimp');
const mimetypes = require('mime-types');
const { v4 } = require('uuid');
const path = require('path');
const fs = require('fs/promises');
const User = require('./users.model');
const { sendUserVerificationMail } = require("./users-mailer.service");

const signupHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const createdUser = await userDao.createUser({ email, password });

    await sendUserVerificationMail(
      createdUser.email,
      createdUser.verificationToken
    );

    return res.status(201).send({
      user: {
        email: createdUser.email,
        subscription: createdUser.subscription,
        avatarURL: createdUser.avatarURL,
        verify: createdUser.verify,
        verificationToken: createdUser.verificationToken,
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
    const userEntity = await userDao.getUser({ email: req.body.email });
    const userPasswordValidate = await userEntity.validatePassword(
      req.body.password
    );

    if (!userEntity || !userPasswordValidate) {
      return res.status(401).send({ message: "Wrong credentials." });
    }

    if (!userEntity.verified) {
      return res.status(403).send({ message: "User is not verified." });
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

const verifyHandler = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await userDao.getUser({ verificationToken });

    if (!user) {
      return res
        .status(404)
        .send({ message: "Verification token is not valid or expired. " });
    }

    if (user.verified) {
      return res.status(400).send({ message: "User is already verified. " });
    }

    await userDao.updateUser(user.email, {
      verified: true,
      verificationToken: null,
    });

    return res.status(200).send({ message: "User has been verified." });
  } catch (e) {
    return next(e);
  }
};

const resendVerificationHandler = async (req, res, next) => {
  try {
    const user = await userDao.getUser({ email: req.body.email });

    if (!user) {
      return res.status(404).send({ message: "User does not exist." });
    }

    if (user.verified) {
      return res.status(400).send({ message: "User is already verified." });
    }

    await sendUserVerificationMail(user.email, user.verificationToken);

    return res.status(204).send();
  } catch {
    return next(e);
  }
};

module.exports = {
  signupHandler,
  loginHandler,
  logoutHandler,
  currentHandler,
  subscriptionHandler,
  updateUserAvatarHandler,
  verifyHandler,
  resendVerificationHandler,
};
