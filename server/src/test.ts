import { Client, QueryResult } from "pg";

const dbClient = new Client({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "pass123",
    database: "final_project__task_manager"
});

dbClient.connect();

dbClient.query(`INSERT INTO public.project(title, description, status)
 VALUES ('...', '$___', 'development') RETURNING id;`, (err: Error, result: QueryResult) => {
    console.log(result.rows[0]);
 })