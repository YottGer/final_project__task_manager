import { Client, QueryResult } from "pg";
import { IUser, ITaskToUser, IExtendProject, IExtendTask, IComment } from "./interfaces";
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
        console.log(query);
        this.dbClient.query(query)
            .then(result => next(result.rows))
            .catch(err => { throw new Error("DB error: " + err.message) })
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
        this.executeQuery(query, (projectRows: IExtendProject[]) => next(projectRows[0]));
    }
    
    public getTasksForProject(projectId: string, next: Function) {
        const query = `SELECT * FROM task WHERE "projectId"=${projectId};`;
        this.executeQuery(query, next);
    }

    public getTaskWithLeaders(taskId: string, next: Function) {
        const query = `
            SELECT 
            *,
            ARRAY (
                SELECT "username" 
                FROM task_to_user
                INNER JOIN "user" ON task_to_user."userId"="user".id
                WHERE "taskId"=${taskId}
            ) AS leaders
            FROM task WHERE id=${taskId};
        `;
        this.executeQuery(query, (taskRows: IExtendTask[]) => next(taskRows[0]));
    }

    public getCommentsForTask(taskId: string, next: Function) {
        const query = `SELECT * FROM comment WHERE "taskId"=${taskId}`;
        this.executeQuery(query, next);
    }
    
    public createProject({ title, description, team, status}: IExtendProject, next: Function) {
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
        { projectId, title, description, leaders, links, startDate, endDate, tags, status }: IExtendTask, 
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
        //executeQuery(`INSERT INTO comment("taskId", title, content) VALUES (${taskId}, '${title}', '${content}');`);
        const query = `INSERT INTO comment("taskId", title, content) VALUES (${taskId}, '${title}', '${content}');`;
        this.executeQuery(query, next);
    }
}


export default dbAccess;

// TODO:
// - Catch errors