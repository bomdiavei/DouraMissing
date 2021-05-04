import React, { Component } from "react";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";

import UserService from "../services/user.service";

const required = value => {
    if (!value) {
        return (
            <div className="position-absolute m-0" style={{ color: "rgb(230,128,128)", fontSize: "14px" }}>
                Esse campo é obrigatório!
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

export default class Login extends Component {
    constructor(props) {
        super(props);
        this.handleReset = this.handleReset.bind(this);
        this.onChangePassword = this.onChangePassword.bind(this);
        this.onChangePasswordConfirm = this.onChangePasswordConfirm.bind(this);

        this.state = {
            loading: false,
            message: "",
            password: "",
            passwordconfirm: "",
            success: false
        };
    }

    onChangePassword(e) {
        this.setState({
            password: e.target.value,
            message: ""
        });
    }

    onChangePasswordConfirm(e) {
        this.setState({
            passwordconfirm: e.target.value,
            message: ""
        });
    }

    handleReset(e) {
        e.preventDefault();

        this.setState({
            message: "",
            loading: true
        });

        this.form.validateAll();

        if (this.checkBtn.context._errors.length === 0) {

            if (this.state.password !== this.state.passwordconfirm) {
                this.setState({
                    message: "Passwords are different!",
                    loading: false
                });

            } else {
                UserService.resetPassword(this.props.match.params.token, this.state.password).then(
                    response => {
                        this.setState({
                            success: true,
                            loading: false,
                            message: response.data.message
                        });

                        setTimeout(() => {
                            if (window.location.href === `http://localhost:8081/resetpassword/${this.props.match.params.token}`)
                                this.props.history.push(`/login`);
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
                            loading: false,
                            message: resMessage
                        });
                    }
                );
            }


        } else {
            this.setState({
                loading: false
            });
        }
    }

    render() {
        return (
            <div>
                {!this.state.success ?
                    (
                        <div className="d-flex justify-content-center">
                            <div className="align-self-center shadow d-flex justify-content-center" style={{ width: `18rem`, height: `310px` }}>
                                <Form
                                    onSubmit={this.handleReset}
                                    className="d-flex flex-column align-self-center position-relative"
                                    style={{ width: `250px`, height: `310px` }}
                                    ref={d => { this.form = d; }}
                                >
                                    <div className="d-flex flex-column justify-content-end" style={{ height: "70px", width: "250px" }}>
                                        <div style={{ height: "39px", width: "250px" }}>
                                            <Input
                                                type="password"
                                                className="form-control rounded-0 border-top-0 border-right-0 border-left-0 bg-transparent"
                                                style={{ boxShadow: 'none' }}
                                                name="password"
                                                placeholder="Digite sua nova senha"
                                                value={this.state.password}
                                                onChange={this.onChangePassword}
                                                validations={[required, vpassword]}
                                            />
                                        </div>
                                    </div>
                                    <div className="d-flex flex-column justify-content-end" style={{ height: "70px", width: "250px" }}>
                                        <div style={{ height: "39px", width: "250px" }}>
                                            <Input
                                                type="password"
                                                className="form-control rounded-0 border-top-0 border-right-0 border-left-0 bg-transparent"
                                                style={{ boxShadow: 'none' }}
                                                name="passwordconfirm"
                                                placeholder="Digite-a novamente"
                                                value={this.state.passwordconfirm}
                                                onChange={this.onChangePasswordConfirm}
                                                validations={[required, vpassword]}
                                            />
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
                                                    <span>Pronto</span>
                                                )}
                                        </button>
                                    </div>

                                    {this.state.message && (
                                        <div className="m-0 align-self-center" style={{ color: "rgba(240,128,128,0.85)", fontSize: "14px", position: "absolute", top: "205px" }}>
                                            {this.state.message}
                                        </div>
                                    )}

                                    <CheckButton style={{ display: "none" }} ref={d => { this.checkBtn = d; }} />

                                </Form>
                            </div>
                        </div>
                    ) : (
                        <div className="form-group d-flex justify-content-center">
                            <div className="alert alert-success text-center shadow" style={{ width: `27rem` }} role="alert">
                                {this.state.message}
                            </div>
                        </div>
                    )
                }
            </div>
        );
    }
}