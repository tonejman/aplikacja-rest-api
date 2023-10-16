const User = require('./users.model');
const gravatar = require("gravatar");
const { v4: uuid } = require("uuid");

class DuplicatedKeyError extends Error {
  constructor(keyName, value) {
    super(`${keyName} has to be unique. ${value} is already taken.`);
  }
}

class UnknownDatabaseError extends Error {
  constructor() {
    super("Oops, something went wrong at database layer.");
  }
}

const createUser = async ({ email, password }) => {
  try {
    const avatarURL = gravatar.url(`${email}`, { default: "identicon" }, true);
    const verificationToken = uuid();
    const newUser = await User.create({
      email,
      password,
      avatarURL,
      verificationToken,
      verified: false,
    });
    return newUser;
  } catch (e) {
    console.error(e);

    if (e.code === 11000) {
      const [[key, value]] = Object.entries(e.keyValue);
      throw new DuplicatedKeyError(key, value);
    }

    throw new UnknownDatabaseError();
  }
};

const getUser = async (filter) => {
  try {
    return await User.findOne(filter);
  } catch (e) {
    console.error(e);
    throw new UnknownDatabaseError();
  }
};

const updateUser = async (email, userData) => {
  try {
    return await User.findOneAndUpdate({ email }, userData);
  } catch (e) {
    console.error(e);
    throw new UnknownDatabaseError();
  }
};

const updateSubscription = async (email, subscription) => {
  try {
    return await User.findOneAndUpdate(email, subscription, {
      new: true,
    });
  } catch (error) {}
};

const updateUserAvatar = async (email, avatarURL) => {
  try {
    return await User.findOneAndUpdate(email, avatarURL, {
      new: true,
    });
  } catch (e) {
    console.error(e);
    throw new UnknownDatabaseError();
  }
};

module.exports = {
  createUser,
  getUser,
  updateUser,
  DuplicatedKeyError,
  UnknownDatabaseError,
  updateSubscription,
  updateUserAvatar,
};