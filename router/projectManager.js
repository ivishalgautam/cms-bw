const Joi = require("joi");
const ProjectManager = require("../model/ProjectManager");

const router = require("express").Router();

// post project manager
router.post("/", async (req, res) => {
  const schema = Joi.object().keys({
    name: Joi.string().min(3).max(20).required(),
    email: Joi.string().min(3).max(40).required(),
    phone: Joi.string().min(3).max(20).required(),
  });
  if (schema.validate(req.body).error) {
    return res
      .status(422)
      .json({ error: schema.validate(req.body).error.details });
  }
  const { name, email, phone } = req.body;

  try {
    const managerExist = await ProjectManager.findOne({ email });
    if (managerExist) {
      return res.status(409).json({ error: "project manager already exist!" });
    }

    const newManager = new ProjectManager({
      name,
      email,
      phone,
    });
    await newManager.save();
    res.json(newManager);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// get all project managers
router.get("/", async (req, res) => {
  try {
    const projectManagers = await ProjectManager.find();
    res.json(projectManagers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// get manager by id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const manager = await ProjectManager.findById(id);
  if (!manager) return res.status(400).json({ error: "Manager not found!" });
  try {
    const manager = await ProjectManager.findById(id);
    res.json(manager);
  } catch (error) {
    res.status(error.message);
  }
});

// update manager
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const exist = await ProjectManager.findById(id);
    !exist && res.status(404).json({ error: "Manager not found!" });
    const updatedManager = await ProjectManager.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );
    // console.log(updatedManager);
    !updatedManager && res.status(404).json({ error: "Manager not found!" });
    res.json(updatedManager);
  } catch (error) {
    res.status(error.message);
  }
});

// delete manager
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const manager = await ProjectManager.findById(id);
  if (!manager) return res.status(400).json({ error: "Manager not found!" });

  try {
    await ProjectManager.findByIdAndDelete(id);
    res.json("manager deleted");
  } catch (error) {
    res.status(error.message);
  }
});

module.exports = router;
