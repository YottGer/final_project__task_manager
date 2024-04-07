interface IUser {
    id: number,
    username: string,
    password: string,
    isAdmin: boolean
}

interface IBaseProject {
    title: number,
    description: string,
    status: string
}

interface IProjectInDB extends IBaseProject {
    id: number
}

interface IProjectForClient extends IProjectInDB {
    team: string[]
}

interface IProjectFromClient extends IBaseProject {
    team: string[]
}

interface IBaseTask {
    title: string,
    description: string,
    startDate: string,
    endDate: string,
    tags: string[],
    links: string[],
    status: string
}

interface ITaskInDB extends IBaseTask {
    id: number,
    projectId: number
}

interface ITaskForClient extends ITaskInDB {
    leaders: string[]
}

interface ITaskFromClient extends IBaseTask {
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

export { IUser, IProjectInDB, IProjectForClient, IProjectFromClient, ITaskInDB, ITaskForClient, ITaskFromClient
    , ITaskToUser, IComment, IExtendComment };

const foo = 8;
export default foo;