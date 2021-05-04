import React, { Component } from "react";
import UserService from "../services/user.service";
import AuthService from "../services/auth.service";

import Form from "react-validation/build/form";
import TextArea from "react-validation/build/textarea";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";

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
            <div className="position-absolute m-0" style={{ bottom: "28px", left: "170px", color: "rgb(230,128,128)", fontSize: "14px" }}>
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

export default class PublicationEdit extends Component {
    constructor(props) {
        super(props);
        this.onChangeDogName = this.onChangeDogName.bind(this);
        this.onChangeDescription = this.onChangeDescription.bind(this);
        this.getPublication = this.getPublication.bind(this);
        this.updateStatus = this.updateStatus.bind(this);
        this.updatingPublication = this.updatingPublication.bind(this);
        this.deletingPublication = this.deletingPublication.bind(this);
        this.onChangeDogImage = this.onChangeDogImage.bind(this);

        this.state = {
            currentUser: AuthService.getCurrentUser(),
            currentPublication: {
                _id: null,
                dogname: "",
                description: "",
                ownerId: null,
                status: false,
                dogImage: null,
                dogURL: null,
                successful: false,
                message: "",
                dogImageEditIsShown: false
            },
            message: ""
        };
    }

    componentDidMount() {
        this.getPublication(this.props.match.params.id);
    }

    onChangeDogName(e) {
        const dogname = e.target.value;

        this.setState(function (prevState) {
            return {
                currentPublication: {
                    ...prevState.currentPublication,
                    dogname: dogname
                }
            };
        });
    }

    onChangeDescription(e) {
        const description = e.target.value;

        this.setState(prevState => ({
            currentPublication: {
                ...prevState.currentPublication,
                description: description
            }
        }));
    }

    onChangeDogImage(e) {
        if (e.target.files[0]) {
            this.setState({
                dogImage: e.target.files[0],
                dogURL: URL.createObjectURL(e.target.files[0])
            });
        }
    }

    getPublication(_id) {
        UserService.getPublicContentById(_id)
            .then(response => {
                this.setState({
                    currentPublication: response.data,
                    dogURL: response.data.dogImage
                });
                //console.log("ownerId: " + response.data.ownerId + " - _id: " + response.data._id);
            })
            .catch(e => {
                console.log(e);
            });
    }

    updateStatus(status) {

        if (this.state.dogImage) {
            var data = new FormData();
            data.append('_id', this.state.currentPublication._id);
            data.append('dogname', this.state.currentPublication.dogname);
            data.append('description', this.state.currentPublication.description);
            data.append('status', status);
            data.append('dogImage', this.state.dogImage);

            UserService.updatePublication(this.state.currentPublication._id, data)
                .then(() => {
                    this.setState(prevState => ({
                        currentPublication: {
                            ...prevState.currentPublication,
                            status: status
                        },
                    }));
                })
                .catch(e => {
                    console.log(e);
                });
        } else {
            var dataNoImage =
            {
                _id: this.state.currentPublication._id,
                dogname: this.state.currentPublication.dogname,
                description: this.state.currentPublication.description,
                status: status,
                dogImage: this.state.currentPublication.dogImage
            }

            UserService.updatePublicationNoImage(this.state.currentPublication._id, dataNoImage)
                .then(() => {
                    this.setState(prevState => ({
                        currentPublication: {
                            ...prevState.currentPublication,
                            status: status
                        },
                    }));
                })
                .catch(e => {
                    console.log(e);
                });
        }

    }

    updatingPublication(e) {

        e.preventDefault();

        this.setState({
            message: "",
            successful: false
        });

        this.form.validateAll();

        if (this.checkBtn.context._errors.length === 0) {
            if (this.state.dogImage) {

                var data = new FormData();
                data.append('_id', this.state.currentPublication._id);
                data.append('dogname', this.state.currentPublication.dogname);
                data.append('description', this.state.currentPublication.description);
                data.append('status', this.state.currentPublication.status);
                data.append('dogImage', this.state.dogImage);

                UserService.updatePublication(
                    this.state.currentPublication._id,
                    data
                )
                    .then(
                        response => {
                            this.setState({
                                message: response.data.message,
                                successful: true
                            });
                            setTimeout(() => {
                                if (window.location.href === `http://localhost:8081/alls/${this.state.currentPublication._id}`)
                                    this.props.history.push(`/home/${this.state.currentPublication._id}`);
                            }, 5000)
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
            } else {
                var dataNoImage =
                {
                    _id: this.state.currentPublication._id,
                    dogname: this.state.currentPublication.dogname,
                    description: this.state.currentPublication.description,
                    status: this.state.currentPublication.status,
                    dogImage: this.state.currentPublication.dogImage
                }

                UserService.updatePublicationNoImage(this.state.currentPublication._id, dataNoImage)
                    .then(
                        response => {
                            this.setState({
                                message: response.data.message,
                                successful: true
                            });
                            setTimeout(() => {
                                if (window.location.href === `http://localhost:8081/alls/${this.state.currentPublication._id}`)
                                    this.props.history.push(`/home`);
                            }, 5000)
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
    }

    deletingPublication() {
        UserService.deletePublication(
            this.state.currentPublication._id,
            this.state.currentPublication.ownerId,
            this.state.currentUser.id
        )
            .then(() => {
                this.props.history.push('/home');
            })
            .catch(e => {
                console.log(e);
            });
    }

    render() {
        const { currentUser, currentPublication } = this.state;

        return (
            <div>
                {!this.state.successful && (
                    <div>
                        {currentPublication && currentUser ? (
                            <div>
                                {currentUser.publications.includes(currentPublication._id)
                                    || currentUser.roles.includes("ROLE_ADMIN")
                                    || currentUser.roles.includes("ROLE_MODERATOR") ? (
                                        <div className="position-relative">
                                            <Form className="edit-form d-flex flex-column m-0" onSubmit={this.updatingPublication} ref={c => { this.form = c; }}>

                                                <div className="align-self-center shadow" style={{ width: `27rem`, height: `450px` }}>
                                                    <div className="d-flex justify-content-center" style={{ height: "243px" }}>
                                                        <div className="m-0 position-absolute p-0 align-self-end" style={{ width: "27rem", backgroundColor: currentPublication.status ? ("rgba(0, 255, 0, 0.7)") : ("rgba(255, 0, 0, 0.7)") }}>
                                                            <p className="text-center text-white m-auto"><b>{currentPublication.status ? "Encontrado" : "Desaparecido"}</b></p>
                                                        </div>
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
                                                                <img src={this.state.dogURL} className="card-img-top align-self-center img-fluid" style={{ objectFit: "cover", width: "27rem", height: "219px" }} alt="..." />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="form-group m-0 position-relative">
                                                        <Input
                                                            type="text"
                                                            className="form-control mt-1 h-auto border-0"
                                                            style={{ fontSize: "21px" }}
                                                            name="dogname"
                                                            placeholder="Digite o nome do animal..."
                                                            value={currentPublication.dogname}
                                                            onChange={this.onChangeDogName}
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
                                                            value={currentPublication.description}
                                                            onChange={this.onChangeDescription}
                                                            validations={[required, vdescription]}
                                                        />
                                                    </div>
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

                                            <div
                                                className="p-0 position-absolute"
                                                style={{ width: `112px`, left: "660px", bottom: "40px" }}
                                            >
                                                <button
                                                    className="btn btn-outline-danger"
                                                    style={{ width: "112px", height: "38" }}
                                                    onClick={this.deletingPublication}
                                                >
                                                    Delete
                                                </button>

                                            </div>
                                            <div
                                                className="p-0 position-absolute"
                                                style={{ width: `112px`, left: "339px", bottom: "40px" }}
                                            >
                                                {currentPublication.status ?
                                                    (
                                                        <button
                                                            className="btn btn-outline-secondary"
                                                            style={{ width: "112px", height: "38" }}
                                                            onClick={() => this.updateStatus(false)}
                                                        >
                                                            It disappeared
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="btn btn-outline-success"
                                                            style={{ width: "112px", height: "38" }}
                                                            onClick={() => this.updateStatus(true)}
                                                        >
                                                            Found it
                                                        </button>
                                                    )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="form-group d-flex justify-content-center">
                                            <div
                                                className="alert alert-danger text-center shadow"
                                                style={{ width: `27rem` }}
                                                role="alert"
                                            >
                                                Log in and click on a publication that you are allowed to modify
                                        </div>
                                        </div>
                                    )}
                            </div>
                        ) : (
                                <div className="form-group d-flex justify-content-center">
                                    <div
                                        className="alert alert-danger text-center shadow"
                                        style={{ width: `27rem` }}
                                        role="alert"
                                    >
                                        Log in and click on a publication that you are allowed to modify
                                    </div>
                                </div>
                            )}
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