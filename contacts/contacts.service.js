const { Contact } = require("./contacts.model");

const listContacts = async (owner, page, limit, favorite) => {
  try {
    const filter = { owner };
    if (favorite !== undefined) {
      filter.favorite = favorite;
    }
    const result = await Contact.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    const count = await Contact.count(filter);
    return {
      result,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    };
  } catch (e) {
    console.error(e.message);
    throw e;
  }
};

const getContactById = async (owner, contactId) => {
  try {
    const contact = await Contact.findById(owner, contactId);
    return contact;
  } catch (error) {
    console.error(error.message);
    return null;
  }
};

const addContact = async (body) => {
  try {
    const newContact = new Contact(body);
    const saveContact = await newContact.save();
    return saveContact;
  } catch (error) {
    console.error(error.message);
    return null;
  }
};

const removeContact = async (owner, contactId) => {
  try {
    await Contact.findByIdAndDelete(owner, contactId);
  } catch (error) {
    console.error(error.message);
    return false;
  }
};

const updateContact = async (owner, contactId, body) => {
  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      { owner: owner, contactId },
      body,
      { new: true }
    );
    return updatedContact;
  } catch (error) {
    console.error(error.message);
    return null;
  }
};

const updateStatusContact = async (owner, contactId, body) => {
  try {
    const { favorite } = body;
    return await updateContact({ owner: owner, contactId }, { favorite });
  } catch (err) {
    console.log(err.message);
    return null;
  }
};


module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
};
