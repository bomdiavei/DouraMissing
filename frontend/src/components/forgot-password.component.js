import React, { Component } from "react";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";
import { isEmail } from "validator";

import UserService from '../services/user.service'

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
                Email is not valid!
            </div>
        );
    }
};

export default class Login extends Component {
    constructor(props) {
        super(props);
        this.handleEmail = this.handleEmail.bind(this);
        this.onChangeEmail = this.onChangeEmail.bind(this);

        this.state = {
            email: "",
            loading: false,
            message: "",
            emailsent: false
        };
    }

    onChangeEmail(e) {
        this.setState({
            email: e.target.value,
            message: ""
        });
    }

    handleEmail(e) {
        e.preventDefault();

        this.setState({
            message: "",
            loading: true
        });

        this.form.validateAll();

        if (this.checkBtn.context._errors.length === 0) {

            UserService.forgotPassword(this.state.email).then(
                response => {
                    this.setState({
                        message: response.data.message,
                        loading: false,
                        emailsent: true
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
            <div>
                {!this.state.emailsent ?
                    (
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
                                    onSubmit={this.handleEmail}
                                    className="d-flex flex-column align-self-center position-relative"
                                    style={{ width: `250px`, height: `310px` }}
                                    ref={c => {
                                        this.form = c;
                                    }}
                                >

                                    <div className="d-flex flex-column justify-content-end" style={{ height: "160px", width: "250px" }}>
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
                                                placeholder="Digite o seu e-mail"
                                                value={this.state.email}
                                                onChange={this.onChangeEmail}
                                                validations={[required, email]}
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
                                                    <span>Done</span>
                                                )}
                                        </button>
                                    </div>

                                    {this.state.message && (
                                        <div className="m-0 align-self-center" style={{ color: "rgba(240,128,128,0.85)", fontSize: "14px", position: "absolute", top: "205px" }}>
                                            {this.state.message}
                                        </div>
                                    )}

                                    <CheckButton style={{ display: "none" }} ref={c => { this.checkBtn = c; }} />

                                </Form>
                            </div>
                        </div>
                    ) : (
                        <div className="form-group d-flex justify-content-center">
                            <div className="alert alert-success text-center shadow" style={{ width: `27rem` }} role="alert">
                                {this.state.message}
                            </div>
                        </div>
                    )}
            </div>
        );
    }
}
