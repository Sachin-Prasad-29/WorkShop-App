// window.addEventListener("load", function () {
//   console.log("Page loaded");
// });

// now we will write  the function to fetch the list of workshop
let workshops = []; // global veriable
let isEditing = false;
let editedWorkshopId = -1;

function fetchWorkshop() {
  fetch(`https://workshops-server.herokuapp.com/workshops`) // this URl will give the data here fetch promise function
    .then((response) => {
      if (!response.ok) {
        // If there is any error during the fetch of data
        throw new Error(" Something went wrong ");
      }
      return response.json(); // so it must contain then and catch block as its a promise function
    })
    .then((data) => {
      workshops = data; // store the date for future use
      console.log(data);
      showWorkshops();
    })
    .catch((error) => {
      alert(error.message); // If any error occur from our size or Network
    });
}

function getWorkShopString(workshop) {
  return `
     <div class= "workshop-card row me-3 ms-1" data-id="${workshop.id}">
       <div class="col-sm-12 workshop-inner-card border border-secondary rounded p-3 my-2 ">
             <div class="row">
                <div class="col-sm-4">
                    <img src="${workshop.imageUrl}" class ="img-fluid" />
                </div>
                <div class="col-sm-8">
                   <h3> ${workshop.name} </h3>

                   <div>${workshop.description}<div>
                   <button class ="btn btn-primary btn-edit">Edit</button>
                   <button class ="btn btn-danger btn-delete">Delete</button>  
                </div>
                
             </div>
        </div>
       </div>
    `;
}

function showWorkshops() {
  const workshopsEl = document.querySelector("#workshops");

  workshopsEl.innerHTML = "";

  workshops.forEach((workshop) => {
    workshopsEl.innerHTML += getWorkShopString(workshop);
  });
}

function addWorkshopToList(workshop) {
  const workshopsEl = document.querySelector("#workshops");
  workshopsEl.innerHTML += getWorkShopString(workshop);
}

function addWorkshop(event) {
  event.preventDefault();

  //some DOM nodes (for success or Unsuccessfull submittion of the form )
  const formSubmitStatusEl = document.querySelector("#form-submit-status");

  // Read the user Inputs
  const name = document.querySelector("#name").value;
  const description = document.querySelector("#description").value;
  const startDate = document.querySelector("#startDate").value;
  const endDate = document.querySelector("#endDate").value;
  const time = document.querySelector("#time").value;
  const imageUrl = document.querySelector("#imageUrl").value;
  const online = document.querySelector("#online").checked;
  const inPerson = document.querySelector("#inPerson").checked;
  // Gather the data to be sent to the backend
  const newWorkshop = {
    name: name,
    description: description,
    startDate: startDate,
    endDate: endDate,
    modes: {
      online: online,
      inPerson: inPerson,
    },
    imageUrl: imageUrl,
  };
  // If form is invalid then do not go ahead with submission to backend
  if (
    name === "" ||
    description === "" ||
    startDate === "" ||
    endDate === "" ||
    time === "" ||
    imageUrl === "" ||
    (!online && !inPerson)
  ) {
    // display the error message
    formSubmitStatusEl.classList.remove("alert-success");
    formSubmitStatusEl.classList.add("alert-danger");
    formSubmitStatusEl.innerHTML = "Form has errors. Please correct them and try again !";
    return;
  }
  // go head and submit to the backend
  // display the success message
  formSubmitStatusEl.classList.remove("alert-danger");
  formSubmitStatusEl.classList.add("alert-success");
  formSubmitStatusEl.innerHTML = "Form has been Submitted";

  const url = isEditing
    ? `https://workshops-server.herokuapp.com/workshops/${editedWorkshopId}`
    : `https://workshops-server.herokuapp.com/workshops`;
  const method = isEditing ? 'PUT' : 'POST';

  //send the data to the backend
  fetch(url, {
    method: method,
    body: JSON.stringify(newWorkshop),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(" Something went wrong ");
      }
      return response.json();
    })
    .then((data) => {
      if (isEditing) {
        const selectedWorkshopIndex = workshops.findIndex((workshop) => workshop.id === editedWorkshopId);
        workshops.splice(selectedWorkshopIndex, 1, data);
        showWorkshops();
        isEditing = false;
      } else {
        workshops = [...workshops, data];
        addWorkshopToList(data);
      }
    })
    .catch((error) => {
      alert(error.message);
      isEditing = false;
    });
}
// delete workshop method
function deleteWorkshop(workShopId, workShopCard) {
  const operationStatusEl = document.querySelector("#operation-status");
  fetch(`https://workshops-server.herokuapp.com/workshops/${workShopId}`, {
    method: "DELETE",
  })
    .then((response) => {
      workshops = workshops.filter((workshop) => workshop.id !== workShopId);
      workShopCard.remove();

      // display the success message
      operationStatusEl.classList.remove("alert-danger");
      operationStatusEl.classList.add("alert-success");
      operationStatusEl.innerHTML = "Workshop have been deleted";
    })
    .catch((error) => {
      operationStatusEl.classList.remove("alert-success");
      operationStatusEl.classList.add("alert-danger");
      operationStatusEl.innerHTML = error.message;
    });
}
// fillForm to edit the card
function fillForm(workShopId, workShopCard) {
  //set that we are in edit mode
  isEditing = true;
  editedWorkshopId=workShopId;
  const operationStatusEl = document.querySelector("#operation-status");

  //get the details of the workshop Id
  const selectedWorkshop = workshops.find((workshop) => workshop.id === workShopId);

  // populate the use inputs
  document.querySelector("#name").value = selectedWorkshop.name;
  document.querySelector("#description").value = selectedWorkshop.description;
  document.querySelector("#startDate").value = selectedWorkshop.startDate.substring(0, 10);
  document.querySelector("#endDate").value = selectedWorkshop.endDate.substring(0, 10);
  document.querySelector("#time").value = selectedWorkshop.time;
  document.querySelector("#imageUrl").value = selectedWorkshop.imageUrl;
  document.querySelector("#online").checked = selectedWorkshop.online;
  document.querySelector("#inPerson").checked = selectedWorkshop.inPerson;
}



// setup event handler on page load
window.addEventListener("load", function () {
  fetchWorkshop(); // call this function when page is loaded
});


// when the form is submitted having id add-workshop-form
const form = document.querySelector("#add-workshop-form");
form.addEventListener("submit", addWorkshop);

//  even delegation  for deleting the workshop
document.body.addEventListener("click", function (event) {
  // actual element that was clicked
  const el = event.target;
  let workShopCard, workShopId;

  const isDelete = el.classList.contains("btn-delete");
  const isEdit = el.classList.contains("btn-edit");

  if (isDelete || isEdit) {
    workShopCard = el.closest(".workshop-card");
    workShopId = parseInt(workShopCard.getAttribute("data-id"));
  }
  if (isDelete) {
    deleteWorkshop(workShopId, workShopCard);
    return;
  }
  if (isEdit) {
    fillForm(workShopId, workShopCard);
  }
});
