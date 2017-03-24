'use strict';

const _ = require('lodash');
const JsonStore = require('./json-store');
var fs = require("fs-extra");

const pictureStore = {

  store: new JsonStore('./models/picture-store.json', { pictures: [] }),
  collection: 'pictures',
  pictureFolder: 'models/pictures/',
  path: '',

  init() {
    fs.ensureDirSync('./' + this.pictureFolder);
    let fullpath = __dirname.split('/');
    fullpath.pop();
    this.path = fullpath.join('/') + '/' + this.pictureFolder;
  },

  getAlbum(userid) {
    if (!this.path) {
      this.init();
    }
    return this.store.findOneBy(this.collection, { userid: userid });
  },

  storePicture(userId, imageFile) {
    if (!this.path) {
      this.init();
    }
    fs.ensureDirSync(this.pictureFolder + userId);
    const imgFullPath = this.pictureFolder + '/' + userId + '/' + imageFile.name;;
    imageFile.mv(imgFullPath, function (err) {
      if (err) {
        console.log('error saving picture');
      }
    });
  },

  addPicture(userId, title, imageFile) {
    this.storePicture(userId, imageFile);
    let album = this.getAlbum(userId);
    if (!album) {
      album = {
        userid: userId,
        pictures: [],
      };
      this.store.add(this.collection, album);
    }

    const picture = {
      title: title,
      img: '/' + userId + '/' + imageFile.name,
      file: imageFile.name,
    }
    album.pictures.push(picture);
  },

  getPicturePath(id, name) {
    if (!this.path) {
      this.init();
    }
    return this.path + id + '/' + name;
  },

  deleteAllPictures() {
    fs.removeSync(this.pictureFolder);
    this.store.removeAll(this.collection);
  },

  deletePicture(userId, fileName) {
    let album = this.getAlbum(userId);
    _.remove(album.pictures, { file: fileName});

    fs.removeSync(this.getPicturePath(userId, fileName));
  }
};

module.exports = pictureStore;
