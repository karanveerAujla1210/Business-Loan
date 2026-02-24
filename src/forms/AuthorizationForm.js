const UserService = require("../services/userServices");
const jwtHelper = require("../helpers/jwtHelper");
let AuthorizationForm = {};

AuthorizationForm.getUserById = async (user) => {
  let response = false;
  // console.log("user?.idUser", user);
  if (user?.idUser?.startsWith("MBLA")) {
    // console.log("NUMBER");
    await UserService.getStaffByMobile(user?.phone)
      .then((user) => {
        response = user;
      })
      .catch((error) => {
        response = error;
      });
    return response;
  }
  if (user?.idUser?.startsWith("MBLC")) {
    await UserService.getUserByMobile(user?.phone)
      .then((user) => {
        response = user;
      })
      .catch((error) => {
        response = error;
      });
    return response;
  }
  return response;
};

AuthorizationForm.getUserByToken = async (token) => {
  let response = false;
  const payload = await jwtHelper.validateToken(token);
  // console.log(payload, "step1234");
  if (payload) {
    response = await AuthorizationForm.getUserById(payload);
  }
  return response;
};

module.exports = AuthorizationForm;
