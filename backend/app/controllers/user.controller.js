const db = require("../models");
const User = db.user;
const Publication = db.publication;
const config = require("../config/auth.config");
var jwt = require("jsonwebtoken");

const ObjectID = require('mongodb').ObjectID;
const fs = require('fs');

var nodemailer = require('nodemailer');
var bcrypt = require("bcryptjs");


exports.allAccess = (req, res) => {
  if (req.query.status === "missing" || req.query.status === "found") {

    var statusBool = false;
    if (req.query.status === "found")
      statusBool = true;

    const dogname = req.query.dogname;
    var condition = dogname ? {
      dogname: { $regex: new RegExp(dogname), $options: "i" }, status: statusBool
    } : { status: statusBool };

    Publication.find(condition)
      .then(data => {
        res.status(200).send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving publication(s)."
        });
      });
  }
  else {
    const dogname = req.query.dogname;
    var condition = dogname ? {
      dogname: { $regex: new RegExp(dogname), $options: "i" }
    } : {};

    Publication.find(condition)
      .then(data => {
        res.status(200).send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving publication(s)."
        });
      });
  }

};

exports.findOnePublication = (req, res) => {
  User.find(
    { publications: req.params.id },
    {
      roles: 0,
      publications: 0,
      email: 0,
      password: 0,
      __v: 0
    }
  ).then(user => {
    //console.log(user);
    if (!user.length) {
      res.status(404).send({
        message: `There's no User with such PublicationId=${req.params.id}`
      });
    } else {
      Publication.findById(
        req.params.id,
        (err, result) => {
          if (err) {
            res.send(err);
          } else {
            var data = {
              _id: result._id,
              dogname: result.dogname,
              description: result.description,
              status: result.status,
              dogImage: result.dogImage,
              __v: result.__v,
              ownerId: user[0]._id,
              username: user[0].username,
              userImage: user[0].userImage
            };
            //console.log(`>> UserId - ${data.ownerId}`);
            res.send(data);
          }
        })
    }
  });
};

exports.adminBoard = (req, res) => {

  User.find()
    .populate("roles", "-__v")
    .exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (!user) {
        return res.status(404).send({ message: "No user found." });
      }

      var users = []

      for (let i = 0; i < user.length; i++) {
        if (user[i].roles.length != 2) {
          continue;
        }
        else {
          users.push(
            {
              id: user[i]._id,
              username: user[i].username,
              userImage: user[i].userImage
            });
        }
      }

      res.status(200).send({
        user: users
      });
    });
};

exports.moderatorBoard = (req, res) => {

  User.find()
    .populate("roles", "-__v")
    .exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (!user) {
        return res.status(404).send({ message: "No user found." });
      }

      var users = []

      for (let i = 0; i < user.length; i++) {

        if (user[i].roles.length > 1) {
          continue;
        }
        else {
          users.push(
            {
              username: user[i].username,
              id: user[i]._id,
              userImage: user[i].userImage
            });
        }
      }

      res.status(200).send({
        user: users
      });
    });
};

exports.publish = (req, res) => {
  if (!req.body) {
    res.status(400).send({ message: "The publication cannot be empty!" });
  }

  const publication = new Publication({
    _id: new ObjectID(),
    dogname: req.body.dogname,
    description: req.body.description,
    status: false,
    dogImage: "http://localhost:8080/" + req.file.path
  });

  Publication.create(publication).then(docPublication => {
    //console.log("\n>> Created Publication:\n", docPublication);
    User.findByIdAndUpdate(
      req.params.userId,
      {
        $push: {
          publications: {
            _id: docPublication._id,
            dogname: docPublication.dogname,
            description: docPublication.description,
            status: false,
            dogImage: docPublication.dogImage
          }
        }
      },
      { new: true, useFindAndModify: false })
      .populate("roles", "-__v")
      .exec((err, user) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        if (!user) {
          return res.status(404).send({ message: "User not found!" });
        }

        var token = jwt.sign({ id: user.id }, config.secret, {
          expiresIn: 86400 // 24 hours
        });

        var authorities = [];

        for (let i = 0; i < user.roles.length; i++) {
          authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
        }

        var posts = [];

        for (let i = 0; i < user.publications.length; i++) {
          posts.push(user.publications[i].toString());
        }

        res.status(200).send({
          id: user._id,
          username: user.username,
          email: user.email,
          roles: authorities,
          publications: posts,
          accessToken: token,
          message: "Published!"
        });
      });
  });

};

exports.updatePublication = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data cannot be empty!"
    });
  }

  const id = req.params.id;

  const publication = new Publication({
    _id: id,
    dogname: req.body.dogname,
    description: req.body.description,
    status: req.body.status,
    dogImage: "http://localhost:8080/" + req.file.path
  });

  Publication.findByIdAndUpdate(id, publication, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Not Found: Unable to update publication with id=${id}!`
        });
      } else {
        var str = data.dogImage;
        str = str.replace('http://localhost:8080/', '');

        fs.unlink(str, (err) => {
          if (err) throw err;
        });
        res.send({ message: "Publication updated successfully!" });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating publication with id=" + id
      });
    });
};

exports.updatePublicationNoImage = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data cannot be empty!"
    });
  }

  const id = req.params.id;

  Publication.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Not Found: Unable to update publication with id=${id}!`
        });
      } else res.send({ message: "Publication updated successfully!" });
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating publication with id=" + id
      });
    });
};

exports.deletePublication = (req, res) => {

  if (!req.params.publicationId || !req.params.userId) {
    res.status(400).send(
      { message: `You must provide a publicationId: ${req.params.publicationId} and an userId: ${req.params.userId}!` });
  }

  Publication.findByIdAndDelete({ _id: req.params.publicationId }).then(data => {
    if (!data) {
      res.status(404).send({
        message: `Cannot delete Publication with id=${req.params.publicationId}. Maybe Publication was not found!`
      });
    } else {
      User.findByIdAndUpdate(//filter, update, options, callback
        req.params.userId,
        { $pullAll: { publications: [req.params.publicationId] } },
        { new: true, useFindAndModify: false }
      )
        .populate("roles", "-__v")
        .exec((err, user) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          if (!user) {
            return res.status(404).send({ message: "User Not found (For LocalStorage)." });
          }

          var str = data.dogImage;
          str = str.replace('http://localhost:8080/', '');

          fs.unlink(str, (err) => {
            if (err) throw err;
          });

          var token = jwt.sign({ id: user.id }, config.secret, {
            expiresIn: 86400 // 24 hours
          });

          var authorities = [];

          for (let i = 0; i < user.roles.length; i++) {
            authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
          }

          var posts = [];

          for (let i = 0; i < user.publications.length; i++) {
            posts.push(user.publications[i].toString());
          }

          res.status(200).send({
            id: user._id,
            username: user.username,
            email: user.email,
            roles: authorities,
            publications: posts,
            accessToken: token,
            message: "Deleted successfully."
          });
        });
    }
  });

};

exports.getAllUsers = (req, res) => {

  const username = req.query.username;
  var condition = username ? { username: { $regex: new RegExp(username), $options: "i" } } : {};

  User.find(condition)
    .then(data => {
      res.status(200).send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving user(s)."
      });
    });
};

exports.getUserAndPublications = (req, res) => {
  if (!req.params.username) {
    res.status(400).send(
      { message: `You must provide a username: ${req.params.username}!` });
  }

  User.find({ username: req.params.username })
    .populate("publications", "-__v")
    .populate("roles", "-__v")
    .exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      var authorities = [];

      for (let i = 0; i < user[0].roles.length; i++) {
        authorities.push("ROLE_" + user[0].roles[i].name.toUpperCase());
      }

      var posts = [];

      for (let i = 0; i < user[0].publications.length; i++) {
        posts.push({
          _id: user[0].publications[i]._id,
          dogname: user[0].publications[i].dogname,
          description: user[0].publications[i].description,
          status: user[0].publications[i].status,
          dogImage: user[0].publications[i].dogImage
        });
      }

      res.status(200).send({
        user: {
          id: user[0]._id,
          username: user[0].username,
          roles: authorities,
          email: user[0].email,
          userImage: user[0].userImage
        },
        publications: posts
      });
    });

};

exports.deleteUser = (req, res) => {
  if (!req.params.id) {
    return res.status(400).send({ message: "Bad request: You must provide an id" });
  }

  User.findOneAndDelete({ _id: req.params.id }).then(data => {
    if (!data) {
      res.status(404).send({
        message: `Not found: cannot delete user with id=${req.params.id}`
      });
    } else {
      Publication.deleteMany({
        _id: {
          $in: data.publications
        }
      }, (err) => {
        if (err) {
          res.send(err);
        } else {
          res.status(200).send({ message: "OK: deleted successfully." });
        }
      });
    }
  });
}

exports.deleteModerator = (req, res) => {
  if (!req.params.id) {
    return res.status(400).send({ message: "Bad request: You must provide an id" });
  }

  User.findOneAndDelete({ _id: req.params.id }).then(data => {
    if (!data) {
      res.status(404).send({
        message: `Not found: cannot delete moderator with id=${req.params.id}`
      });
    } else {
      Publication.deleteMany({
        _id: {
          $in: data.publications
        }
      }, (err) => {
        if (err) {
          res.send(err);
        } else {
          res.status(200).send({ message: "OK: deleted successfully." });
        }
      });
    }
  });
}

exports.updateUser = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Bad Request: data to update can't be empty"
    });
  }

  User.findByIdAndUpdate(req.params.id, req.body, { useFindAndModify: false, new: true })
    .populate("roles", "-__v")
    .exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      var authorities = [];

      for (let i = 0; i < user.roles.length; i++) {
        authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });

      res.status(200).send({
        user: {
          accessToken: token,
          id: user._id,
          username: user.username,
          roles: authorities,
          email: user.email,
          publications: user.publications
        }
      });
    });
};

exports.updateUserImage = (req, res) => {

  if (!req.body) {
    fs.unlink(req.file.path, (err) => {
      if (err) throw err;
    });
    return res.status(400).send({
      message: "Bad Request: data to update can't be empty"
    });
  }

  if (req.body.userOldImage !== "http://localhost:8080/uploads/manTest.jpg") {
    var str = req.body.userOldImage;
    str = str.replace('http://localhost:8080/', '');

    fs.unlink(str, (err) => {
      if (err) throw err;
    });
  }

  User.find({ _id: req.params.id }).then(userFind => {
    if (!userFind.length) {
      fs.unlink(req.file.path, (err) => {
        if (err) throw err;
      });
      res.status(404).send({
        message: `There's no User with such id=${req.params.id}`
      });
    } else {
      const userParam = {
        _id: req.params.id,
        username: userFind[0].username,
        email: userFind[0].email,
        password: userFind[0].password,
        userImage: "http://localhost:8080/" + req.file.path,
        roles: userFind[0].roles,
        publications: userFind[0].publications
      };

      User.findByIdAndUpdate(req.params.id, userParam, { useFindAndModify: false, new: true })
        .populate("roles", "-__v")
        .exec((err, user) => {
          if (err) {
            fs.unlink(req.file.path, (err) => {
              if (err) throw err;
            });
            res.status(500).send({ message: err });
            return;
          }

          if (!user) {
            fs.unlink(req.file.path, (err) => {
              if (err) throw err;
            });
            return res.status(404).send({ message: "User Not found." });
          }

          var authorities = [];

          for (let i = 0; i < user.roles.length; i++) {
            authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
          }

          var token = jwt.sign({ id: user.id }, config.secret, {
            expiresIn: 86400 // 24 hours
          });

          const userRes = {
            accessToken: token,
            id: user._id,
            username: user.username,
            userImage: user.userImage,
            roles: authorities,
            email: user.email,
            publications: user.publications
          }

          res.status(200).send({
            message: "User updated successfully!",
            user: userRes
          });
        });
    }
  });

};

exports.forgotPassword = (req, res) => {
  if (!req.query) {
    return res.status(400).send({
      message: "Bad Request: data can't be empty"
    });
  }

  User.find({ email: req.query.email }).then(userFind => {

    if (!userFind.length) {
      res.status(404).send({
        message: `There's no user with such e-mail=${req.query.email}`
      });
    } else {

      var token = jwt.sign({ id: userFind[0].id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });

      const userParam = {
        _id: userFind[0].id,
        username: userFind[0].username,
        email: userFind[0].email,
        password: userFind[0].password,
        userImage: userFind[0].userImage,
        roles: userFind[0].roles,
        publications: userFind[0].publications,
        resetPasswordToken: token
      };


      User.findByIdAndUpdate(userFind[0].id, userParam, { useFindAndModify: false, new: true },
        (err, result) => {
          if (err) {
            return res.status(500).send({
              message: "Server Error"
            });
          } else {
            // Create the transporter with the required configuration for Hotmail
            var transporter = nodemailer.createTransport({
              service: "hotmail",
              auth: {
                user: "TYPE_YOUR_ORIGIN_EMAIL_HERE@hotmail.com",
                pass: "TYPE_YOUR_ORIGIN_EMAIL_PASSWORD_HERE"
              }
            });

            // setup e-mail data, even with unicode symbols
            var mailOptions = {
              from: '"DouraMissing " <TYPE_YOUR_ORIGIN_EMAIL_HERE>', // sender address (who sends)
              to: req.query.email, //'boatardevei@gmail.com', //, mymail2@mail.com', // list of receivers (who receives)
              subject: 'Password recovery ', // Subject line
              text: 'Password recovery link ', // plaintext body
              html: 'Hello ' + result.username + ', link to recover the password below:<br><br><b>http://localhost:8081/resetpassword/' + result.resetPasswordToken + '</b>' // html body
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                return res.status(500).send({
                  message: error
                });
              }
              res.status(200).send({
                message: "We sent you an email!"//'Message sent: '// + info.response
              });
              //console.log('Message sent: ' + info.response);
            });
          }
        })


    }

  });

};

exports.resetPassword = (req, res) => {

  if (!req.body) {
    return res.status(400).send({
      message: "Bad Request: data can't be empty"
    });
  }

  User.findOneAndUpdate(
    { resetPasswordToken: req.body.token },
    { password: bcrypt.hashSync(req.body.newpassword, 8), resetPasswordToken: "" },
    { useFindAndModify: false, new: true }
  ).then(

    userFind => {
      if (!userFind) {
        res.status(404).send({
          message: 'Invalid link!'
        });
      } else {
        res.status(200).send({
          message: "Password changed successfully!"
        })
      }
    }

  );
}
