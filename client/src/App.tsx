import { createRoutesFromElements, Route, createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./components/pages/HomePage";
import LoginPage from "./components/pages/LoginPage";
import CreateProjectPage from "./components/pages/CreateProjectPage";
import ProjectPage from "./components/pages/ProjectPage";
import TaskPage from "./components/pages/TaskPage";

const routerDefinitions = createRoutesFromElements(
  <Route>
    <Route path="/" element={<HomePage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/create_project" element={<CreateProjectPage/>} />
    <Route path="/project/:project_id" element={<ProjectPage />} />
    <Route path="/project/:project_id/task/:task_id" element={<TaskPage />} />
  </Route>
);

const router = createBrowserRouter(routerDefinitions);

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;