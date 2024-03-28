import { Client, QueryResult } from "pg";
import { Response } from "express";

const dbClient = new Client({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "pass123",
    database: "final_project__task_manager"
});

dbClient.connect();

const executeQuery = (query: string, response?: Response, next?: Function) => {
    dbClient.query(query, (err: Error, result: QueryResult): void => {
        // if (err) ...
        if (response) response.send(result.rows);
        if (next) next(result.rows);
    });

    dbClient.end;
}

const createProject = ({ title, description, team, status}:
     {title: string, description: string, team: {username: string}[], status: string }) => {
    executeQuery(`INSERT INTO public.project(title, description, status)
    VALUES ('${title}', '${description}', '${status}') RETURNING id;`, undefined, (idRows: {id: number}[]) => {
        team.forEach((user) => {
            executeQuery(`INSERT INTO public.project_to_user("projectId", "userId") VALUES (${idRows[0].id},
            (SELECT id FROM public.user WHERE username='${user.username}'));`)});
        });  
}

const createTask = ({ projectId, title, description, leaders, links, startDate, endDate, tags }:
    {projectId: number, title: string, description: string, leaders: any[], links: string[], startDate: string,
         endDate: string, tags: string[]}) => { // fix any!!!!!!!
    console.log(`INSERT INTO public.task("projectId", title, description, "startDate", "endDate", tags, links)
    VALUES (${projectId}, '${title}', '${description}', '${startDate}', '${endDate}', Array[${
        tags.map(tagStr => "'" + tagStr + "'")
    }], Array[${
        links.map(linkStr => "'" + linkStr + "'")
    }]) RETURNING id;`);
    executeQuery(`INSERT INTO public.task("projectId", title, description, "startDate", "endDate", tags, links)
    VALUES (${projectId}, '${title}', '${description}', '${startDate}', '${endDate}', Array[${
        tags.map(tagStr => "'" + tagStr + "'")
    }], Array[${
        links.map(linkStr => "'" + linkStr + "'")
    }]) RETURNING id;`, undefined, (taskIdRows: any[]) => { // fix any!!!!!!!!!!!1
        leaders.forEach((leader) => {
            console.log(`INSERT INTO public.task_to_user("taskId", "userId") VALUES (${taskIdRows[0].id},
                (SELECT id FROM public.user WHERE username='${leader.username}'));`)
            executeQuery(`INSERT INTO public.task_to_user("taskId", "userId") VALUES (${taskIdRows[0].id},
            (SELECT id FROM public.user WHERE username='${leader.username}'));`)});
    });
}

const createComment = ({ taskId, title, content }: {taskId: number, title: string, content: string}) => {
    executeQuery(`INSERT INTO public.comment("taskId", title, content) VALUES (${taskId}, '${title}', '${content}');`);
}

export { executeQuery, createProject, createTask, createComment };

// TODO:
// - Catch errors