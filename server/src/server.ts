import express, { json, Request, Response } from "express";
import { JwtPayload, sign, verify } from "jsonwebtoken";
const cors = require("cors"); // import doesn't work

import { executeQuery, createProject, createTask, createComment } from "./dbFunctions";

const secret = "b6506e25c723b2327383c15ed6342a320857cf16035460504f09d1ee92f392846ce9ffecd8c5215f19593f452f4cfaa6d6ed6bd97a700ba7f3ba4dcfa5ab6444";
const refreshSecret = "411c3b1fb19ca25127a3360a266feaa84312f05ddb1627e82aa27e3b7a7ddf7e8872b0f95a2fe7877bc753570af30d324f3410bbd64bd05f7771ae1316db32ab";
//TODO: hide the secretes in another file
//TODO: use refresh token

const autherizeToken = (req: Request, res: Response, next: Function) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(' ')[1]; // (Authorization: )Bearer <token>
    if (!token) return res.sendStatus(401);
    verify(token, secret, (err, user: any) => { // fix any!!!!
        console.log(err)
        // if (err) return res.status(403).send("authorization failed. try again..."); // authorization failed
        // Why doesn't the above line work?!?!?!!?!??!!?!?!?
        Object.assign(req, {username: user?.name});
        next();
    })
}

const router = express();

// middlewares
router.use(json());
router.use(cors());
router.use("/projects", autherizeToken);
// router.use("/project/:projectId/tasks", autherizeToken);
// router.use("/task/:taskId", autherizeToken);
// router.use("/task/:taskId/comments", autherizeToken);
// router.use("/create_project", autherizeToken);
// router.use("/create_task", autherizeToken);
// router.use("/create_comment", autherizeToken);
router.use("/test_auth", autherizeToken);

// routes
router.get("/projects", (req, res) => {
    executeQuery("SELECT * FROM public.project;", res);
})

router.get("/project/:projectId/tasks", (req, res) => {
    executeQuery(`SELECT * FROM public.task WHERE "projectId"=${req.params.projectId};`, res);
})

router.get("/task/:taskId", (req, res) => {
    executeQuery(`SELECT * FROM public.task WHERE "id"=${req.params.taskId};`, res);
});

router.get("/task/:taskId/comments", (req, res) => {
    executeQuery(`SELECT * FROM public.comment WHERE "taskId"=${req.params.taskId};`, res);
});

router.get("/users", (req, res) => {
    executeQuery("SELECT username FROM public.user;", res);
});

router.post("/create_project", (req, res) => {
    createProject(req.body);
    res.status(200).send("OK");
});

router.post("/create_task", (req, res) => {
    createTask(req.body);
    res.status(200).send("OK");
});

router.post("/create_comment", (req, res) => {
    createComment(req.body);
    res.status(200).send("OK");
});

router.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    executeQuery(
    `SELECT * FROM public.user WHERE username='${username}' AND password='${password}';`,
    undefined,
    (queryResult: string) => {
        if (queryResult.length > 0) {
            const user = {name: username};
            const accessToken = sign(user, secret);
            res.send({ accessToken }); // bug!!! Error: Cannot set headers after they are sent to the client
            return;
        }
        res.status(401).send("Login failed - try again...");
    });
});

router.post("/test_auth", (req: any, res) => { // fix any!!!!!!
    console.log("in server /test_auth");
    console.log(req.username);
})

const port = process.env.PORT || 5000;
router.listen(port, () => console.log(`Listening on port ${port}...`));

// TODO:
// - validation - protect against SQL injection
// - send sucsess/error response
// - catch error!
// - change "execute query" name to include sending data
// - swap "res.status().send" for "res.sendStatus"