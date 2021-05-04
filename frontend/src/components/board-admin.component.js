import React, { Component } from "react";
import { Link } from "react-router-dom";

import UserService from "../services/user.service";

export default class BoardAdmin extends Component {
  constructor(props) {
    super(props);

    this.state = {
      content: []
    };
  }

  componentDidMount() {
    UserService.getAdminBoard().then(
      response => {
        this.setState({
          content: response.data.user
        });
      },
      error => {
        this.setState({
          content:
            (error.response &&
              error.response.data &&
              error.response.data.message) ||
            error.message ||
            error.toString()
        });
      }
    );
  }

  deletingModerator(id) {
    UserService.deleteModerator(id).then(
      () => {
        window.location.reload()
      },
      error => {
        console.log(
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString()
        )
      }
    );
  }

  render() {
    return (
      <div>
        {this.state.content.length ?
          (
            <div className="d-flex">
              {this.state.content.map((moderator, index) => (
                <div key={index} className="p-0 my-2 mx-4 d-flex flex-column justify-content-top shadow" style={{ height: "230px", maxWidth: `210px` }}>
                  <Link
                    to={`/profile/${moderator.username}`}
                    className="badge badge-light p-0"
                  >
                    <img src={moderator.userImage} alt="..." style={{ height: `150px`, width: `150px`, objectFit: "cover" }} />
                  </Link>
                  <Link
                    to={`/profile/${moderator.username}`}
                    style={{ textDecorationColor: "black" }}
                    className="align-self-center text-break"
                  >
                    <h5 style={{ color: "black" }}><b>{moderator.username}</b></h5>
                  </Link>
                  <button
                    className="btn btn-outline-danger mx-2 align-self-center"
                    style={{ width: "80px", height: "38" }}
                    onClick={() => { this.deletingModerator(moderator.id) }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="container">
              <div className="jumbotron shadow m-2">
                <h3 className="text-center text-muted">There is no moderator</h3>
              </div>
            </div>
          )
        }
      </div>
    );
  }
}
