import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:8080/api/test/';

class UserService {
  getPublicContent() {
    return axios.get(API_URL + 'all');
  }

  getPublicContentByDogNameAndStatus(dogname, status) {
    return axios.get(API_URL + `all?dogname=${dogname}&status=${status}`);
  }

  getPublicContentById(id) {
    return axios.get(API_URL + `all/${id}`);
  }

  getUserAndPublications(username) {
    return axios.get(API_URL + `profile/${username}`);
  }

  updatePublication(id, data) {
    return axios.put(API_URL + `all/${id}`, data, { headers: authHeader() });
  }

  updatePublicationNoImage(id, data) {
    return axios.put(API_URL + `allNoImage/${id}`, data, { headers: authHeader() });
  }

  deletePublication(publicationId, ownerId, currentUserId) {
    return axios
      .delete(API_URL + `all/${publicationId}/${ownerId}`,
        { headers: authHeader() })
      .then(response => {
        if (response.data.accessToken) {
          if (currentUserId === ownerId) {
            localStorage.setItem("user", JSON.stringify(response.data));
          }
        }

        return response.data;
      });
  }

  getModeratorBoard() {
    return axios.get(API_URL + 'mod', { headers: authHeader() });
  }

  getAdminBoard() {
    return axios.get(API_URL + 'admin', { headers: authHeader() });
  }

  publish(userId, data) {
    return axios
      .put(
        API_URL + `publish/${userId}`,
        data,
        { headers: authHeader() }
      )
      .then(response => {
        if (response.data.accessToken) {
          localStorage.setItem("user", JSON.stringify(response.data));
        }

        return response.data;
      });
  }

  deleteUser(id) {
    return axios.delete(API_URL + `user/${id}`, { headers: authHeader() });
  }

  deleteModerator(id) {
    return axios.delete(API_URL + `mod/${id}`, { headers: authHeader() });
  }

  editUser(id, username) {
    return axios
      .put(
        API_URL + `user/${id}`,
        { username },
        { headers: authHeader() }
      )
      .then(response => {
        if (response.data.user.accessToken) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }

        return response.data;
      });
  }

  editUserImage(id, data) {
    return axios.put(
      API_URL + `userImage/${id}`,
      data,
      { headers: authHeader() }
    ).then(
      response => {
        if (response.data.user.accessToken) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }

        return response.data;
      });
  }

  forgotPassword(email) {
    return axios.put(API_URL + `forgotPassword?email=${email}`);
  }

  resetPassword(token, newpassword) {
    return axios.put(
      API_URL + `resetPassword`,
      { newpassword, token },
      { headers: { 'x-access-token': token } }
    );
  }

}

export default new UserService();
