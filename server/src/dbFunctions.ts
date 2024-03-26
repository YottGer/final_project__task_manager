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
    let toReturn;
    dbClient.query(query, (err: Error, result: QueryResult): void => {
        // if (err) ...
        if (response) response.send(result.rows);
        if (next) next(result.rows);
    });

    dbClient.end;
}

const createProject = ({ title, description, status}: {title: string, description: string, status: string }) => {
    executeQuery(`INSERT INTO public.project(title, description, status)
    VALUES ('${title}', '${description}', '${status}');`);
}

const createTask = ({ projectId, title, description, leaders, links, startDate, endDate, tags }:
    {projectId: number, title: string, description: string, leaders: string[], links: string[], startDate: string,
         endDate: string, tags: string[]}) => {
    //TODO: handle leader, links and tags relations
    executeQuery(`INSERT INTO public.task("projectId", title, description, "startDate", "endDate", tags)
    VALUES (${projectId}, '${title}', '${description}', '${startDate}', '${endDate}', Array[${
        tags.map(tagStr => "'" + tagStr + "'")
    }]);`);
    
}

const createComment = ({ taskId, title, content }: {taskId: number, title: string, content: string}) => {
    executeQuery(`INSERT INTO public.comment("taskId", title, content) VALUES (${taskId}, '${title}', '${content}');`);
}

export { executeQuery, createProject, createTask, createComment };

// TODO:
// - Catch errors