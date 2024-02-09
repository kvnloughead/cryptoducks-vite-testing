import { useState, useEffect, useCallback } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import Ducks from "./Ducks";
import Login from "./Login";
import MyProfile from "./MyProfile";
import Register from "./Register";
import ProtectedRoute from "./ProtectedRoute";
import * as auth from "../utils/auth";
import * as api from "../utils/api";
import { setToken, getToken } from "../utils/token";
import "./styles/App.css";

function App() {
  const [userData, setUserData] = useState({ username: "", email: "" });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoggedInLoading, setIsLoggedInLoading] = useState(true);

  const navigate = useNavigate();

  const handleRegistration = ({
    username,
    email,
    password,
    confirmPassword,
  }) => {
    if (password === confirmPassword) {
      auth
        .register(username, password, email)
        .then(() => {
          navigate("/login");
        })
        .catch(console.error);
    }
  };

  const handleLogin = ({ username, password }) => {
    if (!username || !password) {
      return;
    }

    auth
      .authorize(username, password)
      .then((data) => {
        if (data.jwt) {
          setToken(data.jwt);
          // setUserData(data.user);
          setIsLoggedIn(true);
          navigate("/ducks");
          fetchUserInfo(data.jwt);
        }
      })
      .catch(console.error)
      .finally(() => {
        setIsLoggedInLoading(false);
      });
  };

  // useEffect(() => {
  //   const jwt = getToken();

  //   if (!jwt) {
  //     return;
  //   }

  //   api
  //     .getUserInfo(jwt)
  //     .then(({ username, email }) => {
  //       setIsLoggedIn(true);
  //       setUserData({ username, email });
  //       // navigate("/ducks");
  //     })
  //     .catch(console.error);
  // }, []);

  const fetchUserInfo = useCallback((token) => {
    api
      .getUserInfo(token)
      .then((res) => {
        if (res) {
          setIsLoggedInLoading(false);
          setIsLoggedIn(true);
          setUserData(res);
        } else {
          localStorage.removeItem("jwt");
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Fetch user info on page load if JWT already exists in localStorage
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      fetchUserInfo(token);
    }
  }, [fetchUserInfo]);

  return (
    <Routes>
      {/* <Route
        path="/"
        element={
          isLoggedIn ? (
            <Navigate to="/ducks" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      /> */}

      <Route
        path="/"
        element={
          <ProtectedRoute
            isLoggedIn={isLoggedIn}
            isLoggedInLoading={isLoggedInLoading}
          >
            <Navigate to="/ducks" replace />
          </ProtectedRoute>
        }
      ></Route>

      <Route
        path="/ducks"
        element={
          <ProtectedRoute
            isLoggedIn={isLoggedIn}
            isLoggedInLoading={isLoggedInLoading}
          >
            <Ducks />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-profile"
        element={
          <ProtectedRoute
            isLoggedIn={isLoggedIn}
            isLoggedInLoading={isLoggedInLoading}
          >
            <MyProfile userData={userData} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/login"
        element={
          <div className="loginContainer">
            <Login handleLogin={handleLogin} />
          </div>
        }
      />
      <Route
        path="/register"
        element={
          <div className="registerContainer">
            <Register handleRegistration={handleRegistration} />
          </div>
        }
      />
    </Routes>
  );
}

export default App;
