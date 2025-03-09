import React from "react";
import { Routes, Route } from "react-router-dom";
import Signup from "./Component/Authentication/Signup";
import Signin from "./Component/Authentication/Signin";
import VerifyEmail from "./Component/Authentication/VerifyEmail";
import Home from "./Pages/Home";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="/verifyemail" element={<VerifyEmail />} />
    </Routes>
  );
};

export default App;
