const express = require("express");
const router = express.Router();
const controller = require("./controller");
const pool = require("./config");
const basicAuth = require("./mid_ware/basic_auth");

const { body, param, query, validationResult } = require('express-validator');


const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// create a to do
router.post("/",[body("title").notEmpty().withMessage("Title is required"),body("description").isString().optional(),],validate,controller.createTodoList);
// featch the to do 
router.get("/", controller.getTodoLists);
//get a single to do using an Id
router.get("/:id",[param("id").notEmpty().withMessage("ID is required").isString().withMessage("ID must be a string"),],validate,controller.getTodoListById);
//update teh to do list 
router.put("/:id",[
    param("id").notEmpty().withMessage("ID is required").isString().withMessage("ID must be a string"),
    body("title").optional().isString().withMessage("Title must be a string"),
    body("description").optional().isString().withMessage("Description must be a string"),
    body("completed").optional().isBoolean().withMessage("Completed must be a boolean"),
  ],validate,controller.updateTodoList);

// delete the to do with auth
router.delete("/:id",[basicAuth,param("id").notEmpty().withMessage("ID is required").isString().withMessage("ID must be a string"),],validate,controller.deleteTodoList);
// just to be used when setting up the db for bigger systems we can use Sequelize(models,migrarions,seeders)
router.get('/todo/setupdb', controller.CreateTable)
module.exports = router;
