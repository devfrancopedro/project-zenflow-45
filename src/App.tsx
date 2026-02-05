import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from "@/contexts/DataContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Clients from "./pages/Clients";
import Projects from "./pages/Projects";
import ProjectForm from "./pages/ProjectForm";
import ProjectDetails from "./pages/ProjectDetails";
import Sellers from "./pages/Sellers";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <DataProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Index />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clients"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Clients />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Projects />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects/new"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ProjectForm />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects/:id"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ProjectDetails />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects/:id/edit"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ProjectForm />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sellers"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Sellers />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
