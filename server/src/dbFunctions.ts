import { Client, QueryResult } from "pg";
import { Response } from "express";

const dbClient = new Client({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "pass123",
    database: "postgres"
});

dbClient.connect();

const executeQuery = (query: string, response?: Response) => {

    dbClient.query(query, (err: Error, result: QueryResult): void => {
    // if (err) ...
    if (response) response.send(result.rows);
    });
    
    dbClient.end;
}

const createProject = ({title, description, status}: {title: string, description: string, status: string}) => {
    executeQuery(`INSERT INTO public.project(title, description, status)
    VALUES ('${title}', '${description}', '${status}');`);
}


export { executeQuery, createProject };

// TODO:
// - Catch errors