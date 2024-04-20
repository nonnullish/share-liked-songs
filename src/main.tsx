import ReactDOM from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";

import { Footer } from "@components/footer";
import { Authorize, ViewPlaylist, GeneratePlaylist, FAQ } from "@pages";
import { ProtectedRoute } from "./routes/ProtectedRoute";

import "./styles/index.css";

ReactDOM.createRoot(document.querySelector("body")!).render(
  <HashRouter>
    <Toaster
      visibleToasts={5}
      className="toaster"
      theme="dark"
      position="bottom-center"
      offset="calc(8px + 0.9lh)"
    />
    <main>
      <Routes>
        <Route path="authorize" element={<Authorize />} />
        <Route
          path="/"
          index
          element={
            <ProtectedRoute>
              <GeneratePlaylist />
            </ProtectedRoute>
          }
        />
        <Route
          path="done"
          element={
            <ProtectedRoute>
              <ViewPlaylist />
            </ProtectedRoute>
          }
        />
        <Route path="faq" element={<FAQ />} />
      </Routes>
    </main>
    <Footer />
  </HashRouter>
);
