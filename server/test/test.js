import io from 'socket.io-client';

const assert = require('assert');
const serverAddress = 'http://localhost:3001';

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
      assert.deepEqual(data, { success: true });
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
        assert.deepEqual(data, { success: true });
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
        assert.deepEqual(data, { success: true });
        let client2 = io.connect(serverAddress, {
          query: {
            room: 'testroom1',
            username: 'testUserA',
          }
        });
        client2.on('auth', data => {
          assert.deepEqual(data, { success: false });
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
        assert.deepEqual(data, { success: true });
        a = true;
      });

      const client2 = io.connect(serverAddress, {
        query: {
          room: 'testroom1',
          username: 'testUserE',
        }
      });
      client2.on('auth', data => {
        assert.deepEqual(data, { success: true });
        b = true;  
      });


      const client3 = io.connect(serverAddress, {
        query: {
          room: 'testroom1',
          username: 'testUserF',
        }
      });
      client3.on('auth', data => {
        assert.deepEqual(data, { success: true });
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
          assert.deepEqual(data, { success: true });
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
          assert.deepEqual(data, { success: true });
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
          assert.deepEqual(data, { success: true });
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
      let a = generateAndAssertConnection('testRoom', 'A');
      let b = generateAndAssertConnection('testRoom', 'B');
      let c = generateAndAssertConnection('testRoom', 'C');
      let d = generateAndAssertConnection('testRoom', 'D');
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

  });
});