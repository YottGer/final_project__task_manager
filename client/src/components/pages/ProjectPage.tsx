import React from "react";
import { useParams } from "react-router-dom";
import CreateTask from "../CreateTask";

const ProjectPage: React.FC = (): JSX.Element => {
    const params = useParams();

    return (
        <>
        <CreateTask />
        project page: {params.project_id}
        </>
    );
}

export default ProjectPage;