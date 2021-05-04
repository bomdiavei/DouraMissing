import React, { Component } from "react";
import { Link } from "react-router-dom";

import UserService from "../services/user.service";
import AuthService from "../services/auth.service";

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.onChangeSearchDogName = this.onChangeSearchDogName.bind(this);
    this.retrievePublications = this.retrievePublications.bind(this);
    this.searchDogNameAndStatus = this.searchDogNameAndStatus.bind(this);
    this.retrieveModalPublication = this.retrieveModalPublication.bind(this);

    this.state = {
      currentUser: AuthService.getCurrentUser(),
      publications: [],
      searchDogName: "",
      searchStatus: "all",
      buttonMessage: "View missing",
      buttonStyle: "btn btn-outline-danger btn-block  position-relative",
      open: false,
      selectedPublication: {}
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

    this.retrievePublications();
  }

  onChangeSearchDogName(e) {
    this.setState({
      searchDogName: e.target.value
    });
  }

  retrievePublications() {
    if (this.props.match.params.id) {
      UserService.getPublicContent()
        .then(response => {
          this.setState({
            publications: response.data
          });
          //console.log(response.data);
        })
        .catch(e => {
          console.log(e);
        });

      UserService.getPublicContentById(this.props.match.params.id)
        .then(response => {
          this.setState({
            selectedPublication: response.data,
            open: true
          }, () => {
            this.props.history.push(`/home/${this.props.match.params.id}`);
          });
          //console.log(response.data);
        })
        .catch(e => {
          console.log(e);
        });
    } else {
      UserService.getPublicContent()
        .then(response => {
          this.setState({
            publications: response.data
          });
          //console.log(response.data);
        })
        .catch(e => {
          console.log(e);
        });
    }
  }

  searchDogNameAndStatus(isStatus) {
    if (isStatus) {
      if (this.state.buttonMessage === "View missing") {
        this.setState({
          searchStatus: "missing",
          buttonMessage: "View found",
          buttonStyle: "btn btn-outline-success btn-block  position-relative"
        }, () => {
          UserService.getPublicContentByDogNameAndStatus(this.state.searchDogName, this.state.searchStatus)
            .then(response => {
              this.setState({
                publications: response.data
              });
              //console.log(response.data);
            })
            .catch(e => {
              console.log(e);
            });
        });
      } else if (this.state.buttonMessage === "View found") {
        this.setState({
          searchStatus: "found",
          buttonMessage: "View all",
          buttonStyle: "btn btn-outline-dark btn-block  position-relative"
        }, () => {
          UserService.getPublicContentByDogNameAndStatus(this.state.searchDogName, this.state.searchStatus)
            .then(response => {
              this.setState({
                publications: response.data
              });
              //console.log(response.data);
            })
            .catch(e => {
              console.log(e);
            });
        });
      } else if (this.state.buttonMessage === "View all") {
        this.setState({
          searchStatus: "all",
          buttonMessage: "View missing",
          buttonStyle: "btn btn-outline-danger btn-block  position-relative"
        }, () => {
          UserService.getPublicContentByDogNameAndStatus(this.state.searchDogName, this.state.searchStatus)
            .then(response => {
              this.setState({
                publications: response.data
              });
              //console.log(response.data);
            })
            .catch(e => {
              console.log(e);
            });
        });
      }
    } else {
      UserService.getPublicContentByDogNameAndStatus(this.state.searchDogName, this.state.searchStatus)
        .then(response => {
          this.setState({
            publications: response.data
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
          this.props.history.push(`/home/${publication_id}`);
        });
        //console.log(response.data);
      })
      .catch(e => {
        console.log(e);
      });
  }

  render() {
    const { currentUser, searchDogName, publications, buttonMessage, buttonStyle } = this.state;

    return (
      <div className="row p-0 d-flex">
        <div className="col-sm-3 p-0">
          <div className="shadow d-flex justify-content-center" style={{ height: "190px" }}>
            <div className="d-flex flex-column align-self-center position-relative" style={{ height: "190px", width: "254px" }}>
              <div className="d-flex flex-column justify-content-end " style={{ height: "70px" }}>
                <div style={{ height: "39px" }}>

                  <input
                    type="text"
                    className="form-control
                            rounded-0
                            border-top-0
                            border-right-0
                            border-left-0
                            bg-transparent"
                    style={{ boxShadow: "none" }}
                    placeholder="Procurar pelo nome..."
                    value={searchDogName}
                    onChange={this.onChangeSearchDogName}
                    onKeyUp={() => this.searchDogNameAndStatus(false)}
                  />
                </div>
              </div>
              <div className="d-flex flex-column justify-content-end" style={{ height: "90px", width: "250px" }}>



                <button
                  className={buttonStyle}
                  style={{ width: `250px`, height: `39px`, boxShadow: "none" }}
                  onClick={() => this.searchDogNameAndStatus(true)}
                >
                  {buttonMessage}
                </button>

              </div>
            </div>
          </div>
        </div>
        <div className="col-sm-9 p-0">

          {publications.length ?
            (
              <div className="d-flex flex-wrap">
                {publications &&
                  publications.map((publication, index) => (

                    <div key={index} className="ml-1 mb-2 shadow" style={{ width: `276px`, height: `310px` }}>

                      <div className="p-0 d-flex justify-content-center" style={{ cursor: "pointer" }}>
                        <div className="m-0 position-absolute p-0 align-self-end" style={{ width: "276px", backgroundColor: publication.status ? ("rgba(0, 255, 0, 0.7)") : ("rgba(255, 0, 0, 0.7)") }}>
                          <p className="text-center text-white m-auto" style={{ fontSize: "16px" }}><b>{publication.status ? "Encontrado" : "Desaparecido"}</b></p>
                        </div>

                        <img onClick={() => { this.retrieveModalPublication(publication._id) }} src={publication.dogImage} style={{ height: "165px", objectFit: "cover" }} className="card-img-top m-auto" alt="..." />

                      </div>
                      {/*MODAL*/}
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
                              onClick={() => { this.setState({ open: false }, () => { this.props.history.push(`/home`); }) }}
                            >
                              {/*&times;*/}
                              close(x)
                            </div>
                            <div className="p-0 mb-2 d-flex flex-column justify-content-center">
                              <Link
                                to={`/profile/${this.state.selectedPublication.username}`}
                                className="badge badge-light p-0 mt-2 d-flex justify-content-center align-self-center"
                                style={{ maxHeight: `100px`, maxWidth: `100px` }}
                              >
                                <img src={this.state.selectedPublication.userImage} alt="..." className="rounded-lg" style={{ maxHeight: `100px`, maxWidth: `100px` }} />
                              </Link>
                              <Link
                                to={`/profile/${this.state.selectedPublication.username}`}
                                style={{ textDecorationColor: "black" }}
                                className="align-self-center"
                              >
                                <h5 style={{ color: "black" }}><b>{this.state.selectedPublication.username}</b></h5>
                              </Link>
                            </div>
                            <div className="d-flex justify-content-center mx-3 mb-2" style={{ borderStyle: "solid", borderColor: "rgb(220, 220, 220)", borderWidth: "1px 0px 1px 0px" }}>

                              {currentUser ? (
                                <div className="p-0">
                                  {currentUser.publications.includes(this.state.selectedPublication._id)
                                    || currentUser.roles.includes("ROLE_ADMIN")
                                    || currentUser.roles.includes("ROLE_MODERATOR") ? (
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
                                      </Link>) : (<div></div>)
                                  }
                                </div>) :
                                (<div></div>)
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
                        {currentUser ?
                          (
                            <div>
                              {currentUser.publications.includes(publication._id)
                                || currentUser.roles.includes("ROLE_ADMIN")
                                || currentUser.roles.includes("ROLE_MODERATOR") ? (

                                  <div className="d-flex">

                                    <Link
                                      to={"/alls/" + publication._id}
                                    >
                                      <button
                                        type="button"
                                        className="btn btn-outline-dark mb-1"
                                        style={{ fontSize: "14px", height: "30px" }}
                                      >
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
      </div >
    );
  }
}
