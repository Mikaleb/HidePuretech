// Function to hide divs containing a specific word
function hideDivsContainingWord(word: string) {
  const divs = document.querySelectorAll("div");
  divs.forEach((div) => {
    if (div.textContent && div.textContent.includes(word)) {
      div.style.display = "none";
    }
  });
}

// Example: Hide divs containing the word "example"
hideDivsContainingWord("puretech");
