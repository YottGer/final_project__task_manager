import { QueryClientProvider, QueryClient } from "react-query";
import { createRoutesFromElements, Route, createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import HomePage from "./components/pages/HomePage";
import LoginPage from "./components/pages/LoginPage";
import CreateProjectPage from "./components/pages/CreateProjectPage";
import ProjectPage from "./components/pages/ProjectPage";
import TaskPage from "./components/pages/TaskPage";
import { useSelector } from "react-redux";
import { CssBaseline, ThemeProvider, createTheme, Button, Typography } from "@mui/material";
import ThemeSwitch from "./components/ThemeSwitch";

const queryClient = new QueryClient();

interface IIsDarkThemeState {
  isDarkTheme: {
    isDarkTheme: boolean
  }
}

export interface IAccessTokenState {
  accessToken: {
      token: string,
      username: string,
      isAdmin: boolean
  }
}

function App() {
  const { token, username, isAdmin } = useSelector((state: IAccessTokenState) => state.accessToken);
  console.log(token);
  const isLoggedIn = token !== "";

  const routerDefinitions = createRoutesFromElements(
    <Route>
      <Route path="/login" element={<LoginPage />} /> 
      <Route path="/" element={isLoggedIn ? <HomePage /> : <Navigate to="/login" />} />
      <Route path="/create_project" element={isAdmin ? <CreateProjectPage /> : <Navigate to="/" />} />
      <Route path="/project/:project_id" element={isLoggedIn ? <ProjectPage /> : <Navigate to="/login" />} />
      <Route path="/project/:project_id/task/:task_id" element={isLoggedIn ? <TaskPage /> : <Navigate to="/login" />} />
    </Route>
  );

  const router = createBrowserRouter(routerDefinitions);

  const { isDarkTheme } = useSelector((state: IIsDarkThemeState) => state.isDarkTheme);
  const theme = createTheme({
    palette: {
      mode: isDarkTheme ? "dark" : "light"
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <Button href="/" variant="contained" sx={{margin: "5px"}}>Home</Button>
        <CssBaseline />
        <ThemeSwitch />
        {isLoggedIn ?
        <Typography variant="h6">welcome {username}! You are {isAdmin ? "" : "not"} an admin!</Typography>
        :
        <></>
        }
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;