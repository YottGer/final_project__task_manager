import express, { json, Request, Response } from "express";
import { JwtPayload, sign, verify, VerifyCallback } from "jsonwebtoken";
const cors = require("cors"); // import doesn't work
import { checkUsernamePassword, checkIsAdmin, checkIsLeaderOfTask, getProjects, createProject,
getUsers, getTasksForProject } from "./dbFunctions";
// , createProject, createTask, createComment } from "./dbFunctions";
import { IProject, ITask, IUser } from "./interfaces";

const secret = "b6506e25c723b2327383c15ed6342a320857cf16035460504f09d1ee92f392846ce9ffecd8c5215f19593f452f4cfaa6d6ed6bd97a700ba7f3ba4dcfa5ab6444";
const refreshSecret = "411c3b1fb19ca25127a3360a266feaa84312f05ddb1627e82aa27e3b7a7ddf7e8872b0f95a2fe7877bc753570af30d324f3410bbd64bd05f7771ae1316db32ab";
//TODO: hide the secretes in another file
//TODO: use refresh token

const autherizeToken = (req: Request, res: Response, next: Function) => {
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
        checkIsAdmin(username, (isAdmin: boolean) => {
            Object.assign(req, { isAdmin: isAdmin } );
            next();
        });
    })
}

const autherizeTokenIfNotLoginMiddleware = (req: Request, res: Response, next: Function) => {
    if (req.path !== "/login")
        return autherizeToken(req, res, next);
    next();

}

const isLeaderOfTaskMiddleware = (req: any, res: Response, next: Function) => { 
    // Couldn't understand how to reduce the type of req
    const username = req.username;
    const taskId = req.params.taskId;
    checkIsLeaderOfTask(username, taskId, (isLeader: boolean) => {
        Object.assign(req, { isLeader: isLeader });
        next();
    });
}

const router = express();

// middlewares
router.use(json());
router.use(cors());
router.use(autherizeTokenIfNotLoginMiddleware);
// //router.use("/project/:projectId/tasks", autherizeToken);
// // router.use("/task/:taskId", autherizeToken);
// // router.use("/task/:taskId/comments", autherizeToken);
// router.use("/create_project", autherizeToken);
// // router.use("/create_task", autherizeToken);
// // router.use("/create_comment", autherizeToken);
// router.use("/project/:projectId/update", autherizeToken);
// // router.use("/task/:taskId/update", autherizeToken); // leave that here?!!?!?

// routes
router.get("/projects", (req: any, res) => { // See comment in isLeaderOfTaskMiddleware
    const { username, isAdmin } = req;
    getProjects(username, isAdmin, (projectRows: IProject[]) => res.status(200).send(projectRows));
})

router.get("/project/:projectId", (req: Request, res: Response) => {
    // executeQuery(`SELECT * FROM public.project WHERE id=${req.params.projectId};`, undefined, (projectRows: any[]) => {
    //     // fix any!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    //     executeQuery(`SELECT "userId" FROM public.project_to_user WHERE "projectId"=${req.params.projectId};`,
    //     undefined, (userRows: any[]) => { // fix any!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    //         if (userRows.map((userIdRow: any) => userIdRow.userId).filter(item => item !== null).length === 0) {
    //             // fix that!!!!!!!!!!!!!!!!!! yakkkkkkkkkkkkkkkkkkkkkkkk
    //             res.send({ ...projectRows[0], team: [] });
    //         }

    //         else {
    //             executeQuery(`SELECT username FROM public.user WHERE id IN (${
    //                 (userRows.map((userIdRow: any) => userIdRow.userId).filter(item => item !== null).toString()) // fix any!!!!!!!!!!
    //             });`, undefined, (usernameRows: any[]) => { // fix any!!!!!!!!!!!!!!!
    //                 // fix that!!!!!!!!!!!!!!!!!! yakkkkkkkkkkkkkkkkkkkkkkkk
    //                 res.send({ ...projectRows[0], team: usernameRows })
    //             }) 
    //         }
                
    //     })
    // })
});

router.get("/project/:projectId/tasks", (req, res) => {
    getTasksForProject(req.params.projectId, (taskRows: ITask[]) => res.status(200).send(taskRows));
}); // DEBUUUUUUUUUUUUUUUUUUUUUUG!!!

// router.get("/task/:taskId", (req, res) => {
//     executeQuery(`SELECT * FROM public.task WHERE id=${req.params.taskId};`, undefined, (taskRows: any[]) => {
//         // fix any!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//         executeQuery(`SELECT "userId" FROM public.task_to_user WHERE "taskId"=${req.params.taskId};`,
//         undefined, (userRows: any[]) => { // fix any!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//             if (userRows.map((userIdRow: any) => userIdRow.userId).filter(item => item !== null).length === 0) {
//                 // fix that!!!!!!!!!!!!!!!!!! yakkkkkkkkkkkkkkkkkkkkkkkk
//                 res.send({ ...taskRows[0], leaders: [] });
//             }

//             else {
//                 executeQuery(`SELECT username FROM public.user WHERE id IN (${
//                     (userRows.map((userIdRow: any) => userIdRow.userId).filter(item => item !== null).toString()) // fix any!!!!!!!!!!
//                 });`, undefined, (usernameRows: any[]) => { // fix any!!!!!!!!!!!!!!!
//                     // fix that!!!!!!!!!!!!!!!!!! yakkkkkkkkkkkkkkkkkkkkkkkk
//                     res.send({ ...taskRows[0], leaders: usernameRows })
//                 }) 
//             }
                
//         })
//     })
// });

// router.get("/task/:taskId/comments", (req, res) => {
//     executeQuery(`SELECT * FROM public.comment WHERE "taskId"=${req.params.taskId};`, res);
// });

router.get("/users", (req, res) => {
    getUsers((userRows: IUser[]) => res.status(200).send(userRows));
});

// router.get("/project/:projectId/team", (req, res) => {
//     executeQuery(`SELECT DISTINCT ON (username) username FROM public.project
//                     INNER JOIN public.project_to_user ON project.id=project_to_user."projectId"
//                     INNER JOIN public.user ON project_to_user."userId"="user".id
//                     WHERE "projectId"=${req.params.projectId};`, res);
// });

router.post("/login", (req: Request, res: Response) => {
    const { username, password } = req.body;
    checkUsernamePassword(username, password, (isUsernamePassword: boolean) => {
        if (isUsernamePassword)
            return res.status(200).send({ accessToken: sign(username, secret), username });
        return res.status(401).send("Login failure");
    })
});

router.post("/create_project", (req: any, res: Response) => { // See comment in isLeaderOfTaskMiddleware
    const isAdmin = req.isAdmin;
    if (isAdmin)
        createProject(req.body, () => res.sendStatus(200));
    else
        res.status(401).send("Must be admin to create project!");
});

router.post("/create_task", (req, res) => {
    createTask(req.body, () => res.sendStatus(200));
});

// router.post("/create_comment", (req, res) => {
//     createComment(req.body);
//     res.status(200).send("OK");
// });

// router.put("/project/:projectId/update", (req: any, res: Response) => { // fix any!!!
//     if (req.isAdmin) {
//         const reducedBody: any = Object.fromEntries(Object.entries(req.body).filter(([_, val]: any[]) => val && val.length));
//         // fix anys!!!!!!!!!!!!!!!
//         Object.keys(reducedBody).forEach((key: string) => {
//             if (key === "team") {
//                 executeQuery(`DELETE * FROM public.project_to_user WHERE "projectId"=${req.params.projectId};`);
//                 reducedBody.team.forEach((user: {username: string}) => {
//                     executeQuery(`INSERT INTO public.project_to_user("projectId", "userId")
//                         VALUES (${req.params.projectId}, (SELECT id FROM public."user" WHERE username='${user.username}'));`);
//                 });
//             }
//             else {
//                 console.log(`UPDATE public.project SET ${key}='${reducedBody[key]}' WHERE id=${req.params.projectId};`)
//                 executeQuery(`UPDATE public.project SET ${key}='${reducedBody[key]}' WHERE id=${req.params.projectId};`);
//             }
//         });
//         res.status(200).send("OK");
//     } else
//         res.sendStatus(401); // runtime error at the client - see create project's case!!!!!!!!!
// });

// router.put("/task/:taskId/update", autherizeToken, isLeaderOfTaskMiddleware, (req: any, res) => { // fix any!!!!!!!!!!
//     console.log(req.isAdmin, req.username, "isLeader: " + req.isLeader);
//     console.log("body", req.body);
//     const reducedBody: any = 
//      req.isAdmin ? 
//         Object.fromEntries(Object.entries(req.body).filter(([_, val]: any[]) => val && val.length))
//      :
//         (req.isLeader ?
//             Object.fromEntries(Object.entries(req.body).filter(([key, val]: any[]) =>
//              val && val.length && ["title", "description", "status"].includes(key)))
//         :
//             {}
//         );
//     // fix anys!!!!!!!!!!!!!!!
//     // notify client about his permissions!!!!!!!!!!!!!
//     console.log("reduced", reducedBody);
//     Object.keys(reducedBody).forEach((key: string) => {
//         console.log("in foreach loop");
//         if (key === "leaders") {
//             console.log(`DELETE FROM public.task_to_user WHERE "taskId"=${req.params.taskId};`);
//             executeQuery(`DELETE FROM public.task_to_user WHERE "taskId"=${req.params.taskId};`);
//             reducedBody.leaders.forEach((user: {username: string}) => {
//                 console.log(`INSERT INTO public.task_to_user("taskId", "userId")
//                 VALUES (${req.params.taskId}, (SELECT id FROM public."user" WHERE username='${user.username}'));`);
//                 executeQuery(`INSERT INTO public.task_to_user("taskId", "userId")
//                     VALUES (${req.params.taskId}, (SELECT id FROM public."user" WHERE username='${user.username}'));`);
//             });
//         }
//         else if (key === "tags" || key === "links") {
//             console.log(`UPDATE public.task SET ${key}=Array[${
//                 reducedBody[key].map((str: string) => "'" + str + "'")
//             }] WHERE id=${req.params.taskId};`);
//             executeQuery(`UPDATE public.task SET ${key}=Array[${
//                 reducedBody[key].map((str: string) => "'" + str + "'")
//             }] WHERE id=${req.params.taskId};`);
//         }
//         else {
//             console.log(`UPDATE public.task SET "${key}"='${reducedBody[key]}' WHERE id=${req.params.taskId};`);
//             executeQuery(`UPDATE public.task SET "${key}"='${reducedBody[key]}' WHERE id=${req.params.taskId};`);
//         }
//     });
//     res.status(200).send("OK");
// });

const port = process.env.PORT || 5000;
router.listen(port, () => console.log(`Listening on port ${port}...`));

// TODO:
// - validation - protect against SQL injection
// - send sucsess/error response
// - catch error!
// - change "execute query" name to include sending data
// - swap "res.status().send" for "res.sendStatus"
// - handle code repetition between project details and task details (db accessing)