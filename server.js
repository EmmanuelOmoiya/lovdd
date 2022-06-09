const express = require("express");
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
  const bodyParser = require('body-parser');
  const mongoose = require('mongoose');
  const db = require('./config/db').uri
var user = require("./model/user.js");
const generateToken = require('./config/generateToken');

mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true}).then(() => console.log("Mongo Database successfully connected"))
.catch(err => console.log(err));


app.use(cors());
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: false
}));

app.use("/", (req, res, next) => {
  try {
    if (req.path == "/login" || req.path == "/register" || req.path == "/") {
      next();
    } else {
      /* decode jwt token if authorized*/
      jwt.verify(req.headers.token, 'shhhhh11111', function (err, decoded) {
        if (decoded && decoded.user) {
          req.user = decoded;
          next();
        } else {
          return res.status(401).json({
            errorMessage: 'User unauthorized!',
            status: false
          });
        }
      })
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
})

app.get("/", (req, res) => {
  res.status(200).json({
    status: true,
    title: 'Apis'
  });
});

/* login api */
app.post("/login",async (req, res) => {
    const {email, password} = req.body;
    const uer = await user.findOne({email});
          if (uer && (uer.matchPassword(password))) {
            res.json({
              _id: uer._id,
              fullName: uer.fullName,
              email: uer.email,
              password: uer.password,
              role: uer.role,
                farmName: uer.farmName,
              img: uer.img,
              token: generateToken(uer._id),
            })
          } else {
          res.status(400).json({
            errorMessage: 'Email or password is incorrect!',
            status: false
          });
        }

});

/* register api */
app.post("/register", (req, res) => {
  try {
    if (req.body && req.body.email && req.body.password) {

      user.find({ email: req.body.email }, (err, data) => {

        if (data.length == 0) {

          let User = new user({
            email: req.body.email,
            password: req.body.password,
            fullName: req.body.fullName,
            role: req.body.role,
            farmName: req.body.farmName
          });
          User.save((err, data) => {
            if (err) {
              res.status(400).json({
                errorMessage: err,
                status: false
              });
            } else {
              res.status(200).json({
                _id: user._id,
            fullName: data.fullName,
            email: data.email,
            password: data.password,
            img: data.img,
            role: data.role,
            farmName: data.farmName,
            token: generateToken(data._id),
                status: true,
                title: 'Registered Successfully.'
              });
            }
          });

        } else {
          res.status(400).json({
            errorMessage: `Email ${req.body.email} Already Exist!`,
            status: false
          });
        }

      });

    } else {
      res.status(400).json({
        errorMessage: 'Add proper parameter first!',
        status: false
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});

function checkUserAndGenerateToken(data, req, res) {
  jwt.sign({ user: data.email, id: data._id }, 'shhhhh11111', { expiresIn: '1d' }, (err, token) => {
    if (err) {
      res.status(400).json({
        status: false,
        errorMessage: err,
      });
    } else {
      res.json({
        message: 'Login Successfully.',
        token: token,
        status: true
      });
    }
  });
}

app.listen(2000, () => {
  console.log("Server is Runing On port 2000");
});