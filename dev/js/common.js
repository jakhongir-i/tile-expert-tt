var searchBtn = document.querySelector('.search-icon');
var clearBtn = document.querySelector('.search-form__input-clear');
var searchForm = document.querySelector('.header__search-form');
var searchFormInput = document.querySelector('.search-form__input');
var searchFilterWrap = document.querySelector('.search-form__filters-wrap')
var searchFilter = document.querySelector('.search-form__filters')


document.addEventListener("click", (evt) => {
  let targetElement = evt.target; // clicked element

  do {
      if (targetElement == searchForm || targetElement == searchBtn && targetElement == searchFilter) {
          
          return;
      }
      // Go up the DOM
      targetElement = targetElement.parentNode;
  } while (targetElement);

  // This is a click outside.
  hide(searchForm, 'header__search-form--open');
  hide(searchFilterWrap, 'search-form__filters-wrap--open');
  hide(searchFormInput, 'search-form__input--has-value');
  searchFormInput.value = '';
});


searchFormInput.addEventListener('focus', (e) => {
  searchFilterWrap.classList.add('search-form__filters-wrap--open');
})

searchBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  searchForm.classList.add('header__search-form--open')
})
searchFormInput.addEventListener('input', e => {
  if(e.target.value.trim() !== '') {
    searchFormInput.classList.add('search-form__input--has-value');
  } else {
    hide(searchFormInput, 'search-form__input--has-value')
  }
})
  
  

clearBtn.addEventListener('click', () => {
  searchFormInput.value = '';
  hide(searchFormInput, 'search-form__input--has-value');
})

function hide(elem, removingClass) {
  elem.classList.remove(`${removingClass}`)
}