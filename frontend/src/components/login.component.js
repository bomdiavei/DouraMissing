import React, { Component } from "react";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";

import { Link } from "react-router-dom";

import AuthService from "../services/auth.service";

const required = value => {
  if (!value) {
    return (
      <div className="position-absolute m-0" style={{ color: "rgb(230,128,128)", fontSize: "14px" }}>
        This field is required!
      </div>
    );
  }
};

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.handleLogin = this.handleLogin.bind(this);
    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);

    this.state = {
      username: "",
      password: "",
      loading: false,
      message: ""
    };
  }

  onChangeUsername(e) {
    this.setState({
      username: e.target.value,
      message: ""
    });
  }

  onChangePassword(e) {
    this.setState({
      password: e.target.value,
      message: ""
    });
  }

  handleLogin(e) {
    e.preventDefault();

    this.setState({
      message: "",
      loading: true
    });

    this.form.validateAll();

    if (this.checkBtn.context._errors.length === 0) {
      AuthService.login(this.state.username, this.state.password).then(
        () => {
          this.props.history.push(`/profile/${this.state.username}`);
          window.location.reload();
        },
        error => {
          const resMessage =
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString();

          this.setState({
            loading: false,
            message: resMessage
          });
        }
      );
    } else {
      this.setState({
        loading: false
      });
    }
  }

  render() {
    return (
      <div className="d-flex justify-content-center">
        <div
          className="
                    align-self-center 
                    shadow
                    d-flex 
                    justify-content-center"
          style={{ width: `18rem`, height: `310px` }}
        >
          <Form
            onSubmit={this.handleLogin}
            className="d-flex flex-column align-self-center position-relative"
            style={{ width: `250px`, height: `310px` }}
            ref={c => {
              this.form = c;
            }}
          >

            <div className="d-flex flex-column justify-content-end" style={{ height: "90px", width: "250px" }}>
              <div style={{ height: "39px", width: "250px" }}>
                <Input
                  type="text"
                  className="form-control
                       rounded-0
                       border-top-0
                       border-right-0
                       border-left-0
                       bg-transparent"
                  style={{ boxShadow: 'none' }}
                  name="username"
                  placeholder="Digite um nome de usuário"
                  value={this.state.username}
                  onChange={this.onChangeUsername}
                  validations={[required]}
                />
              </div>
            </div>
            <div className="d-flex flex-column justify-content-end " style={{ height: "70px", width: "250px" }}>
              <div style={{ height: "39px", width: "250px" }}>
                <Input type="password"
                  className="form-control
                       rounded-0
                       border-top-0
                       border-right-0
                       border-left-0
                       bg-transparent"
                  style={{ boxShadow: 'none' }}
                  name="password"
                  placeholder="Digite uma senha"
                  value={this.state.password}
                  onChange={this.onChangePassword}
                  validations={[required]} />
              </div>
            </div>

            <div style={{ height: "150px", width: "250px" }}>
              <button
                className="btn btn-outline-dark btn-block position-relative"
                style={{ width: `250px`, height: `39px`, top: "100px" }}
                disabled={this.state.loading}
              >
                {this.state.loading ? (
                  <span className="spinner-border spinner-border-sm"></span>
                ) : (
                    <span>Log In</span>
                  )}
              </button>
            </div>

            <Link to={"/forgotpassword"}>
              <div className="m-0" style={{ cursor: "pointer", textDecoration: "underline", color: "rgba(50,128,220, 0.65)", fontSize: "14px", position: "absolute", top: "175px", left: "12px" }}>
              Forgot password?
            </div>
            </Link>

            {this.state.message && (
              <div className="m-0 align-self-center" style={{ color: "rgba(240,128,128,0.85)", fontSize: "14px", position: "absolute", top: "205px" }}>
                {this.state.message}
              </div>
            )}

            <CheckButton style={{ display: "none" }} ref={c => { this.checkBtn = c; }} />

          </Form>
        </div>
      </div>
    );
  }
}
