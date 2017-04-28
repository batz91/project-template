import { Component } from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import { Camera } from '@ionic-native/camera';

//  FireBase import
import { AngularFire, FirebaseListObservable } from 'angularfire2';


@Component({
  selector: 'page-picture',
  templateUrl: 'picture.html',
})
export class Picture {
  photoTaken: boolean;
  cameraUrl: string;
  photoSelected: boolean;
  allowEdit: boolean;
  userName: string;
  userPhone;
  userEmail;
  user: FirebaseListObservable<any>;

  constructor(private navParams: NavParams, private af: AngularFire, private navCtrl: NavController, private camera: Camera ) {
    this.user = af.database.list('/user');
    this.photoTaken = false;
    this.userName= navParams.get('userName');
    this.userPhone= navParams.get('userPhone');
    this.userEmail= navParams.get('userEmail'); 
  }
  selectFromGallery() {
    var options = {
        quality: 50,
        sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
        destinationType: this.camera.DestinationType.FILE_URI,
        targetWidth: 1000,
        targetHeight: 1000,
        // In this app, dynamically set the picture source, Camera or photo gallery
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE,
        allowEdit: true,
        correctOrientation: true  //Corrects Android orientation quirks
    };
    this.camera.getPicture(options).then((imageData) => {
      this.cameraUrl = imageData;
      this.allowEdit = true;
      this.photoSelected = true;
      this.photoTaken = false;
  }, (err) => {
        console.log(err);
    });
  }

  openCamera() {
    var options = {
      sourceType: this.camera.PictureSourceType.CAMERA,
      destinationType: this.camera.DestinationType.FILE_URI,
      targetWidth: 1000,
      targetHeight: 1000,
    };
    this.camera.getPicture(options).then((imageData) => {
      this.cameraUrl = imageData;
      this.photoTaken = true;
      this.allowEdit = true;
      this.photoSelected = true;
    }, (err) => {
        console.log(err);
    });
  }
//  firebase function
    uploadObj() {
      alert("uploading data");
      var image= this.cameraUrl;
      if(this.cameraUrl == undefined)
        image= "none";
/*
    // upload picture test

    let storageRef = firebase.storage().ref('/userPaychecks/'+this.cameraUrl);
    // Create a timestamp as filename
    const filename = Math.floor(Date.now() / 1000);

    // Create a reference to 'images/todays-date.jpg'
    const imageRef = storageRef.child(`images/${filename}.jpg`);

    imageRef.putString(this.cameraUrl, firebase.storage.StringFormat.DATA_URL).then((snapshot)=> {
     // Do something here when the data is succesfully uploaded!
    });
  */
      this.user.push({ name: this.userName, phone: this.userPhone, email: this.userEmail, paycheck: image});
  }
 
}
