import React from "react";
import TaskFormDialog from "./TaskFormDialog";
import axios from "axios";
import { useParams } from "react-router-dom";


const UpdateTask: React.FC = (): JSX.Element => {
    const projectId = useParams().project_id;
    const taskId = useParams().task_id;

    return (
        <TaskFormDialog
            axiosFn={axios.put}
            route={`http://localhost:5000/project/${projectId}/task/${taskId}/update`}
            toInvalidate={`project ${projectId} task ${taskId} fetch details`}
        />
    );
}

export default UpdateTask;