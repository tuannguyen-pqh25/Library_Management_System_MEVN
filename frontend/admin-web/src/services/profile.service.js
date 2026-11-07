import http from "./http-common";

class ProfileService {
  getProfile() {
    return http.get("/profile");
  }

  updateProfile(data) {
    return http.put("/profile", data);
  }

  changePassword(data) {
    return http.put("/profile/password", data);
  }
}

export default new ProfileService();
