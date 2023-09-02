const list_el = document.getElementById("list");
const create_btn_el = document.getElementById("create");
const sortButton = document.getElementById("sortButton");
const searchInput = document.getElementById("searchInput");
const categorySelect = document.getElementById("category-select");
const searchContainer = document.querySelector('.search-container');
const searchIcon = document.getElementById('searchIcon');
const voiceRecognitionButton = document.getElementById("voiceRecognitionButton");




let todos = [];

create_btn_el.addEventListener('click', CreateNewTodo);
sortButton.addEventListener("click", sortTasks);
searchInput.addEventListener("input", DisplayTodos);
voiceRecognitionButton.addEventListener("click", toggleVoiceRecognition);
searchIcon.addEventListener('click', () => {
	searchContainer.classList.toggle('active');
	if (searchContainer.classList.contains('active')) {
	  searchInput.style.width = '160px';
	  searchInput.focus();
	} else {
	  searchInput.style.width = '0';
	}
  });
  


const currentDate = new Date();

function CreateNewTodo() {
	const item = {
		id: new Date().getTime(),
		text: "",
		complete: false,
        dueDate: null,
		category:"Personal",
	}

	todos.unshift(item);

	const { item_el, input_el } = CreateTodoElement(item);

	list_el.prepend(item_el);

	input_el.removeAttribute("disabled");
	input_el.focus();

	Save();
}


function CreateTodoElement(item) {
	const item_el = document.createElement("div");
	item_el.classList.add("item");

	const checkbox = document.createElement("input");
	checkbox.type = "checkbox";
	checkbox.checked = item.complete;

	if (item.complete) {
		item_el.classList.add("complete");
	}

	const input_el = document.createElement("input");
	input_el.type = "text";
	input_el.value = item.text;
	input_el.setAttribute("disabled", "");

    const dueDateInput = document.createElement("input");
    dueDateInput.type = "date";
	dueDateInput.id = "dueDateInput";
    dueDateInput.value = item.dueDate ? item.dueDate : "";
    dueDateInput.classList.add("due-date-input");

	const actions_el = document.createElement("div");
	actions_el.classList.add("actions");

	const overdueText_el = document.createElement("div");
	overdueText_el.classList.add("overdue-text");

	const categorySelect = document.createElement("select");
	categorySelect.id = "category-select";

	const categories = ["Personal", "Work", "Shopping", "Others"]; // Add your own categories here

	for (const category of categories) {
		const option = document.createElement("option");
		option.value = category;
		option.textContent = category;
		categorySelect.appendChild(option);
	}

	if (item.category) {
		categorySelect.value = item.category;
	}
  
	
	if (!item.complete && item.dueDate && new Date(item.dueDate) < currentDate) {
	  const daysOverdue = Math.floor((currentDate - new Date(item.dueDate)) / (1000 * 60 * 60 * 24));
	  overdueText_el.textContent = `Overdue by ${daysOverdue} days`;
	}


	const edit_btn_el = document.createElement("button");
	edit_btn_el.classList.add("material-icons");
	edit_btn_el.innerText = "edit";

	const remove_btn_el = document.createElement("button");
	remove_btn_el.classList.add("material-icons", "remove-btn");
	remove_btn_el.innerText = "remove_circle";

	actions_el.append(edit_btn_el);
	actions_el.append(remove_btn_el);


	item_el.append(checkbox);
	item_el.append(input_el);
	item_el.append(categorySelect);
	item_el.append(actions_el);
    item_el.appendChild(dueDateInput);
	item_el.append(overdueText_el);
    //dueDate

  dueDateInput.addEventListener("change", () => {
    item.dueDate = dueDateInput.value;
    Save();
  });

	// EVENTS
	checkbox.addEventListener("change", () => {
		item.complete = checkbox.checked;

		if (item.complete) {
			item_el.classList.add("complete");
		} else {
			item_el.classList.remove("complete");
		}

		Save();
	});

	input_el.addEventListener("input", () => {
		item.text = input_el.value;
	});

	input_el.addEventListener("blur", () => {
		input_el.setAttribute("disabled", "");
		Save();
	});

	edit_btn_el.addEventListener("click", () => {
		input_el.removeAttribute("disabled");
		input_el.focus();
	});

	remove_btn_el.addEventListener("click", () => {
		todos = todos.filter(t => t.id != item.id);

		item_el.remove();

		Save();
	});

	dueDateInput.addEventListener("change", () => {
		item.dueDate = dueDateInput.value;
		item.category = categorySelect.value; 
		Save();
	});

	return { item_el, input_el, edit_btn_el, remove_btn_el,overdueText_el,categorySelect};
	
}


function DisplayTodos(){
	Load();
	LoadSelectedCategory();

	const searchInputValue = searchInput.value.toLowerCase(); 

	const filteredAndSorted = todos
		.filter(item => item.text.toLowerCase().includes(searchInputValue))
		.sort((a, b) => a.text.localeCompare(b.text));

	list_el.innerHTML = "";



	for (const item of filteredAndSorted) {
		const { item_el } = CreateTodoElement(item);
		list_el.append(item_el);
	}
}

let recognition; // Declare a global variable for SpeechRecognition instance

function toggleVoiceRecognition() {
  if (!recognition) {
    startVoiceRecognition();
  } else {
    stopVoiceRecognition();
  }
}

function startVoiceRecognition() {
  recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-US";

  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript.toLowerCase();
    processVoiceCommand(transcript);
  };

  recognition.onend = function () {
    voiceRecognitionButton.textContent = "Start Voice Recognition";
    recognition = null;
  };

  recognition.start();
  voiceRecognitionButton.textContent = "Stop Voice Recognition";
}

function stopVoiceRecognition() {
  if (recognition) {
    recognition.stop();
    recognition = null;
    voiceRecognitionButton.textContent = "Start Voice Recognition";
  }
}

function processVoiceCommand(command) {
  if (command.includes("create task")) {
    CreateNewTodo();
  } else if (command.includes("sort tasks")) {
    sortTasks();
  } else if (command.includes("search")) {
    const searchTerm = command.replace("search", "").trim();
    searchInput.value = searchTerm;
    DisplayTodos();
  }
  else {
    // If the command doesn't match any known action, treat it as a search term
    searchInput.value = command;
    DisplayTodos();
  }
}

function sortTasks() {
	const selectedSortOrder = sortButton.value;
	todos.sort((a, b) => {
         const dateA = new Date(a.dueDate);
		 const dateB = new Date(b.dueDate);

		 if(selectedSortOrder === "asc"){
			return dateA - dateB;
		 }
		 else{
			return dateB - dateA;
		 }
		});

	DisplayTodos(); 

	
}

function SaveSelectedCategory() {
	const selectedCategory = categorySelect.value;
	localStorage.setItem("selectedCategory", selectedCategory);

}


function LoadSelectedCategory() {
	const selectedCategory = localStorage.getItem("selectedCategory");
	if (selectedCategory) {
		categorySelect.value = selectedCategory;
	}
}
LoadSelectedCategory();


function Save() {
	const save = JSON.stringify(todos);
	localStorage.setItem("my_todos", save);
	LoadSelectedCategory();
}

function Load() {
	const data = localStorage.getItem("my_todos");
	if (data) {
		todos = JSON.parse(data);
		
	}
}


DisplayTodos();