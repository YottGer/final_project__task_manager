import express, { json } from "express";
const cors = require("cors"); // import doesn't work

import { executeQuery, createProject, createTask } from "./dbFunctions";

const router = express();

router.use(json());
router.use(cors());

router.get("/projects", (req, res) => {
    executeQuery("SELECT * FROM public.project", res);
})

router.post("/create_project", (req, res) => {
    createProject(req.body);
    res.status(200).send("OK");
});

router.post("/create_task", (req, res) => {
    createTask(req.body);
    res.status(200).send("OK");
})

const port = process.env.PORT || 5000;
router.listen(port, () => console.log(`Listening on port ${port}...`));

// TODO:
// - validation - protect against SQL injection
// - send sucsess/error response
// - catch error!