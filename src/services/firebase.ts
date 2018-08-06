import { Observable } from 'rxjs';
declare var firebase;
export default class FirebaseProvider {
  db = firebase.firestore();
  user: any;
  constructor() {}
  registerWithEmail(email, password, name) {
    return new Promise((resolve, reject) => {
      firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then(() => {
          firebase
            .auth()
            .currentUser.sendEmailVerification()
            .then(() => {
              this.createUser(
                name,
                'https://profile.actionsprout.com/default.jpeg'
              )
                .then(() => {
                  resolve(true);
                })
                .catch(err => {
                  reject(err);
                  this.deleteAccount();
                });
            })
            .catch(err => {
              reject(err);
              this.deleteAccount();
            });
        })
        .catch(err => {
          console.error(err);
          reject('email');
        });
    });
  }
  loginWithEmail(email, password) {
    return new Promise((resolve, reject) => {
      firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then(response => {
          let userdata = JSON.parse(JSON.stringify(response));

          if (userdata.user.emailVerified === true) {
            this.setLoginKey(userdata.user.displayName, userdata.user.uid)
              .then(() => {
                resolve(true);
              })
              .catch(err => {
                console.error(err);
                reject(err);
              });
          } else {
            reject('verify');
          }
        })
        .catch(err => {
          if (err.code === 'auth/wrong-password') {
            reject('password');
          } else if (err.code === 'auth/user-not-found') {
            reject('nouser');
          } else {
            console.error(err.code);
            reject(err);
          }
        });
    });
  }
  createUser(name, displaypic) {
    return new Promise((resolve, reject) => {
      firebase
        .auth()
        .currentUser.updateProfile({
          displayName: name,
          photoURL: displaypic
        })
        .then(() => {
          this.db
            .collection('admins')
            .doc(firebase.auth().currentUser.uid)
            .set({
              uid: firebase.auth().currentUser.uid,
              displayName: name,

              profilephoto: displaypic
            })
            .then(() => {
              resolve(true);
            })
            .catch(err => {
              console.error(err);
              reject(err);
            });
        })
        .catch(err => {
          console.error(err);
          reject(err);
        });
    });
  }
  setLoginKey(name, uid) {
    return new Promise((resolve, reject) => {
      window.localStorage
        .set('user-live-help', {
          name: name,
          uid: uid
        })
        .then(() => {
          this.user = uid;
          resolve(true);
        })
        .catch(err => {
          console.error(err);
          reject(err);
        });
    });
  }
  getLoginKey() {
    return new Promise((resolve, reject) => {
      if (this.user) {
        resolve(this.user);
      } else {
        window.localStorage
          .get('user-live-help')
          .then(user => {
            if (user) {
              this.user = user.uid;
              resolve(user.uid);
            } else {
              reject('No User');
            }
          })
          .catch(err => {
            reject(err);
          });
      }
    });
  }
  logout() {
    return new Promise((resolve, reject) => {
      firebase
        .auth()
        .signOut()
        .then(() => {
          window.localStorage
            .remove('user-live-help')
            .then(() => {
              this.user = null;
              resolve(true);
            })
            .catch(err => {
              reject(err);
              console.error(err);
            });
        })
        .catch(err => {
          reject(err);
          console.error(err);
        });
    });
  }
  deleteAccount() {
    return new Promise((resolve, reject) => {
      firebase
        .auth()
        .currentUser.delete()
        .then(() => {
          resolve(true);
        })
        .catch(err => {
          reject(err);
          console.error(err);
        });
    });
  }
  getUserDetails() {
    return new Observable(observer => {
      this.getLoginKey()
        .then((user: any) => {
          this.db
            .collection('admins')
            .doc(user)
            .onSnapshot(
              doc => {
                observer.next(doc.data());
              },
              err => {
                if (err.name == 'FirebaseError') {
                  observer.error('permission');
                } else {
                  observer.error(err);
                }
              }
            );
        })
        .catch(() => {
          observer.error('login');
        });
    });
  }
  sendVerificationEmail() {
    return new Promise((resolve, reject) => {
      firebase
        .auth()
        .currentUser.sendEmailVerification()
        .then(() => {
          resolve(true);
        })
        .catch(err => {
          reject(err);
        });
    });
  }
  sendPasswordResetEmail(email) {
    return new Promise((resolve, reject) => {
      firebase
        .auth()
        .sendPasswordResetEmail(email)
        .then(() => {
          resolve(true);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  initiateHelpRequest(id, msg) {
    return new Promise((resolve, reject) => {
      this.db
        .collection('helpmessages')
        .doc(id)
        .set({
          id: id,
          message: msg.message,
          pending: true,
          open: true,
          date: firebase.firestore.Timestamp.now()
        })
        .then(() => {
          this.db
            .collection('helpmessages')
            .doc(id)
            .collection('messages')
            .add({
              message: msg.message,
              from: msg.from,
              date: firebase.firestore.Timestamp.now()
            })
            .then(() => {
              resolve(true);
            })
            .catch(err => {
              console.error(err);
              reject(err);
            });
        })
        .catch(err => {
          console.error(err);
          reject(err);
        });
    });
  }
  sendIssue(id, msg) {
    return new Promise((resolve, reject) => {
      this.db
        .collection('helpmessages')
        .doc(id)
        .collection('messages')
        .add({
          message: msg.message,
          from: msg.from,
          date: firebase.firestore.Timestamp.now()
        })
        .then(() => {
          resolve(true);
        })
        .catch(err => {
          console.error(err);
          reject(err);
        });
    });
  }
  getInitialMessages() {
    return new Observable(observer => {
      this.db
        .collection('helpmessages')
        .where('pending', '==', 'true')
        .orderBy('date', 'asc')
        .onSnapshot(
          res => {
            observer.next(res.docs.map(doc => doc.data()));
          },
          err => {
            observer.error(false);
            console.error(err);
          }
        );
    });
  }
  initiateHelpResponse(id, uid, msg) {
    return new Promise((resolve, reject) => {
      this.db
        .collection('helpmessages')
        .doc(id)
        .collection('messages')
        .add({
          message: msg.message,
          from: uid,
          date: firebase.firestore.Timestamp.now()
        })
        .then(() => {
          resolve(true);
        })
        .catch(err => {
          console.error(err);
          reject(err);
        });
    });
  }
  getHelpResponseMessages(id) {
    return new Observable(observer => {
      this.db
        .collection('helpmessages')
        .doc(id)
        .collection('messages')
        .orderBy('date', 'asc')
        .onSnapshot(
          res => {
            observer.next(res.docs.map(doc => doc.data()));
          },
          err => {
            observer.error(false);
            console.error(err);
          }
        );
    });
  }
}
