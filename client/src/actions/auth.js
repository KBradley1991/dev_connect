import axios from "axios";
import {
  REGISTER_SUCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR
} from "../actions/types";
import { setAlert } from "./alert";
import setAuthToken from "../utils/setAuthToken";

//Load User
export const loadUser = () => async dispatch => {
  if (localStorage.token) {
    setAuthToken(localStorage.token);
  }

  //  try {
  console.log("its at here");
  const config = {
    headers: {
      "x-auth-token": localStorage.token
    }
  };
  axios
    .get("http://localhost:5000/api/auth", config)
    .then(res => {
      console.log(res);
      dispatch({
        type: USER_LOADED,
        payload: res.data
      });
    })
    .catch(e => {
      console.error(e);
      dispatch({
        type: AUTH_ERROR
      });
    });
  // console.log(res);
  /*
    dispatch({
      type: USER_LOADED,
      payload: res.data
    });
  } catch (err) {
    console.log(err);
    dispatch({
      type: AUTH_ERROR
    });
    */
  //}
};

//register users
export const register = (name, email, password) => async dispatch => {
  const config = {
    headers: {
      "Content-Type": "application/json"
    }
  };
  const body = JSON.stringify({ name, email, password });
  console.log(name, email, password);
  try {
    //     const res = await axios.post("api/users", body, config);

    const res = await axios.post("/api/users", body);
    console.log(res);
    dispatch({ type: REGISTER_SUCESS, payload: res.data });
  } catch (err) {
    const errors = err.response.data.errors;
    console.log(errors);
    if (errors) {
      errors.forEach(error => {
        dispatch(setAlert(error.msg, "danger"));
      });
    }
    dispatch({ type: REGISTER_FAIL });
  }
};
