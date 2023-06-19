const Joi = require("joi");
const Admin = require("../model/Admin");

const router = require("express").Router();

// create admin
router.post("/register", async (req, res) => {
  const schema = Joi.object().keys({
    username: Joi.string().min(3).max(20).required(),
    email: Joi.string().email().min(3).max(20).required(),
    password: Joi.string().min(3).max(20).required(),
  });
  if (schema.validate(req.body).error) {
    return res.status(422).json(schema.validate(req.body).error.details);
  }
  try {
    const { username, email, password } = req.body;
    console.log(username, email, password);
    const admin = new Admin({
      username,
      email,
      password,
    });
    await admin.save();
    res.json(admin);
  } catch (error) {
    res.status(500).json({ error: "internal server error!" });
  }
});

// login admin
router.post("/login", async (req, res) => {
  const schema = Joi.object().keys({
    username: Joi.string().min(3).max(20).required(),
    password: Joi.string().min(3).max(20).required(),
  });
  if (schema.validate(req.body).error) {
    return res.status(422).json(schema.validate(req.body).error.details);
  }
  const { username, password } = req.body;
  try {
    const admin = await Admin.find({ username });
    if (admin.password !== password) {
      return res.status(500).json({ error: "wrong credentials!" });
    }
    if (!admin) {
      return res.status(404).json({ error: "admin not found!" });
    }
    res.json(admin);
    res.json(admin);
  } catch (error) {
    res.status(500).json({ error: "internal server error!" });
  }
});

module.exports = router;
