const { authJwt } = require("../middlewares");
const controller = require("../controllers/user.controller");

module.exports = function (app) {

  var multer = require('multer')

  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept");
    next();
  });

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, new Date().toISOString() + file.originalname);
    }
  });

  const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };

  var upload = multer({
    storage: storage,
    limits: {
      fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
  })

  app.get("/api/test/all", controller.allAccess);

  app.get("/api/test/allUsers", controller.getAllUsers);

  app.get("/api/test/all/:id", controller.findOnePublication);

  app.put("/api/test/all/:id", upload.single('dogImage'), controller.updatePublication, [authJwt.verifyToken]);

  app.put("/api/test/allNoImage/:id", controller.updatePublicationNoImage, [authJwt.verifyToken]);

  app.delete("/api/test/all/:publicationId/:userId", controller.deletePublication, [authJwt.verifyToken, authJwt.isModerator]);

  app.get("/api/test/mod", [authJwt.verifyToken, authJwt.isModerator], controller.moderatorBoard);

  app.get("/api/test/admin", [authJwt.verifyToken, authJwt.isAdmin], controller.adminBoard);

  app.put("/api/test/publish/:userId", upload.single('dogImage'), controller.publish, [authJwt.verifyToken]);

  app.get("/api/test/profile/:username", controller.getUserAndPublications);

  app.delete("/api/test/user/:id", [authJwt.verifyToken, authJwt.isModerator], controller.deleteUser);

  app.put("/api/test/user/:id", [authJwt.verifyToken], controller.updateUser);

  app.put("/api/test/userImage/:id", upload.single('userImage'), controller.updateUserImage, [authJwt.verifyToken]);

  app.delete("/api/test/mod/:id", [authJwt.verifyToken, authJwt.isAdmin], controller.deleteModerator);

  app.put("/api/test/forgotPassword", controller.forgotPassword);

  app.put("/api/test/resetPassword", controller.resetPassword, [authJwt.verifyToken]);
};
