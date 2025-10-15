import { BrowserRouter, Routes, Route } from "react-router";
import { Toaster } from "sonner";
import { CookiesProvider } from "react-cookie";

import Notes from "./pages/Notes";
import NoteForm from "./pages/NoteForm";
import EditNote from "./pages/EditNote";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/Signup";
import FeedbackList from "./pages/FeedbackList";
import CommentsPage from "./pages/CommentsPage";
import UserProfile from "./pages/UserProfile";
import AdminPage from "./pages/AdminPage";

function App() {
  return (
    <CookiesProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Notes />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/notes/new" element={<NoteForm />} />
          <Route path="/notes/:id/edit" element={<EditNote />} />
          <Route path="/feedback/list" element={<FeedbackList />} />
          <Route path="/comments/:noteId" element={<CommentsPage />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/profile/:id" element={<UserProfile />} />
          <Route path="/admin" element={<AdminPage />} />

        </Routes>
        <Toaster />
      </BrowserRouter>
    </CookiesProvider>
  );
}

export default App;
