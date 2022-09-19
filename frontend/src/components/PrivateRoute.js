import { useEffect, useState } from "react";

import { Navigate, Outlet } from "react-router-dom";

import axios from "axios";

import { STATUS_CODE_OK } from "../constants";

function PrivateRoute(props) {
  const [isAuthenticated, setAuthentication] = useState();
  useEffect(() => {
    const res = axios
      .get(props.path, { withCredentials: true })
      .catch((error) => {
        console.log("Error!");
      });
    if (res && res.status === STATUS_CODE_OK) {
      setAuthentication(true);
    } else {
      setAuthentication(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Will run once when component first mounts

  return !isAuthenticated ? <Navigate to="/signin" /> : <Outlet />;
}

export default PrivateRoute;