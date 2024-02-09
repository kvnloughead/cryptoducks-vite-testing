import { Navigate } from "react-router-dom";

function ProtectedRoute({ isLoggedIn, isLoggedInLoading, children }) {
  if (isLoggedInLoading) {
    return null;
  } else if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default ProtectedRoute;
