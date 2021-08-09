
// data store
class Model{
  constructor(){
    this.todos = [
      { id: 1 , text: "great", complete: false},
      { id: 2 , text: "Job", complete: false}
    ];
    this.count = {
      all: 0,
      active: 0,
      completed: 0,
    }

    this._setCount();
  }
  addTodo(todotext) {
    const todo = {
      id: this.todos.length > 0 ? this.todos[this.todos.length - 1].id + 1 : 1 ,
      text: todotext,
      complete: false
    }
    this.todos.push(todo)
    this._setCount();
    this.onTodoListChanged(this.todos, this.count)
  }
  editTodo(id,updatetext){
    this.todos = this.todos.map(elem => elem.id == id ? {id : elem.id, text : updatetext, complete:elem.complete}: elem);
    this._setCount();
    this.onTodoListChanged(this.todos, this.count)
  }
  toggleTodo(id){
    this.todos =this.todos.map(todo => todo.id == id ? { id: todo.id, text:todo.text, complete : !todo.complete} : todo);
    this._setCount();
    this.onTodoListChanged(this.todos, this.count)
  }
  deleteTodo(id){
    this.todos =this.todos.filter(todo => todo.id !== id);
    this._setCount();
    this.onTodoListChanged(this.todos, this.count)
  }
  bindTodoListChanged(callback) {
    this.onTodoListChanged = callback;
  }

  // Set count
  _setCount() {
    this.count.all = this.todos.length;
    this.count.active = this.todos.filter(todo => todo.complete === false).length;
    this.count.completed = this.todos.filter(todo => todo.complete === true).length;
  }
  all (){
    this.onTodoListChanged(this.todos,this.count)
  }
  
  // 
  listActive(){
     const activeTodos = this.todos.filter(todo => todo.complete === false);
     this.onTodoListChanged(activeTodos,this.count)
     
  }
  // 
  listComplete(){
    const completeTodos = this.todos.filter(todo => todo.complete === true);
     this.onTodoListChanged(completeTodos,this.count)
  }
}

// how our todo look
class View{
  constructor(){
    this.app = this.getElement("#root");

    this.title = this.createElement("h1");
    this.title.textContent = "Todos";

    // form
    this.form = this.createElement("form");

    this.input = this.createElement("input");
    this.input.placeholder = "write Your List";
    this.input.type = "text";
    this.input.name = "todo";

    this.button = this.createElement("button");
    this.button.type = "submit";
    this.button.textContent = "Submit";

    this.todoList = this.createElement("ul" , "todo-list");

    // All count
    this.allCount = this.createElement("span");
    this.allCount.textContent = `ALL :0`;

    // Active count
    this.activeCount = this.createElement("span","active");
    this.activeCount.textContent = "Active: 0";

    // Completed count
    this.completedCount = this.createElement("span");
    this.completedCount.textContent = "Completed: 0";

    // count container
    this.countContainer = this.createElement("section", "countContainer");
    this.countContainer.append(this.allCount, this.activeCount, this.completedCount);

    // append
    this.app.append(this.title,this.form,this.todoList, this.countContainer);
    this.form.append(this.input, this.button);

    this._temporaryTodoText
    this._initLocalListeners()
  }
  createElement(tag,className){
    const element = document.createElement(tag);
    if(className){
      element.classList.add(className)
    }
    return element;
  }
  getElement(selector){
    const element = document.querySelector(selector);
    return element
  }
  get _todoText(){
    return this.input.value;
  }
  _resetInput() {
    this.input.value = ""
  }

  displayCount(count) {
    this.allCount.textContent = `All: ${count.all}`;
    this.activeCount.textContent = `Active: ${count.active}`;
    this.completedCount.textContent = `Completed: ${count.completed}`;
  }

  displayTodo(todos){
    while(this.todoList.firstChild){
      this.todoList.removeChild(this.todoList.firstChild)
    }
    if(todos.length === 0){
      const p = this.createElement("p");
      p.textContent = "Nothing in your List";
      this.todoList.append(p)
    }else{
      todos.forEach(todo =>{
        // list
        const li = this.createElement("li");
        li.id = todo.id;

        // checkbox setting
        const checkbox = this.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = todo.complete;

        // for task done or not
        const span  = this.createElement("span","editable");
        span.contentEditable = true;

        if(todo.complete){
          const strike = this.createElement("s");
          strike.textContent = todo.text;
          span.append(strike)
        }else{
          span.textContent = todo.text;
        }

        // delete
        const deleteButton = this.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.classList.add("delete")

        // append 
        li.append(checkbox,span,deleteButton);
        this.todoList.append(li)
      })
    }
   
  }
  // setting Event Listner
  bindAddTodo(handler) {
    this.form.addEventListener("submit",(event)=>{
      event.preventDefault()
      if(this._todoText){
        handler(this._todoText);
        this._resetInput()
      }
    })
  }
  bindDeleteTodo(handler) {
    this.todoList.addEventListener("click", event =>{
      if(event.target.className === "delete"){
        const id = parseInt(event.target.parentElement.id);
        handler(id)
      }
    })
  }
  bindToggleTodo(handler) {
    this.todoList.addEventListener('change', event => {
      if (event.target.type === 'checkbox') {
        const id = parseInt(event.target.parentElement.id)
  
        handler(id)
      }
    })
  }
  // editiing
  // Update temporary state
_initLocalListeners() {
  this.todoList.addEventListener('input', event => {
    if (event.target.className === 'editable') {
      this._temporaryTodoText = event.target.innerText
    }
  })
}

// Send the completed value to the model
  bindEditTodo(handler) {
    this.todoList.addEventListener('focusout', event => {
      if (this._temporaryTodoText) {
        const id = parseInt(event.target.parentElement.id)

        handler(id, this._temporaryTodoText)
        this._temporaryTodoText = ''
      }
    })
  }
  bindActiveCount(handler){

    this.activeCount.addEventListener("click", () =>{
      handler()
    } )
  }
  bindCompleteCount(handler){
    this.completedCount.addEventListener("click",()=>{
      handler()
    })
  }
  bindAll(handler){
    this.allCount.addEventListener("click",()=>{
      handler()
    })
  }
}


class Controller{
  constructor(model,view){
    this.model = model
    this.view = view
    this.onTodoListChanged(this.model.todos, this.model.count);
    // binding handler with todos
    this.view.bindAddTodo(this.handleAddTodo.bind(this))
    this.view.bindDeleteTodo(this.handleDeleteTodo)
    this.view.bindToggleTodo(this.handleToggleTodo)

    this.view.bindEditTodo(this.handleEditTodo);
    this.view.bindActiveCount(this.handleActiveCount);
    this.view.bindCompleteCount(this.handleCompleteCount);
    this.view.bindAll(this.handleAll);
    
    this.model.bindTodoListChanged(this.onTodoListChanged);
    

  }
  onTodoListChanged = (todos, count) => {
    this.view.displayTodo(todos);
    this.view.displayCount(count);
  }
  handleAddTodo  (todoText){
    this.model.addTodo(todoText)
  }
  handleEditTodo = (id,updatetext) =>{
    this.model.editTodo(id,updatetext)
  }
  handleToggleTodo = id =>{
    this.model.toggleTodo(id)
  }
  handleDeleteTodo = id =>{
    this.model.deleteTodo(id)
  }
  handleActiveCount = () => {
    this.model.listActive()
  }
  handleCompleteCount=()=>{
    this.model.listComplete()
  }
  handleAll = ()=>{
    this.model.all()
  }
}
let app = new Controller(new Model(),new View())