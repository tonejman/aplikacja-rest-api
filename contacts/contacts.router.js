const express = require("express");
const {
  getAllContactsHandler,
  getSingleContactHandler,
  addContactHandler,
  removeContactHandler,
  updateContactHandler,
  updateStatusContactHanlder,
} = require("./contacts.controller");
const {
  contactValidationMiddleware,
  statusValidationMiddleware,
} = require("./contacts.validators");
const { authMiddleware } = require("../auth/auth.middleware");

const router = express.Router();

router.get("/", authMiddleware, getAllContactsHandler);
router.get("/:contactId", authMiddleware, getSingleContactHandler);
router.post("/", authMiddleware, addContactHandler);
router.delete("/:contactId", authMiddleware, removeContactHandler);
router.put(
  "/:contactId",
  authMiddleware,
  contactValidationMiddleware,
  updateContactHandler
);
router.patch(
    "/:contactId/favorite",
    authMiddleware,
  statusValidationMiddleware,
  updateStatusContactHanlder
);

module.exports = router;
