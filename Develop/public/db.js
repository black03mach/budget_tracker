let db;
const request = indexedDB.open('budget', 1);

//Request submit error will show the error code in console.
request.onerror = function (event) {
    console.log(event.target.errorCode)
};

// Pending transaction are created via this
request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore('pending', {autoIncrement : true});
};

//If the request is submitted check if the database is online, and then collects data
request.onsuccess = function (event) {
    db = event.target.result;
    if (navigator.onLine) {
        checkDatabase();
    };
};

//Creates a trans on offline db
function saveRecord (record) {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending")
    store.add(record);
};

//When db is online post all pending and clear the offline db
function checkDatabase () {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();

    getAll.onsuccess = function (){
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            }).then(response => response.json())
            .then(() => {
                const transaction = db.transaction = (["pending"], "readwrite");
                const store = transaction.objectStore("pending");
                store.clear();
            });
        };
    };
};

window.addEventListener('online', checkDatabase);


