import { Client, QueryResult } from "pg";
import { IUser, ITaskToUser, IExtendProject, IExtendTask } from "./interfaces";
import { JwtPayload } from "jsonwebtoken";

const dbClient = new Client({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "pass123",
    database: "final_project__task_manager"
});

dbClient.connect();

const executeQuery = (query: string, next: Function) => {
    const dbClient = new Client({
        host: "localhost",
        user: "postgres",
        port: 5432,
        password: "pass123",
        database: "final_project__task_manager"
    });
    dbClient.connect();

    dbClient.query(query)
        .then(result => next(result.rows))
        .catch(err => { throw new Error("DB error: " + err.message) })
        .finally(() => dbClient.end());
}

const checkUsernamePassword = (username: string, password: string, next: Function) => {
    const query = `SELECT * FROM public.user WHERE username='${username}' AND password='${password}';`
    executeQuery(query, (userRows: IUser[]) => next(userRows.length > 0));
}

const checkIsAdmin = (username: string | JwtPayload | undefined, next: Function) => {
    // See comment in server file
    const query = `SELECT "isAdmin" FROM public.user WHERE username='${username}';`
    executeQuery(query, (userRows: IUser[]) => next(userRows[0].isAdmin));
}

const checkIsLeaderOfTask = (username: string, taskId: string, next: Function) => {
    const query = `SELECT * FROM public.task_to_user 
                    WHERE "userId"=(SELECT id FROM public.user WHERE username='${username}')
                     AND "taskId"=${taskId};`;
    executeQuery(query, (taskToUserRows: ITaskToUser[]) => next(taskToUserRows.length > 0));
}

const getProjects = (username: string, isAdmin: boolean, next: Function) => {
    const query =
     isAdmin ? `SELECT * FROM public.project;` // An admin gets all the projects
     : `SELECT DISTINCT ON ("projectId") "projectId" AS id, title, description, status FROM project
            INNER JOIN project_to_user ON project.id=project_to_user."projectId"
            INNER JOIN "user" ON project_to_user."userId"="user".id
            WHERE username='${username}';`; // A regular user gets only his projects
    executeQuery(query, next);
}

const getUsers = (next: Function) => {
    const query = `SELECT username FROM public.user;`;
    executeQuery(query, next);
}

const getTasksForProject = (projectId: string, next: Function) => {
    const query = `SELECT * FROM public.task WHERE "projectId"=${projectId};`;
    executeQuery(query, next);
}

const createProject = ({ title, description, team, status}: IExtendProject, next: Function) => {
    const query =
     `WITH project_id_set AS (
        INSERT INTO public.project(title, description, status)
        VALUES('${title}', '${description}', '${status}')
        RETURNING id
     )
     INSERT INTO public.project_to_user("projectId", "userId")
     VALUES ${
        team.map(
            username => `((SELECT id FROM project_id_set), (SELECT id FROM public.user WHERE username='${username}'))`
        ).join(", ")
     };`;
    console.log(query);
    executeQuery(query, next);
}

const createTask = ({ projectId, title, description, leaders, links, startDate, endDate, tags, status }: IExtendTask, 
    next: Function) => {
    // executeQuery(`INSERT INTO public.task("projectId", title, description, "startDate", "endDate", tags, links, status)
    // VALUES (${projectId}, '${title}', '${description}', '${startDate}', '${endDate}', Array[${
    //     tags.map(tagStr => "'" + tagStr + "'")
    // }], Array[${
    //     links.map(linkStr => "'" + linkStr + "'")
    // }], '${status}') RETURNING id;`, undefined, (taskIdRows: any[]) => { // fix any!!!!!!!!!!!1
    //     leaders.forEach((leader) => {
    //         executeQuery(`INSERT INTO public.task_to_user("taskId", "userId") VALUES (${taskIdRows[0].id},
    //         (SELECT id FROM public.user WHERE username='${leader.username}'));`)
    //     });
    // });
    const query =
    `WITH task_id_set AS (
       INSERT INTO public.task("projectId", title, description, "startDate", "endDate", tags, links, status)
       VALUES(${projectId}, '${title}',  '${description}', '${status}')
       RETURNING id
    )
    INSERT INTO public.project_to_user("projectId", "userId")
    VALUES ${
       team.map(
           username => `((SELECT id FROM project_id_set), (SELECT id FROM public.user WHERE username='${username}'))`
       ).join(", ") //DEBUUUUUUUUUG!!!!!!!!!!
    };`;
}

// const createComment = ({ taskId, title, content }: {taskId: number, title: string, content: string}) => {
//     executeQuery(`INSERT INTO public.comment("taskId", title, content) VALUES (${taskId}, '${title}', '${content}');`);
// }

export { checkUsernamePassword, checkIsAdmin, checkIsLeaderOfTask, getProjects, createProject,
getUsers, getTasksForProject }
// , createProject, createTask, createComment };

// TODO:
// - Catch errors