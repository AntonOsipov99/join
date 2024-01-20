const STORAGE_TOKEN = '6JWGFSP8ZA4Y8JE2FOVSN7ZO8Z67IFY8GHNHPA6B'
const STORAGE_URL = 'https://remote-storage.developerakademie.org/item'

let lokalUsers = [];
let allTasks = [];
let sortTasks = {
    'toDo': '',
    'progress': '',
    'feedback': '',
    'done': '',
}

//------------------------------------------------------------------------------//
//-----------------------------save User at Backend-----------------------------//
//------------------------------------------------------------------------------//

/**
 * save User at Backend
 * @async
 * @param {string} key 
 * @param {string} value 
 * @returns 
 */
async function setItem(key, value) {
    const payload = { key, value, token: STORAGE_TOKEN };
    return fetch(STORAGE_URL, { method: 'POST', body: JSON.stringify(payload) })
        .then(res => res.json());
}


//------------------------------------------------------------------------------//
//-----------------------------get User from Backend----------------------------//
//------------------------------------------------------------------------------//

/**
 * get User from Backend
 * @async
 * @param {string} key 
 * @returns 
 */
async function getItem(key) {
    const url = `${STORAGE_URL}?key=${key}&token=${STORAGE_TOKEN}`;
    return await fetch(url).then(res => res.json().then(res => res.data.value));
}

// async function getItem(key) {
//     const url = `${STORAGE_URL}?key=${key}&token=${STORAGE_TOKEN}`;
//     const response = await fetch(url);
//     if(response.ok) {
//         return await fetch(url).then(res => res.json().then(res => res.data.value));
//     } else {
//         return [];
//     }
// }

//------------------------------------------------------------------------------//
//-----------------------------get Username from URL----------------------------//
//------------------------------------------------------------------------------//

/**
 * get Username from URL
 * @returns 
 */
function getUserName() {
    const urlParams = new URLSearchParams(window.location.search);
    const msg = urlParams.get('msg');
    if (msg) {
        let userName = msg.split(', ');
        return userName[1];
    } else {
        return 'Guest'
    }
}


//------------------------------------------------------------------------------//
//----------------------------load User from Backend----------------------------//
//------------------------------------------------------------------------------//

/**
 * load User from Backend
 * @async
 * @returns 
 */
async function loadUsers() {
    try {
        let users = JSON.parse(await getItem('users'));
        return users
    } catch (e) {
        console.error('Loading error:', e);
    }
}


//------------------------------------------------------------------------------//
//-------------------------load User from local Storage-------------------------//
//------------------------------------------------------------------------------//

/**
 * load User from local Storage
 * @returns 
 */
function loadUsersFromLocalStorage() {
    return lokalUsers = JSON.parse(localStorage.getItem('users')) || [];
}


//------------------------------------------------------------------------------//
//--------------------------save User at local Storage--------------------------//
//------------------------------------------------------------------------------//

/**
 * save User at local Storage
 * @async
 */
async function saveUserToLocalStorage() {
    let emailValue = document.getElementById('email_log_in')
    let users = JSON.parse(await getItem('users'));
    let user = users.find(u => u.email == emailValue.value.toLowerCase())
    let userNumber = lokalUsers.find(l => l.email == emailValue.value.toLowerCase())
    if (userNumber != undefined) {
        lokalUsers.splice(0);
        lokalUsers.push(user);
    } else {
        lokalUsers.push(user);
    }
    localStorage.setItem('users', JSON.stringify(lokalUsers));
}

//------------------------------------------------------------------------------//
//-------------------------delete User at local Storage-------------------------//
//------------------------------------------------------------------------------//

/**
 * delete User at local Storage
 */
function clearLocalStorage() {
    localStorage.removeItem('users');
}


//------------------------------------------------------------------------------//
//----------------------------------delete User---------------------------------//
//------------------------------------------------------------------------------//

/**
 * delete User
 * @async
 * @param {string} email 
 */
async function deleteUser(email) {
    let users = JSON.parse(await getItem('users'));
    users = users.filter(u => u.email !== email.toLowerCase());
    await setItem('users', JSON.stringify(users));
}


//------------------------------------------------------------------------------//
//---------------------------save Contacts at Backend---------------------------//
//------------------------------------------------------------------------------//

/**
 * save Contacts at Backend
 * @async
 */
async function saveContacts() {
    // let users = JSON.parse(await getItem('users'));
    // let userName = getUserName();
    // let userIndex = users.findIndex(u => u.name === userName);
    // users[userIndex].contacts = contacts;
    await setItem('contacts', JSON.stringify(contacts));
}


//------------------------------------------------------------------------------//
//--------------------------load Contacts from Backend--------------------------//
//------------------------------------------------------------------------------//

/**
 * load Contacts from Backend
 * @async
 */
async function loadContacts() {
    // let users = JSON.parse(await getItem('users'));
    // let userName = getUserName();
    // let userIndex = users.findIndex(u => u.name === userName);
    // let userContacts = users[userIndex].contacts
    // if (userContacts == undefined) {
    //     contacts = []
    // } else {
    //     contacts = userContacts
    // }
    contacts = JSON.parse(await getItem('contacts'));
}


//------------------------------------------------------------------------------//
//-----------------------------save Tasks at Backend----------------------------//
//------------------------------------------------------------------------------//

/**
 * save Tasks at Backend
 * @async
 */
async function saveTasks() {
    await setItem('allTasks', JSON.stringify(allTasks));
}

async function saveTasksCategory(tasksToDo, tasksInProgress, tasksAwaitFeedback, tasksDone) {
    sortTasks = {
        'toDo': tasksToDo,
        'progress': tasksInProgress,
        'feedback': tasksAwaitFeedback,
        'done': tasksDone,
    };
    await setItem('sortTasks', JSON.stringify(sortTasks));
}


//------------------------------------------------------------------------------//
//-----------------------------load Tasks at Backend----------------------------//
//------------------------------------------------------------------------------//

/**
 * load Tasks at Backend
 * @async
 */
async function loadTasks() {
    allTasks = JSON.parse(await getItem('allTasks'));
    sortTasks = JSON.parse(await getItem('sortTasks'));
}

/**
 * Updates the task status on the server by sending a POST request with the task ID and target container ID.
 *
 * @param {string} taskId - The ID of the task to update.
 * @param {string} targetContainerId - The ID of the target container.
 */
async function updateTaskStatusOnServer(taskId, targetContainerId) {
    const payload = { key: `taskStatus_${taskId}`, value: targetContainerId, token: STORAGE_TOKEN };
    await fetch(STORAGE_URL, { method: 'POST', body: JSON.stringify(payload) });
}

/**
 * Loads task status information from the server and updates the local sortTasks object.
 *
 */
async function loadTaskStatusFromServer() {
    const taskStatusKeys = Object.keys(sortTasks).map(category => `taskStatus_${sortTasks[category]}`);
    const taskStatusValues = await Promise.all(taskStatusKeys.map(key => getItem(key)));
    taskStatusValues.forEach((value, index) => {
        const category = Object.keys(sortTasks)[index];
        sortTasks[category] = value;
    });
}
