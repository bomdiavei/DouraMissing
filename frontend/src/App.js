import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import AuthService from "./services/auth.service";
import Login from "./components/login.component";
import Register from "./components/register.component";
import RegisterModerator from "./components/register.moderator.component";
import Home from "./components/home.component";
import Profile from "./components/profile.component";
import Publish from "./components/publish.component";
import BoardModerator from "./components/board-moderator.component";
import BoardAdmin from "./components/board-admin.component";
import PublicationEdit from "./components/publication-edit.component";
import ForgotPassword from "./components/forgot-password.component";
import ResetPassword from "./components/reset-password.component";

class App extends Component {
  constructor(props) {
    super(props);
    this.logOut = this.logOut.bind(this);

    this.state = {
      showModeratorBoard: false,
      showAdminBoard: false,
      currentUser: undefined
    };
  }

  componentDidMount() {
    const user = AuthService.getCurrentUser();

    if (user) {
      this.setState({
        currentUser: user,
        showModeratorBoard: user.roles.includes("ROLE_MODERATOR"),
        showAdminBoard: user.roles.includes("ROLE_ADMIN")
      });
    }
  }

  logOut() {
    AuthService.logout();
  }

  render() {
    const { currentUser, showModeratorBoard, showAdminBoard } = this.state;

    return (
      <Router>
        <div>
          <nav className="navbar navbar-expand navbar-dark bg-dark">
            <div className="navbar-nav mr-auto">
              <li className="nav-item">
                <Link to={"/home"} className="nav-link">
                  Início
                </Link>
              </li>

              {showModeratorBoard && (
                <li className="nav-item">
                  <Link to={"/mod"} className="nav-link">
                    Moderador
                  </Link>
                </li>
              )}

              {showAdminBoard && (
                <li className="nav-item">
                  <Link to={"/admin"} className="nav-link">
                    Administrador
                  </Link>
                </li>
              )}

              {showAdminBoard && (
                <li className="nav-item">
                  <Link to={"/registermoderator"} className="nav-link">
                    Cadastrar Moderador
                  </Link>
                </li>
              )}
            </div>

            {currentUser ? (
              <div className="navbar-nav ml-auto">
                <li className="nav-item">
                  <Link to={"/publish"} className="nav-link">
                    Publicar
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to={"/profile/" + currentUser.username} className="nav-link">
                    {currentUser.username}
                  </Link>
                </li>
                <li className="nav-item">
                  <a href="/login" className="nav-link" onClick={this.logOut}>
                    Sair
                  </a>
                </li>
              </div>
            ) : (
                <div className="navbar-nav ml-auto">
                  <li className="nav-item">
                    <Link to={"/login"} className="nav-link">
                      Entrar
                  </Link>
                  </li>

                  <li className="nav-item">
                    <Link to={"/register"} className="nav-link">
                      Cadastrar
                  </Link>
                  </li>
                </div>
              )}
          </nav>

          <div className="container mt-3">
            <Switch>
              <Route exact path={["/home", "/home/:id", "/"]} component={Home} />
              <Route exact path="/login" component={Login} />
              <Route exact path="/register" component={Register} />
              <Route exact path={["/profile/:username", "/profile/:username/:publicationId"]} component={Profile} />
              <Route exact path="/publish" component={Publish} />
              <Route path="/mod" component={BoardModerator} />
              <Route path="/admin" component={BoardAdmin} />
              <Route path="/alls/:id" component={PublicationEdit} />
              <Route path="/forgotpassword/" component={ForgotPassword} />
              <Route path="/resetpassword/:token" component={ResetPassword} />
              <Route exact path="/registermoderator" component={RegisterModerator} />
            </Switch>
          </div>
        </div>
      </Router>
    );
  }
}

export default App;
