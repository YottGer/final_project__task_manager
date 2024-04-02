import { QueryClientProvider, QueryClient } from "react-query";
import { createRoutesFromElements, Route, createBrowserRouter, RouterProvider } from "react-router-dom";

import HomePage from "./components/pages/HomePage";
import CreateProjectPage from "./components/pages/CreateProjectPage";
import ProjectPage from "./components/pages/ProjectPage";
import TaskPage from "./components/pages/TaskPage";
import ThemeSwitch from "./components/ThemeSwitch";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { useSelector } from "react-redux";

const routerDefinitions = createRoutesFromElements(
  <Route>
    <Route path="/" element={<HomePage />} />
    <Route path="/create_project" element={<CreateProjectPage />} />
    <Route path="/project/:project_id" element={<ProjectPage />} />
    <Route path="/project/:project_id/task/:task_id" element={<TaskPage />} />
  </Route>
);

const queryClient = new QueryClient();
const router = createBrowserRouter(routerDefinitions);

function App() {
  const { isDarkTheme } = useSelector((state: any) => state.isDarkTheme); // fix any!!!!!!!!!!11
  const theme = createTheme({
    palette: {
      mode: isDarkTheme ? "dark" : "light"
    }
  })

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ThemeSwitch />
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;