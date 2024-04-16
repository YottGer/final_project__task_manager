import dotenv from "dotenv";
dotenv.config({path: "../.env"});
import express, { json, Request, Response } from "express";
import { sign, verify } from "jsonwebtoken";
const cors = require("cors"); // import doesn't work, so I have to use require()
import dbAccess from "./dbAccess";
import { IProjectInDB, IProjectForClient, ITaskInDB, ITaskForClient, IUser, IExtendComment } from "./interfaces";

const secret = process.env.ACCESS_TOKEN_SECRET ?? "";
const refreshSecret = process.env.REFRESH_TOKEN_SECRET; //How should I use a refresh token?

const db = new dbAccess();

const wrapperMiddleware = (req: Request, res: Response, next: Function) => {
    if (req.path !== "/login")
        return autherizeTokenMiddleware(req, res, next);
    next();
}

const baseValdiationMiddleware = (req: Request, res: Response, next: Function) => {
    // This is a basic validation middleware, that is meant to prevent SQL injection attacks
    if (Object.values(req.body).join("").includes("'"))
        return res.status(409).send("Invalid charcater!");
    next();
}

const autherizeTokenMiddleware = (req: Request, res: Response, next: Function) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(' ')[1]; // (Authorization: )Bearer <token>
    if (!token) return res.status(401).send("Access token in empty");
    verify(token, secret, (err, usernameObj: any) => {
        // I couldn't figure out how to reduce the type of usernameObj
        if (err) return res.status(403).send("Access token verification failed: " + err.message);
        Object.assign(req, { username: usernameObj?.username }); // That is how I pass data to the next callback
        db.checkIsAdmin(usernameObj?.username, (isAdmin: boolean) => {
            Object.assign(req, { isAdmin: isAdmin } );
            next();
        });
    })
}

const areClientAndLeadersTeamMembersOfProject = (req: any, res: Response, next: Function) => { 
    // See comment in isLeaderOfTaskMiddleware
    // First, I check whether the creator is a team member of the project
    const username = req.username;
    const projectId = req.params.projectId;
    db.checkAreTeamMembersOfProject([username], projectId, (isClientTeamMember: boolean) => {
        Object.assign(req, { isClientTeamMember: isClientTeamMember });
        // Now I check whether the leaders are team members
        db.checkAreTeamMembersOfProject(req.body.leaders ?? [], projectId, (areLeadersTeamMembers: boolean) => {
            Object.assign(req, { areLeadersTeamMembers: areLeadersTeamMembers });
            next();
        })
    });
}

const isLeaderOfTaskMiddleware = (req: any, res: Response, next: Function) => { 
    /* Couldn't understand how to reduce the type of req
     * (it can't be Request, because I add properties such as username and isAdmin)
    */
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
                { accessToken: sign({ username }, secret, { expiresIn: "30m" }), username, isAdmin }
            )})
        return res.status(401).send("Login failure");
    })
});

router.post("/create_project", baseValdiationMiddleware, (req: any, res) => { // See comment in isLeaderOfTaskMiddleware
    const isAdmin = req.isAdmin;
    if (isAdmin) {
        if (req.body.team.length > 0)
            db.createProject(req.body, () => res.sendStatus(200));
        else
            res.status(400).send("Team mustn't be empty!");
    } else
        res.status(401).send("Must be an admin to create project!");
});

router.post("/project/:projectId/create_task", baseValdiationMiddleware, areClientAndLeadersTeamMembersOfProject,
 (req: any, res) => {
    // See comment in isLeaderOfTaskMiddleware
    const inputNotEmpty = req.body.leaders.length > 0 && req.body.tags.length > 0 && req.body.links.length > 0;
    if (inputNotEmpty) {
        if (req.isClientTeamMember || req.isAdmin) {
            if (req.areLeadersTeamMembers)
                db.createTask(req.params.projectId, req.body, () => res.sendStatus(200));
            else
                res.status(400).send("Leaders must be team members of the project!");
        }
        else
            res.sendStatus(403);
    }
    else
        res.status(400).send("Leaders and tags mustn't be empty!");
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

router.put("/project/:projectId/task/:taskId/update", baseValdiationMiddleware, isLeaderOfTaskMiddleware,
 areClientAndLeadersTeamMembersOfProject, (req: any, res) => {
    // See comment in isLeaderOfTaskMiddleware
    if (req.isAdmin) {
        if (req.body.leaders.length === 0 || req.areLeadersTeamMembers)
            db.updateTask(req.params.taskId, req.body, () => res.sendStatus(200));
        else
        res.status(400).send("Leaders must be team members of the project!");
    }
    else if (req.isLeader)
        db.updateTask(req.params.taskId, {
            ...req.body, startDate: "", endDate: "", tags: [], links: [], leaders: []
        }, () => res.sendStatus(200));
    else
        res.status(403).send("Unauthorized - nothing updated!");
});

router.use((err: Error, req: Request, res: Response, next: Function) => {
    console.error(err.stack);
    res.status(500).send(err.message);
});

const port = 5000;
router.listen(port, () => console.log(`Listening on port ${port}...`));