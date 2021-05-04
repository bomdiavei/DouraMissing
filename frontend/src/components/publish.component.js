import React, { Component } from "react";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import TextArea from "react-validation/build/textarea";
import CheckButton from "react-validation/build/button";

import UserService from "../services/user.service";
import AuthService from "../services/auth.service";

const required = value => {
  if (!value) {
    return (
      <div className="position-absolute m-0" style={{ bottom: "9px", left: "290px", color: "rgb(230,128,128)", fontSize: "14px" }}>
        Required field!
      </div>
    );
  }
};

const vdogname = value => {
  if (value.length < 3 || value.length > 20) {
    return (
      <div className="position-absolute m-0" style={{ bottom: "9px", left: "170px", color: "rgb(230,128,128)", fontSize: "14px" }}>
        The name must be between 3 and 20 characters long!
      </div>
    );
  }
};

const vdescription = value => {
  if (value.length < 12) {
    return (
      <div className="position-absolute m-0" style={{ bottom: "9px", left: "130px", color: "rgb(230,128,128)", fontSize: "14px" }}>
        The description must be at least 12 characters long!
      </div>
    );
  }
};

const vdogimage = value => {
  if (value === null) {
    return (
      <div className="position-absolute m-0" style={{ zIndex: "2", bottom: "470px", left: "380px", color: "rgb(230,128,128)", fontSize: "20px" }}>
        <b>It is necessary to choose an image!</b>
      </div>
    );
  }
};

export default class Publish extends Component {
  constructor(props) {
    super(props);
    this.handleRegister = this.handleRegister.bind(this);
    this.onChangeDogname = this.onChangeDogname.bind(this);
    this.onChangeDescription = this.onChangeDescription.bind(this);
    this.onChangeDogImage = this.onChangeDogImage.bind(this);

    this.state = {
      dogname: "",
      description: "",
      dogImage: null,
      dogFile: null,
      successful: false,
      message: "",
      currentUser: AuthService.getCurrentUser(),
      dogImageEditIsShown: false
    };
  }

  onChangeDogname(e) {
    this.setState({
      dogname: e.target.value
    });
  }

  onChangeDescription(e) {
    this.setState({
      description: e.target.value
    });
  }

  onChangeDogImage(e) {
    if (e.target.files[0] !== undefined) {
      this.setState({
        dogImage: e.target.files[0],
        dogFile: URL.createObjectURL(e.target.files[0])
      });
    }
  }

  handleRegister(e) {
    e.preventDefault();

    this.setState({
      message: "",
      successful: false
    });

    this.form.validateAll();

    if (this.checkBtn.context._errors.length === 0) {
      var data = new FormData();
      data.append('dogname', this.state.dogname);
      data.append('description', this.state.description);
      data.append('dogImage', this.state.dogImage);

      UserService.publish(
        this.state.currentUser.id,
        data
      ).then(
        response => {
          this.setState({
            message: response.message,
            successful: true
          });
          setTimeout(() => {
            if (window.location.href === `http://localhost:8081/publish`)
              this.props.history.push(`/home`);
          }, 7000)
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
            message: resMessage
          });
        }
      );
    }
  }

  render() {
    return (
      <div className="col-md-12">
        {this.state.currentUser ? (
          <div>
            {!this.state.successful && (
              <Form className="d-flex flex-column" onSubmit={this.handleRegister} ref={c => { this.form = c; }}>
                <div className="align-self-center shadow" style={{ width: `27rem`, height: `450px` }}>
                  <div className="d-flex" style={{ height: "243px" }}>
                    <div className="m-0 position-absolute p-0 align-self-end" style={{ width: "27rem", backgroundColor: "rgba(255, 0, 0, 0.7)" }}>
                      <p className="text-center text-white m-auto"><b>Desaparecido</b></p>
                    </div>
                    {this.state.dogImage === null ? (
                      <div>
                        <Input
                          type="file"
                          id="dogImage"
                          name="dogImage"
                          className="custom-file-input position-absolute"
                          style={{ width: "27rem", height: "243px", cursor: "pointer" }}
                          onChange={this.onChangeDogImage}
                          validations={[vdogimage]}
                        />
                        <div
                          className="d-flex flex-column justify-content-center position-absolute text-center"
                          style={{ backgroundColor: "rgba(255, 255, 255, 0.7)", width: "27rem", height: "219px", color: "rgba(100, 100, 100, 0.8)", fontSize: "30px" }}
                        >
                          <b>Choose an image</b>
                        </div>
                        <img src="http://localhost:8080/uploads/dogTest.jpg" className="card-img-top m-0" style={{ objectFit: "cover" }} alt="..." />
                      </div>
                    ) : (
                        <div
                          onMouseEnter={() => this.setState({ dogImageEditIsShown: true })}
                          onMouseLeave={() => this.setState({ dogImageEditIsShown: false })}
                        >
                          <Input
                            type="file"
                            id="dogImage"
                            name="dogImage"
                            className="custom-file-input position-absolute"
                            style={{ width: "27rem", height: "243px", cursor: "pointer" }}
                            onChange={this.onChangeDogImage}
                            validations={[vdogimage]}
                          />
                          <div
                            className=
                            {
                              this.state.dogImageEditIsShown ?
                                (
                                  "d-flex flex-column justify-content-center align-self-center text-center position-absolute"
                                ) : (
                                  "d-none"
                                )
                            }
                            style={{
                              backgroundColor: "rgba(255, 255, 255, 0.7)",
                              width: "27rem",
                              height: "219px",
                              color: "rgba(100, 100, 100, 0.8)",
                              fontSize: "30px"
                            }}
                          >
                            <b>Change image</b>
                          </div>
                          <div className="d-flex justify-content-center" style={{ width: "27rem", height: "219px" }}>
                            <img src={this.state.dogFile} className="card-img-top align-self-center img-fluid" style={{ objectFit: "cover", width: "27rem", height: "219px" }} alt="..." />
                          </div>
                        </div>
                      )}
                  </div>
                  <div className="form-group m-0 position-relative">
                    <Input
                      type="text"
                      className="form-control mt-1 h-auto border-0"
                      style={{ fontSize: "21px" }}
                      name="dogname"
                      placeholder="Digite o nome do animal..."
                      value={this.state.dogname}
                      onChange={this.onChangeDogname}
                      validations={[required, vdogname]}
                    />
                  </div>

                  <div className="form-group m-0 position-relative">
                    <TextArea
                      type="text"
                      className="form-control mt-1 border-0"
                      style={{ height: "156px", resize: "none" }}
                      name="description"
                      placeholder="Descreva o que aconteceu..."
                      value={this.state.description}
                      onChange={this.onChangeDescription}
                      validations={[required, vdescription]}
                    />
                  </div>
                </div>
                <div className="align-self-center mt-3">
                  <div className="form-group">
                    <button
                      className="btn btn-outline-dark"
                      style={{ width: "7rem" }}
                    >
                      Publish
                      </button>
                  </div>
                </div>
                <CheckButton style={{ display: "none" }} ref={c => { this.checkBtn = c; }} />
              </Form>
            )}
          </div>) : (
            <div>
              <div className="form-group d-flex justify-content-center">
                <div
                  className="alert alert-danger text-center shadow"
                  style={{ width: `27rem` }}
                  role="alert"
                >
                  You must log in to post
                </div>
              </div>
            </div>
          )}
        {this.state.message && (
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