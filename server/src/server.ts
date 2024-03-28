import express, { json, Request, Response } from "express";
import { sign, verify } from "jsonwebtoken";
const cors = require("cors"); // import doesn't work

import { executeQuery, createProject, createTask, createComment } from "./dbFunctions";

const secret = "b6506e25c723b2327383c15ed6342a320857cf16035460504f09d1ee92f392846ce9ffecd8c5215f19593f452f4cfaa6d6ed6bd97a700ba7f3ba4dcfa5ab6444";
const refreshSecret = "411c3b1fb19ca25127a3360a266feaa84312f05ddb1627e82aa27e3b7a7ddf7e8872b0f95a2fe7877bc753570af30d324f3410bbd64bd05f7771ae1316db32ab";
//TODO: hide the secretes in another file
//TODO: use refresh token

const autherizeToken = (req: Request, res: Response, next: Function) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(' ')[1]; // (Authorization: )Bearer <token>
    console.log("in middlewar before vefiry");
    console.log("token: ", token);
    if (!token) return res.sendStatus(401);
    verify(token, secret, (err, user: any) => { // fix any!!!!
        console.log(err)
        // if (err) return res.status(403).send("authorization failed. try again..."); // authorization failed
        // Why doesn't the above line work?!?!?!!?!??!!?!?!?
        console.log("in middleware");
        console.log(user);
        Object.assign(req, {username: user?.name});
        next();
    })
}

const router = express();

// middlewares
router.use(json());
router.use(cors());
router.use("/projects", autherizeToken);
//router.use("/project/:projectId/tasks", autherizeToken);
// router.use("/task/:taskId", autherizeToken);
// router.use("/task/:taskId/comments", autherizeToken);
router.use("/create_project", autherizeToken);
// router.use("/create_task", autherizeToken);
// router.use("/create_comment", autherizeToken);
router.use("/test_auth", autherizeToken);

// routes
router.get("/projects", (req, res) => {
    executeQuery("SELECT * FROM public.project;", res);
})

router.get("/project/:projectId", (req, res) => {
    executeQuery(`SELECT * FROM public.project WHERE id=${req.params.projectId};`, undefined, (projectRows: any[]) => {
        // fix any!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        executeQuery(`SELECT "userId" FROM public.project_to_user WHERE "projectId"=${req.params.projectId};`,
        undefined, (userRows: any[]) => { // fix any!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            if (userRows.map((userIdRow: any) => userIdRow.userId).filter(item => item !== null).length === 0) {
                // fix that!!!!!!!!!!!!!!!!!! yakkkkkkkkkkkkkkkkkkkkkkkk
                res.send({ ...projectRows[0], team: [] });
            }

            else {
                executeQuery(`SELECT username FROM public.user WHERE id IN (${
                    (userRows.map((userIdRow: any) => userIdRow.userId).filter(item => item !== null).toString()) // fix any!!!!!!!!!!
                });`, undefined, (usernameRows: any[]) => { // fix any!!!!!!!!!!!!!!!
                    // fix that!!!!!!!!!!!!!!!!!! yakkkkkkkkkkkkkkkkkkkkkkkk
                    res.send({ ...projectRows[0], team: usernameRows })
                }) 
            }
                
        })
    })
});

router.get("/project/:projectId/tasks", (req, res) => {
    executeQuery(`SELECT * FROM public.task WHERE "projectId"=${req.params.projectId};`, res);
})

router.get("/task/:taskId", (req, res) => {
    executeQuery(`SELECT * FROM public.task WHERE id=${req.params.taskId};`, undefined, (taskRows: any[]) => {
        // fix any!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        executeQuery(`SELECT "userId" FROM public.task_to_user WHERE "taskId"=${req.params.taskId};`,
        undefined, (userRows: any[]) => { // fix any!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            if (userRows.map((userIdRow: any) => userIdRow.userId).filter(item => item !== null).length === 0) {
                // fix that!!!!!!!!!!!!!!!!!! yakkkkkkkkkkkkkkkkkkkkkkkk
                res.send({ ...taskRows[0], leaders: [] });
            }

            else {
                executeQuery(`SELECT username FROM public.user WHERE id IN (${
                    (userRows.map((userIdRow: any) => userIdRow.userId).filter(item => item !== null).toString()) // fix any!!!!!!!!!!
                });`, undefined, (usernameRows: any[]) => { // fix any!!!!!!!!!!!!!!!
                    // fix that!!!!!!!!!!!!!!!!!! yakkkkkkkkkkkkkkkkkkkkkkkk
                    res.send({ ...taskRows[0], leaders: usernameRows })
                }) 
            }
                
        })
    })
});

router.get("/task/:taskId/comments", (req, res) => {
    executeQuery(`SELECT * FROM public.comment WHERE "taskId"=${req.params.taskId};`, res);
});

router.get("/users", (req, res) => {
    executeQuery("SELECT username FROM public.user;", res);
});

router.post("/create_project", (req: any, res) => { // fix any!!!!
    const username = req.username;
    console.log("in create project route");
    console.log(username);
    console.log(`SELECT "isAdmin" FROM public.user WHERE username='${username}';`);
    executeQuery(`SELECT "isAdmin" FROM public.user WHERE username='${username}';`, undefined, (userRows: any[]) => {
        // fix any!!!!!!!!!!!!!!!!!
        if (userRows[0].isAdmin)
            res.sendStatus(401);
        else {
            createProject(req.body);
            res.status(200).send("OK");
        }
    })
    // BUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUG
    // authentication makes the server crash!!!!!!!!!!!!!!!!!!!!!!
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
            res.send({ accessToken, username });
            return;
        }
        res.status(401).send("Login failed - try again...");
    });
});

router.post("/test_auth", (req: any, res) => { // fix any!!!!!!
    console.log("in server /test_auth");
    console.log(req.username);
});

router.patch("/:projectId/update_project_title", (req: Request, res: Response) => {
    executeQuery(`UPDATE public.project SET title='${req.body.title}' WHERE id=${req.params.projectId};`);
    res.status(200).send("OK");
});

const port = process.env.PORT || 5000;
router.listen(port, () => console.log(`Listening on port ${port}...`));

// TODO:
// - validation - protect against SQL injection
// - send sucsess/error response
// - catch error!
// - change "execute query" name to include sending data
// - swap "res.status().send" for "res.sendStatus"
// - handle code repetition between project details and task details (db accessing)