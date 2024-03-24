import React from "react";
import { useParams } from "react-router-dom";

const TaskPage: React.FC = (): JSX.Element => {
    const params = useParams();

    return <>task page: {params.task_id}, project page: {params.project_id}</>
}

export default TaskPage;