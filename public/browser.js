const bookTitleInput = document.querySelector('input[name="bookTitle"]');
const bookPriceInput = document.querySelector('input[name="bookPrice"]');
const bookAuthorInput = document.querySelector('input[name="bookAuther"]');
const bookCategoryInput = document.querySelector('input[name="bookCategory"]');

const addBookButton = document.getElementById('add-book');

addBookButton.addEventListener('click', () => {
  const bookTitle = bookTitleInput;
  const bookPrice = bookPriceInput;
  const bookAuthor = bookAuthorInput;
  const bookCategory = bookCategoryInput;

  // Do something with the values, such as sending them to a server or adding them to a list
  bookObj = {
    bookTitle:bookTitle.value,
    bookPrice:bookPrice.value,
    bookAuther: bookAuthor.value,
    bookCategory:bookCategory.value
  }
  // console.log(bookObj)
  axios
      .post("/create-book", { bookData: bookObj })
      .then((res) => {
        if (res.data.status !== 201) {
          alert(res.data.message);
          return;
        }
        console.log(res);
        document.getElementById("create_field").value = "";
      })
      .catch((err) => {
        console.log(err);
      });
});


// const updateButtons = document.querySelectorAll(".update");
// updateButtons.forEach((button) => {
//   button.addEventListener("click", handleUpdateClick);
// });
// handleUpdateClick(e)

window.onload = function () {
  genrateTodos();
};



function genrateTodos() {

axios.get('/books')
  .then((books) => {
    console.log(books.data)
    document.getElementById("item-list").insertAdjacentHTML(
      "beforeend",
      books.data
        .map((item) => {
          return `<div class="card">
          <div class="card-content">
              <h2 class="card-title">${item.bookTitle} </h2>
              <h5>By ${item.bookAuther}</h5>
              <h4>${item.bookCategory}</h4>
              <p>$ ${item.bookPrice}</p>
          </div>
          <div>
              <button data-id="${item._id}" class="update-btn update">Update</button>
              <button data-id="${item._id}" class="delete-me delete">Delete</button>
          </div>
      </div>`;
        })
        .join("")
    );
  })
  .catch(error => console.error(error));
}


