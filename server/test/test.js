import io from 'socket.io-client';
import randomstring from 'randomstring';

const assert = require('assert');
const serverAddress = 'http://localhost:5000';

/**
 * Returns a promise that resolves the connection socket
 * @param {*} room 
 * @param {*} name 
 * @returns {Promise} Resolves a promise that returns the socket
 */
function generateAndAssertConnection(room, username) {
  return new Promise((resolve, reject) => {
    const client = io.connect(serverAddress, { query: { room, username } });
    client.on('auth', data => {
      assert.equal(data.success, true);
      resolve(client);
    });  
  });
}

describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal(-1, [1,2,3].indexOf(4));
    });
  });
});

describe('Socket.io', () => {

  describe('connection', () => {
    it('should connect to a room', done => {
      const client1 = io.connect(serverAddress, {
        query: {
          room: 'testroom1',
          username: 'testUserA',
        }
      });
      client1.on('auth', data => {
        assert.equal(data.success, true);
        client1.disconnect();   
        done();             
      });
    });

    it('should be unable to connect when a user already exists in the room', done => {
      const client1 = io.connect(serverAddress, {
        query: {
          room: 'testroom1',
          username: 'testUserA',
        }
      });
      client1.on('auth', data => {
        assert.equal(data.success, true);
        let client2 = io.connect(serverAddress, {
          query: {
            room: 'testroom1',
            username: 'testUserA',
          }
        });
        client2.on('auth', data => {
          assert.equal(data.success, false);
          client1.disconnect();
          client2.disconnect();
          done();
        });
      });
    });

    it('should be able to connect multiple clients to the same room with different names', done => {
      let a, b, c = false;
      const client1 = io.connect(serverAddress, {
        query: {
          room: 'testroom1',
          username: 'testUserD',
        }
      });
      client1.on('auth', data => {
        assert.equal(data.success, true);
        a = true;
      });

      const client2 = io.connect(serverAddress, {
        query: {
          room: 'testroom1',
          username: 'testUserE',
        }
      });
      client2.on('auth', data => {
        assert.equal(data.success, true);
        b = true;  
      });


      const client3 = io.connect(serverAddress, {
        query: {
          room: 'testroom1',
          username: 'testUserF',
        }
      });
      client3.on('auth', data => {
        assert.equal(data.success, true);
        c = true;
      });

      let interval = setInterval(() => {
        if (a && b && c) {
          client1.disconnect();
          client2.disconnect();
          client3.disconnect();
          clearInterval(interval);
          done();
        }
      }, 300);
    });

    it('should be able to connect to different rooms with the same username', done => {
      let clientA, clientB, clientC;
      const promiseA = new Promise((resolve, reject) => {
        clientA = io.connect(serverAddress, {
          query: {
            room: 'bathroom',
            username: 'userA',
          }
        });
        clientA.on('auth', data => {
          assert.equal(data.success, true);
          resolve(true);
        });
      });

      const promiseB = new Promise((resolve, reject) => {
        clientB = io.connect(serverAddress, {
          query: {
            room: 'restroom',
            username: 'userA',
          }
        });
        clientB.on('auth', data => {
          assert.equal(data.success, true);
          resolve(true);
        });  
      });

      const promiseC = new Promise((resolve, reject) => {
        clientC = io.connect(serverAddress, {
          query: {
            room: 'dining room',
            username: 'userA',
          }
        });
        clientC.on('auth', data => {
          assert.equal(data.success, true);
          resolve(true);
        });
      });

      Promise.all([promiseA, promiseB, promiseC])
        .then(() => {
          clientA.disconnect();
          clientB.disconnect();
          clientC.disconnect();
          done();
        });
    });
  });

  describe('sending messages, recieving messages', () => {
    // Different clients to use
    let clients = {};
    
    beforeEach(done => {
      let room = randomstring.generate();
      let a = generateAndAssertConnection(room, 'A');
      let b = generateAndAssertConnection(room, 'B');
      let c = generateAndAssertConnection(room, 'C');
      let d = generateAndAssertConnection(room, 'D');
      Promise.all([a, b, c, d])
        .then(values => {
          clients = {
            a : values[0],
            b : values[1],
            c : values[2],
            d : values[3],
          };
          done();
        });
    });
  
    afterEach(done => {
      for (let client in clients) {
        clients[client].disconnect();
      }
      done();
    });

    it('should send a message from a user and recieve from another user', done => {
      const message = 'hello world!!!!';
      const promises = [];
      for (let client in clients) {
        let promise = new Promise((resolve, reject) => {
          clients[client].on('sent message', data => {
            assert.deepEqual(data.message, message);
            resolve();            
          })
        });
        promises.push(promise);        
      }

      //Give some time for clients to connect, join room
      setTimeout(() => {
        clients.a.emit('send message', { delay: 0, message });          
      }, 1000);
      
      Promise.all(promises).then(() => done());
    });

    it('should be able to send and recieve messages with a delay', done => {
      const message = 'foobarss';
      const delay = 30;
      let currentDate;

      function verifyTime(date) {
        const diff = currentDate - delay * 1000 - Date.parse(date);
        //assert that the time difference is within two seconds
        assert(diff < 2000 && diff > -2000);
      }

      const promises = [];
      for (let client in clients) {
        let promise = new Promise((resolve, reject) => {
          clients[client].on('sent message', data => {
            assert.deepEqual(data.message, message);
            verifyTime(data.date);
            resolve();            
          })
        });
        promises.push(promise);        
      }

      //Give some time for clients to connect, join room
      setTimeout(() => {
        currentDate = Date.now();
        clients.a.emit('send message', { delay, message });          
      }, 1000);

      Promise.all(promises).then(() => done());
    });
  });
  
  describe('rating messages, user levels', done => {
    // Different clients to use
    let clients = {};
    // client a will emit a message, initial rating should be zero
    let testMessage;

    beforeEach(done => {
      let roomName = randomstring.generate({
        charset: 'alphanumeric',
        length: 10,
      });
      let a = generateAndAssertConnection(roomName, 'A');
      let b = generateAndAssertConnection(roomName, 'B');
      let c = generateAndAssertConnection(roomName, 'C');
      let d = generateAndAssertConnection(roomName, 'D');
      Promise.all([a, b, c, d])
        .then(values => {
          let messageString = randomstring.generate();
          clients = {
            a : values[0],
            b : values[1],
            c : values[2],
            d : values[3],
          };
          // store the message sent
          const promises = [];
          for (let client in clients) {
            let promise = new Promise((resolve, reject) => {
              clients[client].on('sent message', data => {
                if (data.message === messageString) {
                  testMessage = data;                  
                  resolve();
                } else {
                  reject(new Error('Message discrepancy'));
                }
              });
            })
            promises.push(promise);
          }

          setTimeout(() => {
            clients.a.emit('send message', { message: messageString, delay: 0 })
          }, 1000);

          return Promise.all(promises).then(() => done());
        });
    });
  
    afterEach(done => {
      setTimeout(() => {
        for (let client in clients) {
          clients[client].disconnect();
        }
        done();        
      }, 2000)
    });

    it('should initialize message with 0 rating', done => {
      assert.equal(testMessage.rating, 0);
      done();
    });

    //Emits a rating, then checks all clients to expect data for the rating. Returns a promise.
    function rateAndAssertOnAllClients(emitter, updown, expected) {
      let allPromises = [];
      for (let client in clients) {
        let promise = new Promise((resolve, reject) => {
          //need to reset the listeners on each socket, in case we have chained this fn
          clients[client].off('rated message');

          clients[client].on('rated message', data => {
            assert.equal(data.id, testMessage.id);
            assert.equal(data.rating, expected);
            resolve();          
          });
        });
        allPromises.push(promise);
      }

      setTimeout(() => {
        clients[emitter].emit('rate message', { id: testMessage.id, rating: updown });        
      }, 300);

      return Promise.all(allPromises);
    }

    it('should rate up a message', done => {
      rateAndAssertOnAllClients('b', 'up', 1).then(() => done());
    });

    it('should rate down a message', done => {
      rateAndAssertOnAllClients('c', 'down', -1).then(() => done());
    });

    it('should not allow client to rate their own message', done => {
      // clients shouldn't get a response if single client attempts to rate their own
      let fail = false;
      for (let client in clients) {
        clients[client].on('rated message', data => {
          fail = true;       
        });
      }

      setTimeout(() => {
        clients.a.emit('rate message', { id: testMessage.id, rating: 'up' });        
      }, 100);

      setTimeout(() => {
        assert(!fail);
        done();
      }, 1000);
    });

    it('should not allow client to rate multiple times', done => {
      let rating = 0;
      clients.c.on('rated message', data => {
        rating = data.rating;
      });
      setTimeout(() => {
        clients.b.emit('rate message', { id: testMessage.id, rating: 'up' }); 
      }, 100);
      setTimeout(() => {
        clients.b.emit('rate message', { id: testMessage.id, rating: 'down' });              
      }, 400);
      setTimeout(() => {
        assert.equal(rating, 1);
        done();
      }, 2000);
    });

    it('should be able to rate message multiple times from different clients', done => {
      rateAndAssertOnAllClients('b', 'up', 1)
      .then(() => {
        return rateAndAssertOnAllClients('c', 'up', 2);
      })
      .then(() => {
        return rateAndAssertOnAllClients('d', 'down', 1);
      })
      .then(() => {
        done();
      })
    })

    it('should level up the first client with a single up rating', done => {
      clients.a.on('updated profile', data => {
        if (!data.level)
          return;
        assert.equal(data.level, 1);
        done();
      });
      setTimeout(() => {
        clients.b.emit('rate message', { id: testMessage.id, rating: 'up' });
      }, 1000);
    });

    it('should level up twice with 3 ratings', done => {
      let level = 0;

      clients.a.on('updated profile', data => {
        level = data.level;
      });
      setTimeout(() => {
        rateAndAssertOnAllClients('b', 'up', 1)
        .then(() => rateAndAssertOnAllClients('c', 'up', 2))
        .then(() => rateAndAssertOnAllClients('d', 'up', 3))
      }, 500);
      setTimeout(() => {
        assert.equal(level, 2);
        done()
      }, 3000);
    })
    
  });
});