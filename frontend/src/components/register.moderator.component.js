import React, { Component } from "react";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";
import { isEmail } from "validator";

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

const email = value => {
  if (!isEmail(value)) {
    return (
      <div className="position-absolute m-0" style={{ color: "rgb(230,128,128)", fontSize: "14px" }}>
        This email is not valid!
      </div>
    );
  }
};

const vusername = value => {
  if (value.length < 3 || value.length > 20) {
    return (
      <div className="position-absolute m-0" style={{ color: "rgb(230,128,128)", fontSize: "14px" }}>
        Username must be between 3 and 20 characters long!
      </div>
    );
  }
};

const vpassword = value => {
  if (value.length < 6 || value.length > 40) {
    return (
      <div className="position-absolute m-0" style={{ color: "rgb(230,128,128)", fontSize: "14px" }}>
        Password must be between 6 and 40 characters!
      </div>
    );
  }
};

export default class Register extends Component {
  constructor(props) {
    super(props);
    this.handleRegister = this.handleRegister.bind(this);
    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onChangeEmail = this.onChangeEmail.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);

    this.state = {
      username: "",
      email: "",
      password: "",
      successful: false,
      message: "",
      loading: false
    };
  }

  onChangeUsername(e) {
    this.setState({
      username: e.target.value,
      message: ""
    });
  }

  onChangeEmail(e) {
    this.setState({
      email: e.target.value,
      message: ""
    });
  }

  onChangePassword(e) {
    this.setState({
      password: e.target.value,
      message: ""
    });
  }

  handleRegister(e) {
    e.preventDefault();

    this.setState({
      message: "",
      successful: false,
      loading: true
    });

    this.form.validateAll();

    if (this.checkBtn.context._errors.length === 0) {
      AuthService.registermoderator(
        this.state.username,
        this.state.email,
        this.state.password,
        ["user","moderator"]
      ).then(
        response => {
          this.setState({
            message: response.data.message,
            successful: true
          });
        },
        error => {
          const resMessage =
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString();

          this.setState({
            successful: false,
            message: resMessage,
            loading: false
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
      <div>
        {!this.state.successful ? (
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
                className="d-flex flex-column align-self-center position-relative"
                style={{ width: `250px`, height: `310px` }}
                onSubmit={this.handleRegister}
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
                      validations={[required, vusername]}
                    />
                  </div>
                </div>
                <div className="d-flex flex-column justify-content-end" style={{ height: "70px", width: "250px" }}>
                  <div style={{ height: "39px", width: "250px" }}>
                    <Input
                      type="password"
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
                      validations={[required, vpassword]}
                    />
                  </div>
                </div>
                <div className="d-flex flex-column justify-content-end" style={{ height: "70px", width: "250px" }}>
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
                      name="email"
                      placeholder="Digite um e-mail"
                      value={this.state.email}
                      onChange={this.onChangeEmail}
                      validations={[required, email]}
                    />
                  </div>
                </div>                
                
                <div style={{ height: "80px", width: "250px" }}>
                  <button
                    className="btn btn-outline-dark btn-block  position-relative"
                    style={{ width: `250px`, height: `39px`, top: "30px" }}
                    disabled={this.state.loading}
                  >
                    {this.state.loading ? (
                      <span className="spinner-border spinner-border-sm"></span>
                    ) : (
                        <span>Sign Up</span>
                      )}
                  </button>
                </div>

                <CheckButton
                  style={{ display: "none" }}
                  ref={c => {
                    this.checkBtn = c;
                  }}
                />
              </Form>
            </div>
          </div >
        ) : (
            <div className="form-group d-flex justify-content-center">
              <div
                className={
                  this.state.successful
                    ? "alert alert-success text-center shadow"
                    : "alert alert-danger text-center shadow"
                }
                style={{ width: `27rem` }}
                role="alert"
              >
                {this.state.message}
              </div>
            </div>
          )}
      </div>
    );
  }
}
