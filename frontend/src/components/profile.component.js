import React, { Component } from "react";
import { Link } from "react-router-dom";

import AuthService from "../services/auth.service";
import UserService from "../services/user.service";

import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";

export default class Profile extends Component {
  constructor(props) {
    super(props);

    this.retrieveUserAndPublications = this.retrieveUserAndPublications.bind(this);
    this.retrieveModalPublication = this.retrieveModalPublication.bind(this);
    this.onChangeProfileUser = this.onChangeProfileUser.bind(this);
    this.handleKeypress = this.handleKeypress.bind(this);
    this.role = this.role.bind(this);
    this.onChangeUserImage = this.onChangeUserImage.bind(this);
    this.updatingUserImage = this.updatingUserImage.bind(this);

    this.state = {
      currentUser: AuthService.getCurrentUser(),
      profileUser: {},
      publications: [],
      selectedPublication: {},
      open: false,
      usernameEditIsShown: false,
      usernameInputIsShown: false,
      alertMessage: "",
      userImageEditIsShown: false,
      openUserImage: false,
      userImageEditIsShownModal: false,
      userImage: null,
      userURL: "",
      userImageMessage: ""
    };
  }

  componentDidMount() {
    const script = document.createElement("script");

    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.src = "https://connect.facebook.net/pt_BR/sdk.js#xfbml=1&version=v7.0&appId=323372545366033&autoLogAppEvents=1";
    script.nonce = "IXlaM0UP"

    document.body.appendChild(script);

    this.retrieveUserAndPublications(this.props.match.params.username);
  }

  retrieveUserAndPublications(username) {
    if (this.props.match.params.publicationId) {
      UserService.getUserAndPublications(username)
        .then(response => {
          this.setState({
            publications: response.data.publications,
            profileUser: response.data.user,
            userURL: response.data.user.userImage
          });
          //console.log(response.data);
        })
        .catch(e => {
          console.log(e);
        });

      UserService.getPublicContentById(this.props.match.params.publicationId)
        .then(response => {
          this.setState({
            selectedPublication: response.data,
            open: true
          }, () => {
            this.props.history.push(`/profile/${this.props.match.params.username}/${this.props.match.params.publicationId}`);
          });
          //console.log(response.data);
        })
        .catch(e => {
          console.log(e);
        });
    } else {

      UserService.getUserAndPublications(username)
        .then(response => {
          this.setState({
            publications: response.data.publications,
            profileUser: response.data.user,
            selectedPublication: {},
            userURL: response.data.user.userImage,
            open: false
          });
          //console.log(response.data);
        })
        .catch(e => {
          console.log(e);
        });
    }
  }

  retrieveModalPublication(publication_id) {
    UserService.getPublicContentById(publication_id)
      .then(response => {
        this.setState({
          selectedPublication: response.data,
          open: true
        }, () => {
          this.props.history.push(`/profile/${this.state.profileUser.username}/${publication_id}`);
        });
        //console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });
  }

  onChangeProfileUser(e) {
    const username = e.target.value;
    if (this.state.profileUser.username.length >= 3 && this.state.profileUser.username.length <= 20) {
      this.setState(prevState => ({
        alertMessage: "",
        profileUser: {
          ...prevState.profileUser,
          username: username
        }
      }));
    } else {
      this.setState(prevState => ({
        profileUser: {
          ...prevState.profileUser,
          username: username
        }
      }));
    }
  }

  handleKeypress(e) {

    if (this.state.profileUser.username.length < 3 || this.state.profileUser.username.length > 20) {
      this.setState({
        alertMessage: "It must be between 3 and 20 digits"
      });
    } else if (e.keyCode === 13 || e.which === 13) {

      if (this.state.currentUser.id === this.state.profileUser.id) {
        //console.log(e.target.value)
        UserService.editUser(this.state.profileUser.id, this.state.profileUser.username)
          .then(() => {
            this.setState({
              currentUser: AuthService.getCurrentUser(),
              usernameInputIsShown: false
            }, () => {
              this.props.history.push(`/profile/${this.state.profileUser.username}`);
              window.location.reload();
            });
            //console.log(response.data);
          })
          .catch(e => {
            console.log(e);
          });
      }

    }
  }

  role(role) {
    if (role === "ROLE_ADMIN") {
      return (
        <p className="text-center text-muted m-0 p-0">
          Administrador
        </p>
      )
    }
    if (role === "ROLE_MODERATOR") {
      return (
        <p className="text-center text-muted m-0 p-0">
          Moderador
        </p>
      )
    }
    if (role === "ROLE_USER") {
      return (
        <p className="text-center text-muted m-0 p-0">
          Usuário
        </p>
      )
    }
  }

  onChangeUserImage(e) {
    if (e.target.files[0]) {
      this.setState({
        userImage: e.target.files[0],
        userURL: URL.createObjectURL(e.target.files[0])
      });
    }
  }

  updatingUserImage(e) {

    e.preventDefault();

    this.setState({
      userImageMessage: ""
    });

    this.form.validateAll();

    if (this.checkBtn.context._errors.length === 0) {
      if (this.state.userImage) {
        var data = new FormData();
        data.append('username', this.state.currentUser.username);
        data.append('email', this.state.currentUser.email);
        data.append('userImage', this.state.userImage);
        data.append('userOldImage', this.state.profileUser.userImage)

        UserService.editUserImage(
          this.state.currentUser.id,
          data
        )
          .then(
            response => {
              this.setState({
                userImageMessage: response.message,
                userURL: response.user.userImage,
                currentUser: AuthService.getCurrentUser(),
                profileUser: AuthService.getCurrentUser(),
              }, () => {
                this.props.history.push(`/profile/${this.state.profileUser.username}`);
                window.location.reload();
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
                userImageMessage: resMessage
              });
            }
          );
      } else console.log("imagem: null")
    }
  }

  render() {
    const { profileUser, publications, currentUser } = this.state;

    return (
      <div>
        {Object.keys(profileUser).length ? (
          <div className="row p-0 d-flex">
            <div className="col-sm-3 p-0">
              <div className="d-flex flex-column p-0 m-0">
                {/**/}
                {this.state.currentUser ?
                  (
                    <div>
                      {this.state.currentUser.username === this.state.profileUser.username ?
                        (
                          <div>
                            <div
                              className="position-relative d-flex justify-content-center"
                              onMouseEnter={() => this.setState({ userImageEditIsShown: true })}
                              onMouseLeave={() => this.setState({ userImageEditIsShown: false })}
                            >
                              <div
                                className=
                                {
                                  this.state.userImageEditIsShown ?
                                    (
                                      "text-center position-absolute align-self-center d-flex flex-column justify-content-center"
                                    ) : (
                                      "d-none"
                                    )
                                }
                                style={{ height: "380px", width: "285px", backgroundColor: "rgba(255,255,255,0.7)", fontSize: "24px", cursor: "pointer" }}
                                onClick={() => this.setState({ openUserImage: true })}
                              >
                                <b>Editar</b>
                              </div>

                              <img src={this.state.profileUser.userImage} alt="profile-img" className="img-fluid" style={{ height: "380px", width: "285px", objectFit: "cover" }} />
                              {/*MODAL PROFILE PICTURE*/}
                              <div
                                id="myModalUser"
                                className={
                                  this.state.openUserImage
                                    ? "d-flex justify-content-center"
                                    : "d-none"
                                }
                                style={{
                                  position: "fixed",
                                  zIndex: "1",
                                  left: "0",
                                  top: "0",
                                  width: "100%",
                                  height: "100%",
                                  backgroundColor: "rgba(0,0,0,0.4)"
                                }}>
                                <div className="d-flex flex-column align-self-center position-relative" style={{ height: "80%", width: "80%", backgroundColor: "white" }}>

                                  <div className="m-0 text-muted position-absolute align-self-end"
                                    style={{
                                      cursor: "pointer",
                                      boxShadow: "none",
                                      fontSize: "14px"
                                    }}
                                    onClick={() => { this.setState({ openUserImage: false }) }}
                                  >
                                    {/*&times;*/}
                              close(x)
                            </div>
                                  <Form className="edit-form d-flex flex-column m-0" onSubmit={this.updatingUserImage} ref={c => { this.form = c; }}>
                                    <div
                                      className="position-relative d-flex justify-content-center align-self-center mt-3"
                                      style={{ height: "380px", width: "285px", objectFit: "cover" }}
                                      onMouseEnter={() => this.setState({ userImageEditIsShownModal: true })}
                                      onMouseLeave={() => this.setState({ userImageEditIsShownModal: false })}
                                    >
                                      <Input
                                        type="file"
                                        id="userImage"
                                        name="userImage"
                                        className="custom-file-input position-absolute"
                                        style={{ width: "27rem", height: "243px", cursor: "pointer" }}
                                        onChange={this.onChangeUserImage}
                                      />
                                      <div
                                        className=
                                        {
                                          this.state.userImageEditIsShownModal ?
                                            (
                                              "text-center text-muted position-absolute align-self-center d-flex flex-column justify-content-center"
                                            ) : (
                                              "text-center position-absolute align-self-center d-flex flex-column justify-content-center"
                                            )
                                        }
                                        style={{ height: "380px", width: "285px", backgroundColor: this.state.userImageEditIsShownModal ? ("rgba(255,255,255,0.7)") : ("rgba(255,255,255,0.4)"), fontSize: "28px", cursor: "pointer" }}
                                        onClick={() => this.setState({ openUserImage: true })}
                                      >
                                        <b>Choose</b>
                                      </div>
                                      <img
                                        src={this.state.userURL}
                                        alt="profile-img"
                                        className="img-fluid"
                                        style={{ height: "380px", width: "285px", objectFit: "cover" }}
                                      />
                                    </div>
                                    <div className="align-self-center mt-3">
                                      <div className="form-group">
                                        <button
                                          className="btn btn-outline-info m-4"
                                          style={{ width: "7rem" }}
                                        >
                                          Update
                            </button>
                                      </div>
                                    </div>
                                    <CheckButton style={{ display: "none" }} ref={c => { this.checkBtn = c; }} />
                                  </Form>
                                </div>


                              </div>
                            </div>
                          </div>
                        ) : (
                          <img src={this.state.userURL} alt="profile-img" className="img-fluid" style={{ height: "380px", width: "285px", objectFit: "cover" }} />
                        )}
                    </div>
                  ) : (
                    <img src={this.state.userURL} alt="profile-img" className="img-fluid" style={{ height: "380px", width: "285px", objectFit: "cover" }} />
                  )}
                {/**/}
                {this.role(profileUser.roles[0])}
                {!this.state.usernameInputIsShown ?
                  (
                    <div>
                      {currentUser ?
                        (
                          <div
                            className="position-relative"
                            onMouseEnter={() => this.setState({ usernameEditIsShown: true })}
                            onMouseLeave={() => this.setState({ usernameEditIsShown: false })}
                          >
                            {currentUser.username === profileUser.username ?
                              (
                                <div>
                                  <button
                                    className=
                                    {
                                      this.state.usernameEditIsShown ?
                                        (
                                          "btn position-absolute text-primary"
                                        ) : (
                                          "d-none"
                                        )
                                    }
                                    onClick={() => this.setState({ usernameInputIsShown: true })}
                                    style={{ boxShadow: "none", left: "243px", top: "5px", fontSize: "14px" }}
                                  >
                                    Edit
                                </button>
                                  <p className="text-center text-break mb-3" style={{ fontSize: "28px" }}>
                                    <b>{this.state.profileUser.username}</b>
                                  </p>
                                </div>
                              ) : (
                                <p className="text-center text-break mb-3" style={{ fontSize: "28px" }}>
                                  <b>{this.state.profileUser.username}</b>
                                </p>
                              )
                            }
                          </div>
                        ) : (
                          <p className="text-center text-break mb-3" style={{ fontSize: "28px" }}>
                            <b>{this.state.profileUser.username}</b>
                          </p>
                        )
                      }
                    </div>
                  ) : (
                    <div className="position-relative">
                      <div
                        className=
                        {this.state.alertMessage.trim() === "" ? ("d-none") : ("position-absolute m-0")}
                        style={{ color: "rgb(230,128,128)", fontSize: "14px", top: "39px", left: "50px" }}>
                        {this.state.alertMessage}
                      </div>
                      <input
                        type="text"
                        autoFocus={true}
                        className="form-control m-0 p-0 border-0 text-center"
                        style={{ fontSize: "28px", boxShadow: "none" }}
                        name="dogname"
                        value={profileUser.username}
                        onChange={this.onChangeProfileUser}
                        onKeyPress={this.handleKeypress}
                      />
                    </div>
                  )}
              </div>
              <div>
                <p className="text-break">
                  E-mail:{" "}
                  <b>{profileUser.email}</b>
                </p>
              </div>
            </div>
            <div className="col-sm-9 p-0">
              {publications.length ?
                (
                  <div className="d-flex flex-wrap">
                    {publications &&
                      publications.map((publication, index) => (

                        <div key={index} className="ml-2 mb-2 shadow" style={{ width: `276px`, height: `310px` }}>

                          <div className="p-0 d-flex justify-content-center" style={{ cursor: "pointer" }}>
                            <div className="m-0 position-absolute p-0 align-self-end" style={{ width: "276px", backgroundColor: publication.status ? ("rgba(0, 255, 0, 0.7)") : ("rgba(255, 0, 0, 0.7)") }}>
                              <p className="text-center text-white m-auto" style={{ fontSize: "16px" }}><b>{publication.status ? "Encontrado" : "Desaparecido"}</b></p>
                            </div>

                            <img onClick={() => { this.retrieveModalPublication(publication._id) }} src={publication.dogImage} style={{ height: "165px", objectFit: "cover" }} className="card-img-top m-auto" alt="..." />
                          </div>
                          {/*MODAL PUBLICATION*/}
                          <div
                            id="myModal"
                            className={
                              this.state.open && this.state.selectedPublication._id === publication._id
                                ? "d-flex justify-content-center"
                                : "d-none"
                            }
                            style={{
                              position: "fixed",
                              zIndex: "1",
                              left: "0",
                              top: "0",
                              width: "100%",
                              height: "100%",
                              backgroundColor: "rgba(0,0,0,0.4)"
                            }}>
                            <div className="row shadow align-self-center bg-dark"
                              style={{ width: "80%" }}>
                              <div className="col-sm-8 m-auto p-0 d-flex justify-content-center" style={{ minHeight: `200px`, minWidth: "200px", maxHeight: `520px` }}>
                                <div className="position-absolute p-0 align-self-end" style={{ width: "200px" }}>
                                  <div className="m-auto" style={{ backgroundColor: this.state.selectedPublication.status ? ("rgba(0, 255, 0, 0.7)") : ("rgba(255, 0, 0, 0.7)"), borderRadius: "15px 15px 0px 0px" }}>
                                    <p className="text-center text-white m-auto"><b>{this.state.selectedPublication.status ? "Encontrado" : "Desaparecido"}</b></p>
                                  </div>
                                  <p className="text-center m-auto" style={{ backgroundColor: "rgba(255, 255, 255, 0.7)" }}><b>{this.state.selectedPublication.dogname}</b></p>
                                </div>
                                <img src={publication.dogImage} alt="..." className="img-fluid" style={{ objectFit: "contain" }} />
                              </div>
                              <div className="col-4 overflow-auto bg-white d-flex flex-column p-0 position-relative" style={{ height: `520px` }}>
                                <div className="m-0 text-muted position-absolute align-self-end"
                                  style={{
                                    cursor: "pointer",
                                    boxShadow: "none",
                                    fontSize: "14px"
                                  }}
                                  onClick={() => { this.setState({ open: false }, () => { this.props.history.push(`/profile/${this.state.profileUser.username}`); }) }}
                                >
                                  {/*&times;*/}
                              close(x)
                                </div>
                                <div className="p-0 mb-2 d-flex flex-column justify-content-center">
                                  <div
                                    onClick={() => { this.setState({ open: false }) }}
                                    className="badge badge-light p-0 mt-2 d-flex justify-content-center align-self-center"
                                    style={{ cursor: "pointer", maxHeight: `100px`, maxWidth: `100px` }}
                                  >
                                    <img src={this.state.userURL} alt="..." className="rounded-lg" style={{ maxHeight: `100px`, maxWidth: `100px` }} />
                                  </div>
                                  <div
                                    onClick={() => { this.setState({ open: false }) }}
                                    style={{ cursor: "pointer", textDecorationColor: "black" }}
                                    className="align-self-center"
                                  >
                                    <h5 style={{ color: "black" }}><b>{this.state.selectedPublication.username}</b></h5>
                                  </div>
                                </div>
                                <div className="d-flex justify-content-center mx-3 mb-2" style={{ borderStyle: "solid", borderColor: "rgb(220, 220, 220)", borderWidth: "1px 0px 1px 0px" }}>

                                  {currentUser ? (
                                    <div className="p-0">
                                      {currentUser.publications.includes(this.state.selectedPublication._id)
                                        || currentUser.roles.includes("ROLE_ADMIN")
                                        || currentUser.roles.includes("ROLE_MODERATOR") ?
                                        (
                                          <Link
                                            to={"/alls/" + this.state.selectedPublication._id}
                                          >
                                            <button
                                              type="button"
                                              className="btn btn-outline-dark border-0 my-1"
                                              style={{ height: `39px`, width: "125px" }}

                                            >
                                              Edit
                                            </button>
                                          </Link>
                                        ) : (<div style={{ height: "0px" }}></div>)
                                      }
                                    </div>) : (<div></div>)
                                  }

                                </div>
                                <p className="mx-3">{this.state.selectedPublication.description}</p>
                              </div>
                            </div>
                          </div>
                          {/*</Link>*/}

                          <div className="card-body">
                            <h5 className="card-title">{publication.dogname}</h5>
                            <p className="card-text text-truncate">{publication.description}</p>

                            {currentUser ? (
                              <div>
                                {currentUser.publications.includes(publication._id)
                                  || currentUser.roles.includes("ROLE_ADMIN")
                                  || currentUser.roles.includes("ROLE_MODERATOR") ? (
                                    <div className="d-flex">
                                      <Link
                                        to={"/alls/" + publication._id}
                                      >
                                        <button type="button" className="btn btn-outline-dark mb-1" style={{ fontSize: "14px", height: "30px" }}>
                                          Edit
                                        </button>
                                      </Link>



                                      <div
                                        className="fb-share-button pl-2"
                                        data-href="http://www.localhost:8081/home"
                                        data-layout="button"
                                        data-size="large"
                                      >
                                        <a
                                          rel="noopener noreferrer"
                                          target="_blank"
                                          href="https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fwww.localhost%3A8081%2Fhome&amp;src=sdkpreparse"
                                          className="fb-xfbml-parse-ignore"
                                          style={{ fontSize: "14px" }}
                                        >
                                          Share
                                      </a>
                                      </div>



                                    </div>
                                  ) : (


                                    <div
                                      className="fb-share-button pl-2"
                                      data-href="https://www.localhost:8081/home/"
                                      data-layout="button"
                                      data-size="large"
                                    >
                                      <a
                                        rel="noopener noreferrer"
                                        target="_blank"
                                        href="https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fwww.localhost%3A8081%2Fhome&amp;src=sdkpreparse"
                                        className="fb-xfbml-parse-ignore"
                                        style={{ fontSize: "14px" }}
                                      >
                                        Share
                                      </a>
                                    </div>


                                  )}
                              </div>
                            ) : (


                                <div
                                  className="fb-share-button pl-2"
                                  data-href="http://www.localhost:8081/home"
                                  data-layout="button"
                                  data-size="large"
                                >
                                  <a
                                    rel="noopener noreferrer"
                                    target="_blank"
                                    href="https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fwww.localhost%3A8081%2Fhome&amp;src=sdkpreparse"
                                    className="fb-xfbml-parse-ignore"
                                    style={{ fontSize: "14px" }}
                                  >
                                    Share
                                </a>
                                </div>


                              )}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="container">
                    <div className="jumbotron shadow m-2">
                      <h3 className="text-center text-muted">There is no publication</h3>
                    </div>
                  </div>
                )}
            </div>
          </div>
        ) : (
            <div>
              <div className="container">
                <div className="jumbotron shadow m-2">
                  <h3 className="text-center text-muted">User not found</h3>
                </div>
              </div>
            </div>
          )}
      </div>
    );
  }
}
