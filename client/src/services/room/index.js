const roomPath = 'api/rooms';
const signinPath = 'api/rooms/signin';

function checkAcceptedStatus(res) {
  if (res.status >= 200 && res.status < 300) {
    return res.json();
  } else {
    var error = new Error(res.statusText || res.status)
    error.response = res
    return Promise.reject(error)
  }
}

/**
 * Attempt to connect to a room
 * @param {string} room Room to connect to
 * @returns {Promise} Resolves successfully connect, Rejected did not connect
 */
export function connect(room) {
  return fetch(roomPath, {
    method: 'post',
    body: JSON.stringify({ room }),
    headers: { "Content-Type": "application/json" },
    credentials: 'include'
  }).then(res => {
      return checkAcceptedStatus(res);
    })
    .then(res => {
      if (!res.success)
        return Promise.reject('Unable to connect.');
      return Promise.resolve(res.type);
    })
    .catch(err => {
      console.log(err);
    })
}

/**
 * Attempts to sign into a room
 * @param {string} room Room to sign in to 
 * @param {string} username Username to signin with
 * @returns {Promise} Resolves and returns success if signin was successful
 */
export function signin(room, username) {
  return fetch(signinPath, {
    method: 'post',
    body: JSON.stringify({ room, username }),
    headers: { "Content-Type": "application/json" },
    credentials: 'include'
  }).then(res => {
      return checkAcceptedStatus(res);
    })
    .then(res => {
      console.log(res);
      return Promise.resolve(res);
    })
    .catch(err => {
      console.log(err);
    })
}