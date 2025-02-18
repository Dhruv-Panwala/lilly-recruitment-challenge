let medicineMap = new Map();

async function fetchMedicines() {
    try {
        const response = await fetch("http://127.0.0.1:8000/medicines");
        const data = await response.json();
        const container = document.getElementById("medicineList");
        
        data.medicines.forEach((med, index) => {
            medicineMap.set(med.name,med.price);
            if (typeof med.name !== "string" || med.name.trim() === "" ){
                console.log(`Invalid medicine name at index ${index}`);
            }
            else if (typeof med.price !== "number" || med.price <= 0){
                container.appendChild(carCard(med.name,"Not Available"));
            }
            else{
                container.appendChild(carCard(med.name,med.price));
            }

        });
    } catch (error) {
        console.error("Error fetching medicines:", error);
    }
}
console.log(medicineMap);
document.addEventListener("DOMContentLoaded", fetchMedicines);

function carCard(name,price){
    let card = document.createElement("div");
    card.classList.add("medicineCard");
    card.innerHTML = `
        <h3>${name}</h3>
        <p>Price: £${price}</p>
        <button onclick="updateMedicine('${name}')">Update</button>
        <button onclick="deleteMedicine('${name}')">Delete</button>`;
    return card;
}

function updateMedicine(name) {
    let newPrice = Number(prompt(`Enter new price for ${name}:`));

    if (isNaN(newPrice) || newPrice <= 0) {
        alert("Invalid price. Please enter a valid number.");
        return;
    }

    let formData = `name=${encodeURIComponent(name)}&price=${encodeURIComponent(newPrice)}`;
    console.log("Sending data:", formData);  

    fetch("http://localhost:8000/update", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        console.log("Response from server:", data);
        alert(data.message || data.error);
        location.reload();
    })
    .catch(error => console.error("Error updating medicine:", error));
}

function deleteMedicine(name) {
    if (!confirm(`Are you sure you want to delete ${name}?`)) {
        return;
    }

    fetch("http://localhost:8000/delete", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `name=${encodeURIComponent(name)}`,
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        location.reload();
    })
    .catch(error => console.error("Error deleting medicine:", error));
}

function addMedicine() {
    let name = prompt("Enter the name of the new medicine:");
    if (!name || name.trim() === "" || !isNaN(name)) {
        alert("Invalid name. Please enter a valid medicine name.");
        return;
    }

    let price = Number(prompt(`Enter the price for ${name}:`));
    if (isNaN(price) || price <= 0) {
        alert("Invalid price. Please enter a valid number.");
        return;
    }

    fetch("http://localhost:8000/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `name=${encodeURIComponent(name)}&price=${encodeURIComponent(price)}`,
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        location.reload();
    })
    .catch(error => console.error("Error adding medicine:", error));
}

function calculateAverage() {
    fetch("http://localhost:8000/averagePrice")
    .then(response => response.json())
    .then(data => {
        if (data.average_price !== undefined) {
            alert(`Average Price: ${data.average_price}`);
        } else {
            alert(data.message);
        }
    })
    .catch(error => console.error("Error calculating average price:", error)); 
}

function medicineSearch() {
    let search = document.getElementById("search").value;
    if (search === "") {
        fetchMedicines();
    }
    else {
        let container = document.getElementById("medicine-list");
        container.innerHTML = "";
        let medicine = medicineMap.get(search);
        if (medicine === undefined) {
            container.innerHTML = `<h3>Medicine not found</h3>`;
        }
        else {
            container.appendChild(carCard(search,medicineMap.get(search)));
        }
    }
}