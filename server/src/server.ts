import express, { json, Request, Response } from "express";
import { JwtPayload, sign, verify, VerifyCallback } from "jsonwebtoken";
const cors = require("cors"); // import doesn't work, so I have to use require()
import dbAccess from "./dbAccess";
import { IProjectInDB, IProjectForClient, ITaskInDB, ITaskForClient, IUser, IExtendComment } from "./interfaces";

const secret = "b6506e25c723b2327383c15ed6342a320857cf16035460504f09d1ee92f392846ce9ffecd8c5215f19593f452f4cfaa6d6ed6bd97a700ba7f3ba4dcfa5ab6444";
const refreshSecret = "411c3b1fb19ca25127a3360a266feaa84312f05ddb1627e82aa27e3b7a7ddf7e8872b0f95a2fe7877bc753570af30d324f3410bbd64bd05f7771ae1316db32ab";
//TODO: Hide the secretes in a .env file
//TODO: Use refresh token

const db = new dbAccess();

const wrapperMiddleware = (req: Request, res: Response, next: Function) => {
    if (req.path !== "/login")
        return autherizeTokenMiddleware(req, res, next);
    next();
}

const baseValdiationMiddleware = (req: Request, res: Response, next: Function) => {
    // This is a basic validation middleware, that is meant to prevent SQL injection attacks
    console.log("got to validation middleware");
    if (Object.values(req.body).includes("'"))
        return res.status(409).send("Invalid charcater!");
    next();
}

const autherizeTokenMiddleware = (req: Request, res: Response, next: Function) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(' ')[1]; // (Authorization: )Bearer <token>
    if (!token) return res.sendStatus(401);
    verify(token, secret, (err, username) => {
        /*
         * Problem: I am not sure whether or not username is a string
         * or an object of the form { username: string, iat: number }
        */
        if (err) return res.status(403).send("Access token verification failed: " + err.message);
        Object.assign(req, { username: username }); // That is how I pass data to the next callback
        db.checkIsAdmin(username, (isAdmin: boolean) => {
            Object.assign(req, { isAdmin: isAdmin } );
            next();
        });
    })
}

const isLeaderOfTaskMiddleware = (req: any, res: Response, next: Function) => { 
    // Couldn't understand how to reduce the type of req
    const username = req.username;
    const taskId = req.params.taskId;
    db.checkIsLeaderOfTask(username, taskId, (isLeader: boolean) => {
        Object.assign(req, { isLeader: isLeader });
        next();
    });
}

const router = express();

// middlewares
router.use(json());
router.use(cors());
router.use(wrapperMiddleware);
router.use("/project/:projectId/task/:taskId/update", isLeaderOfTaskMiddleware);

// routes
router.get("/users", (req, res) => {
    db.getUsers((userRows: IUser[]) => res.status(200).send(userRows));
});

router.get("/projects", (req: any, res) => { // See comment in isLeaderOfTaskMiddleware
    const { username, isAdmin } = req;
    db.getProjects(username, isAdmin, (projectRows: IProjectInDB[]) => res.status(200).send(projectRows));
})

router.get("/project/:projectId", (req, res) => {
    const projectId = req.params.projectId;
    db.getProjectWithTeam(projectId, (project: IProjectForClient) => res.status(200).send(project));
});

router.get("/project/:projectId/team", (req, res) => {
    db.getTeam(req.params.projectId, (usernameObjRows: { username: string }) => res.status(200).send(usernameObjRows));
});

router.get("/project/:projectId/tasks", (req, res) => {
    db.getTasksForProject(req.params.projectId, (taskRows: ITaskInDB[]) => res.status(200).send(taskRows));
});

router.get("/project/:projectId/task/:taskId", (req, res) => {
    const taskId = req.params.taskId;
    db.getTaskWithLeaders(taskId, (task: ITaskForClient) => res.status(200).send(task));
});

router.get("/project/:projectId/task/:taskId/comments", (req, res) => {
    const taskId = req.params.taskId;
    db.getCommentsForTask(taskId, (comments: IExtendComment[]) => res.status(200).send(comments));

});

router.post("/login", baseValdiationMiddleware, (req, res) => {
    const { username, password } = req.body;
    db.checkUsernamePassword(username, password, (isUsernamePassword: boolean) => {
        if (isUsernamePassword)
            return db.checkIsAdmin(username, (isAdmin: boolean) => {res.status(200).send(
                { accessToken: sign(username, secret), username, isAdmin }
            )})
        return res.status(401).send("Login failure");
    })
});

router.post("/create_project", baseValdiationMiddleware, (req: any, res) => { // See comment in isLeaderOfTaskMiddleware
    const isAdmin = req.isAdmin;
    if (isAdmin)
    db.createProject(req.body, () => res.sendStatus(200));
    else
        res.status(401).send("Must be admin to create project!");
});

router.post("/project/:projectId/create_task", baseValdiationMiddleware, (req, res) => {
    db.createTask(req.params.projectId, req.body, () => res.sendStatus(200));
});

router.post("/create_comment", baseValdiationMiddleware, (req, res) => {
    db.createComment(req.body, () => res.sendStatus(200));
});

router.put("/project/:projectId/update", baseValdiationMiddleware, (req: any, res) => { // See comment in isLeaderOfTaskMiddleware
    if (req.isAdmin)
        db.updateProject(req.params.projectId, req.body, () => res.sendStatus(200));
    else
        res.status(403).send("Unauthorized - nothing updated!");
});

router.put("/project/:projectId/task/:taskId/update", baseValdiationMiddleware, isLeaderOfTaskMiddleware, (req: any, res) => { // See comment in isLeaderOfTaskMiddleware
    if (req.isAdmin)
        db.updateTask(req.params.taskId, req.body, () => res.sendStatus(200));
    else if (req.isLeader)
        db.updateTask(req.params.taskId, {
            ...req.body, startDate: "", endDate: "", tags: [], links: [], leaders: []
        }, () => res.sendStatus(200));
    else
        res.status(403).send("Unauthorized - nothing updated!");
});

const port = process.env.PORT || 5000;
router.listen(port, () => console.log(`Listening on port ${port}...`));

// TODO: Catch errors!