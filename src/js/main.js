import { $, $$ } from "./dom-helper";

const format = (time) => (time > 9) ? time : '0' + time

let time = $('.header__time')
let date = new Date;
time.textContent = `${format(date.getHours())}:${format(date.getMinutes())}`

const groups = $$('.group__body')
const taskForm = $('#taskForm')
const counters = $$('.group__counter')

const groupName = ['todo', 'progress', 'done']

let todos = JSON.parse(localStorage.getItem('todos'))
let data = (todos) ? todos : {
  todo: [],
  progress: [],
  done: []
}

render()

//------modal-btns--------

const closeModalBtn = $('#cancel')
const confirmModalBtn = $('#confirm')
const changeModalBtn = $('#change')

closeModalBtn.addEventListener('click', toggleModal)
confirmModalBtn.addEventListener('click', handleConfirmForm)

function toggleModal () {
  const modalWindow = $('#modal-add')
  modalWindow.classList.toggle('show')
}

function switchModalBnts () {
  confirmModalBtn.classList.toggle('hide')
  changeModalBtn.classList.toggle('hide')
}

//-----main-group-btns----

const addBtn = $('#add-task')
const completeAllBtn = $('#complete-all')
const delAllBtn = $('#del-all')

addBtn.addEventListener('click', () => {
  taskForm.reset()
  toggleModal()
})

completeAllBtn.addEventListener('click', () => {
  data.progress.forEach(task => {
    data.done.push(task)
  })
  data.progress.length = 0
  render()
})

delAllBtn.addEventListener('click', () => {
  data.done.length = 0
  render()
})

//-----todo-group-btns----

const groupTodo = $('#to-do')
const groupProgress = $('#progress')
const groupDone = $('#complited')

groupTodo.addEventListener('click', handleTodoBtnsAction)
groupProgress.addEventListener('click', handleProgressBtnsAction)
groupDone.addEventListener('click', handleDoneBtnsAction)

//------btns-action-function----

function moveTodo (todo, group) {
  const index = data[todo.status].indexOf(todo)
  data[group].push(todo)
  data[todo.status].splice(index, 1)
  todo.status = group

  render()
}

function editTodo (todo) {
  const index = data.todo.indexOf(todo)
  switchModalBnts()
  toggleModal()
  taskForm.title.value = todo.title
  taskForm.description.value = todo.description
  changeModalBtn.onclick = (e) => handleChangeTodo(e, index)
}

function deleteTodo(index, group) {
  data[group].splice(index, 1)
  render()
}

//----------handlers---------

function handleChangeTodo (e, index) {
  e.preventDefault()
  data.todo[index].title = taskForm.title.value
  data.todo[index].description = taskForm.description.value
  switchModalBnts()
  toggleModal()
  render()
}

function handleConfirmForm (e) {
  e.preventDefault()
  const task = new Todo(taskForm.title.value, taskForm.description.value)
  data.todo.push(task)
  toggleModal()
  taskForm.reset()
  render()
}

//-------------group-btns-handlers--------------

function handleTodoBtnsAction (e) {
  const target = e.target
  if (target.closest('button') && target.closest('button').hasAttribute('id')) {
    const action = target.closest('button').id
    const currentId = target.closest('.task__body').id
    const todo = data.todo.find(task => task.id == currentId)

    switch(action){
      case 'edit': {
        editTodo(todo)
        break;
      }
      case 'delete': {
        deleteTodo(data.todo.indexOf(todo), 'todo')
        break;
      }
      case 'move-right': {
        moveTodo(todo, 'progress')
        break;
      }
    }
  }
}

function handleProgressBtnsAction (e) {
  const target = e.target
  if (target.closest('button') && target.closest('button').hasAttribute('id')) {
    const currentId = target.closest('.task__body').id
    const todo = data.progress.find(task => task.id == currentId)
    const action = target.closest('button').id

    switch(action){
      case 'move-right': {
        moveTodo(todo, 'done')
        break;
      }
      case 'move-left': {
        moveTodo(todo, 'todo')
        break;
      }
    }
  }
}

function handleDoneBtnsAction (e) {
  const target = e.target
  if (target.closest('button') && target.closest('button').hasAttribute('id')) {
    const currentId = target.closest('.task__body').id
    const todo = data.done.find(task => task.id == currentId)
    const action = target.closest('button').id

    switch(action){
      case 'delete': {
        deleteTodo(data['done'].indexOf(todo),'done')
        break;
      }
      case 'move-left': {
        moveTodo(todo, 'progress')
        break;
      }
    }
  }
}

//--------render----------

function render () {
  counters.forEach((counter, i) => counter.textContent = data[groupName[i]].length)
  groups.forEach(group => group.innerHTML = '')
  groups.forEach((group, index) => {
    const div = document.createElement('div')
    div.classList.add('group__task')
    group.append(div)
    data[groupName[index]].forEach(task => div.innerHTML += taskTemplate(task.title, task.description, groupName[index], task.id))
    localStorage.setItem('todos', JSON.stringify(data))
  })
}

//------constructor----------

function Todo (title, description) {
  this.title = title
  this.description = description
  this.status = 'todo'
  this.id = Date.now()
}

//------templates----------

function taskTemplate (title, description, group, id) {
  return `
  <div class="task__body" id="${id}">
    <div class="task__info">
      <h5 class="task__title">${title}</h5>
      <p class="task__text">${description}</p>
      <div class="task__user">Liz <span class="task__date">23.04</sp></div>
    </div>
    ${btnsTemplate(group)}
  </div>`
}

function btnsTemplate (group) {
  switch (group){
    case 'todo':
      return `
      <div class="task__btns">
        <button class="task__btn" id="edit" type="button"><span class="material-symbols-outlined">edit</span></button>
        <button class="task__btn" id="delete" type="button"><span class="material-symbols-outlined">delete</span></button>
        <button class="task__btn" id="move-right" type="button"><span class="material-symbols-outlined">east</span></button>
      </div>`;
    case 'progress':
      return `
      <div class="task__btns">
        <button class="task__btn" id="move-left" type="button"><span class="material-symbols-outlined">west</span></button>
        <button class="task__btn" id="move-right" type="button"><span class="material-symbols-outlined">east</span></button>
      </div>`;
    case 'done':
      return `
      <div class="task__btns">
        <button class="task__btn" id="delete" type="button"><span class="material-symbols-outlined">delete</span></button>
        <button class="task__btn" id="move-left" type="button"><span class="material-symbols-outlined">west</span></button>
      </div>`
  }
}