interface IUser {
    id: number,
    username: string,
    password: string,
    isAdmin: boolean
}

interface IProject {
    id: number,
    title: string,
    description: string,
    status: string
}

interface IExtendProject extends IProject {
    team: string[],
}

interface ITask {
    id: number,
    projectId: number,
    title: string,
    description: string,
    startDate: string,
    endDate: string,
    tags: string[],
    links: string[],
    status: string
}
interface IExtendTask extends ITask {
    leaders: string[]
}

interface ITaskToUser {
    taskId: number,
    userId: number
}

interface IComment {
    taskId: number | string,
    title: string,
    content: string
}

interface IExtendComment extends IComment {
    id: number,
}

export { IUser, IProject, IExtendProject, ITask, IExtendTask, ITaskToUser, IComment, IExtendComment };