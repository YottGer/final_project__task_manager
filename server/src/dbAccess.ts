import { Client, QueryResult } from "pg";
import { IUser, ITaskToUser, IProjectFromClient, IProjectForClient, ITaskFromClient,
    ITaskForClient, IComment } from "./interfaces";
import { JwtPayload } from "jsonwebtoken";

class dbAccess {

    private dbClient: Client;

    public constructor() {
        this.dbClient = new Client({
            host: "localhost",
            user: "postgres",
            port: 5432,
            password: "pass123",
            database: "final_project__task_manager"
        });
        
        this.dbClient.connect();
    }
    
    public executeQuery(query: string, next: Function) {
        this.dbClient.query(query)
            .then(result => next(result.rows))
    }   
    
    public checkUsernamePassword(username: string, password: string, next: Function) {
        const query = `SELECT * FROM "user" WHERE username='${username}' AND password='${password}';`
        this.executeQuery(query, (userRows: IUser[]) => next(userRows.length > 0));
    }
    
    public checkIsAdmin(username: string | JwtPayload | undefined, next: Function) {
        // See comment in server file
        const query = `SELECT "isAdmin" FROM "user" WHERE username='${username}';`
        this.executeQuery(query, (userRows: IUser[]) => next(userRows[0].isAdmin));
    }

    public checkAreTeamMembersOfProject(usernames: string[], projectId: string, next: Function) {
        const query = `SELECT username FROM project_to_user
                        INNER JOIN "user" ON "project_to_user"."userId"="user"."id"
                         WHERE "projectId"=${projectId};`;
        this.executeQuery(query, (usernameObjs: { username: string }[]) => next(
            !usernames.some(username => usernameObjs.map(usernameObj => usernameObj.username).indexOf(username) === -1)
        ));
    }
    
    public checkIsLeaderOfTask(username: string, taskId: string, next: Function) {
        const query = `SELECT * FROM task_to_user 
                        WHERE "userId"=(SELECT id FROM "user" WHERE username='${username}')
                         AND "taskId"=${taskId};`;
        this.executeQuery(query, (taskToUserRows: ITaskToUser[]) => next(taskToUserRows.length > 0));
    }

    public getUsers(next: Function) {
        const query = `SELECT username FROM "user";`;
        this.executeQuery(query, next);
    }
    
    public getProjects(username: string, isAdmin: boolean, next: Function) {
        const query =
         isAdmin ? `SELECT * FROM project;` // An admin gets all the projects
         : `SELECT DISTINCT ON ("projectId") "projectId" AS id, title, description, status FROM project
                INNER JOIN project_to_user ON project.id=project_to_user."projectId"
                INNER JOIN "user" ON project_to_user."userId"="user".id
                WHERE username='${username}';`; // A regular user gets only his projects
        this.executeQuery(query, next);
    }
    
    public getProjectWithTeam(projectId: string, next: Function) {
        const query = `
            SELECT 
            *,
            ARRAY (
                SELECT "username" 
                FROM project_to_user
                INNER JOIN "user" ON project_to_user."userId"="user".id
                WHERE "projectId"=${projectId}
            ) AS team
            FROM project WHERE id=${projectId};
        `;
        this.executeQuery(query, (projectRows: IProjectForClient[]) => next(projectRows[0]));
    }

    public getTeam(projectId: string, next: Function) {
        const query = `
            SELECT DISTINCT ON (username) username FROM project
            INNER JOIN project_to_user ON project.id=project_to_user."projectId"
            INNER JOIN "user" ON project_to_user."userId"="user".id
            WHERE "projectId"=${projectId};
        `;
        this.executeQuery(query, next);
    }
    
    public getTasksForProject(projectId: string, next: Function) {
        const query = `SELECT * FROM task WHERE "projectId"=${projectId};`;
        this.executeQuery(query, next);
    }

    public getTaskWithLeaders(taskId: string, next: Function) {
        const query = `
            SELECT 
            id, "projectId", title, description, tags,
            to_char("startDate", 'DD-MM-YYYY') AS "startDate",
            to_char("endDate", 'DD-MM-YYYY') AS "endDate",
            tags, links, status,
            ARRAY (
                SELECT "username" 
                FROM task_to_user
                INNER JOIN "user" ON task_to_user."userId"="user".id
                WHERE "taskId"=${taskId}
            ) AS leaders
            FROM task WHERE id=${taskId};
        `;
        this.executeQuery(query, (taskRows: ITaskForClient[]) => next(taskRows[0]));
    }

    public getCommentsForTask(taskId: string, next: Function) {
        const query = `SELECT * FROM comment WHERE "taskId"=${taskId}`;
        this.executeQuery(query, next);
    }
    
    public createProject({ title, description, team, status}: IProjectFromClient, next: Function) {
        const query =
         `WITH project_id_set AS (
            INSERT INTO project(title, description, status)
            VALUES('${title}', '${description}', '${status}')
            RETURNING id
         )
         INSERT INTO project_to_user("projectId", "userId")
         VALUES ${
            team.map(
                username => `((SELECT id FROM project_id_set), (SELECT id FROM "user" WHERE username='${username}'))`
            ).join(", ")
         };`;
        this.executeQuery(query, next);
    }
    
    public createTask(
        projectId: string,
        { title, description, leaders, links, startDate, endDate, tags, status }: ITaskFromClient, 
        next: Function
    ) {
        const query =
        `WITH task_id_set AS (
           INSERT INTO task("projectId", title, description, "startDate", "endDate", tags, links, status)
           VALUES(${projectId}, '${title}',  '${description}', '${startDate}', '${endDate}', Array[${
                 tags.map(tagStr => "'" + tagStr + "'")
            }], Array[${
                 links.map(linkStr => "'" + linkStr + "'")
            }], '${status}')
           RETURNING id
        )
        INSERT INTO task_to_user("taskId", "userId")
        VALUES ${
           leaders.map(
               username => `((SELECT id FROM task_id_set), (SELECT id FROM "user" WHERE username='${username}'))`
           ).join(", ")
        };`;
        this.executeQuery(query, next);
    }

    public createComment ({ taskId, title, content }: IComment, next: Function) {
        const query = `INSERT INTO comment("taskId", title, content) VALUES (${taskId}, '${title}', '${content}');`;
        this.executeQuery(query, next);
    }

    public updateProject(projectId: string, project: IProjectFromClient, next: Function) {
        let query = "";
        for (const [key, val] of Object.entries(project)) {
            if (val.length > 0) { // Handle the non-empty values except for id
                if (key === "team") {
                    query += `DELETE FROM project_to_user WHERE "projectId"=${projectId};`
                    query +=`
                        INSERT INTO project_to_user("projectId", "userId")
                        VALUES ${
                        project.team.map(
                            username => `(${projectId}, (SELECT id FROM "user" WHERE username='${username}'))`
                        ).join(", ")
                        };
                    `;
                } else {
                    query += `UPDATE project SET ${key}='${val}' WHERE id=${projectId};`;
                }
            }
        }
        this.executeQuery(query, next);
    }

    public updateTask(taskId: string, task: ITaskFromClient, next: Function) {
        let query = "";
        for (const [key, val] of Object.entries(task)) {
            if (val.length > 0) { // Handle the non-empty values except for id
                if (key === "leaders") {
                    query += `DELETE FROM task_to_user WHERE "taskId"=${taskId};`
                    query +=`
                        INSERT INTO task_to_user("taskId", "userId")
                        VALUES ${
                        task.leaders.map(
                            username => `(${taskId}, (SELECT id FROM "user" WHERE username='${username}'))`
                        ).join(", ")
                        };
                    `;
                } else if (key === "links" || key === "tags") {
                    query += `
                        UPDATE task SET ${key}=Array[${
                        task[key].map((str: string) => "'" + str + "'")
                        }] WHERE id=${taskId};
                    `;
                } else {
                    query += `UPDATE task SET "${key}"='${val}' WHERE id=${taskId};`;
                }
            }
        }
        this.executeQuery(query, next);
    }
}


export default dbAccess;