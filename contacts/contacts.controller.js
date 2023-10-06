const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
} = require("./contacts.service");

const getAllContactsHandler = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, favorite } = req.query;
    const contacts = await listContacts(
      req.user,
      page,
      limit,
      favorite
    );
    return res.json({ contacts });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const getSingleContactHandler = async (req, res, next) => {
  try {
    const contact = await getContactById(req.params.contactId);

    if (!contact) {
      return res.status(404).json({ message: "Not found" });
    }
    return res.json({ contact });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const addContactHandler = async (req, res) => {
  try {
    const newContact = await addContact(req.body);

    return res.status(201).json({ contact: newContact });
  } catch (error) {
    console.error(error);
  }
};

const removeContactHandler = async (req, res) => {
  try {
    const contact = await removeContact(req.params.contactId);
    if (!contact) {
      return res.status(200).json({ message: "contact deleted" });
    } else {
      res.status(404).json({ message: "Not found" });
    }
  } catch (error) {
    console.error(error);
  }
};

const updateContactHandler = async (req, res) => {
  try {
    const updatedContact = await updateContact(req.params.contactId, req.body);
    if (!updatedContact) {
      return res.status(400).json({ message: "missing field favorite" });
    }
    return res.json(updatedContact);
  } catch (error) {
    console.error(error);
  }
};

const updateStatusContactHanlder = async (req, res) => {
  const { favorite } = req.body;
  if (favorite === null) {
    return res.status(400).json({ message: "Missing field favorite" });
  }
  try {
    const result = await updateStatusContact(req.params.contactId, req.body);

    if (!result) {
      return res.status(404).json({ message: "Not found" });
    } else {
      return res.status(200).json(result);
    }
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  getAllContactsHandler,
  getSingleContactHandler,
  addContactHandler,
  updateContactHandler,
  updateStatusContactHanlder,
  removeContactHandler,
};
