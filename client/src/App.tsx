import { QueryClientProvider, QueryClient } from "react-query";
import { createRoutesFromElements, Route, createBrowserRouter, RouterProvider } from "react-router-dom";

import HomePage from "./components/pages/HomePage";
import CreateProjectPage from "./components/pages/CreateProjectPage";
import ProjectPage from "./components/pages/ProjectPage";
import TaskPage from "./components/pages/TaskPage";

const routerDefinitions = createRoutesFromElements(
  <Route>
    <Route path="/" element={<HomePage />} />
    <Route path="/create_project" element={<CreateProjectPage/>} />
    <Route path="/project/:project_id" element={<ProjectPage />} />
    <Route path="/project/:project_id/task/:task_id" element={<TaskPage />} />
  </Route>
);

const queryClient = new QueryClient();
const router = createBrowserRouter(routerDefinitions);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;