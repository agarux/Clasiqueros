const USER = "agarux";
const REPO = "Clasiqueros";

const sidebar = document.getElementById("sidebar");
const content = document.getElementById("content");

// Obtener estructura del repo
async function getRepoContents(path = "") {
  const res = await fetch(`https://api.github.com/repos/${USER}/${REPO}/contents/${path}`);
  return await res.json();
}

// Crear árbol
async function createTree(path = "", container) {
  const items = await getRepoContents(path);

  items.forEach(item => {
    if (item.type === "dir") {
      const folder = document.createElement("div");
      folder.textContent = "📁 " + item.name;
      folder.className = "folder";

      const subContainer = document.createElement("div");
      subContainer.style.display = "none";

      folder.onclick = () => {
        subContainer.style.display =
          subContainer.style.display === "none" ? "block" : "none";
      };

      container.appendChild(folder);
      container.appendChild(subContainer);

      createTree(item.path, subContainer);
    }

    if (item.name.endsWith(".md")) {
      const file = document.createElement("div");
      file.textContent = "📄 " + item.name;
      file.className = "file";

      file.onclick = () => loadMarkdown(item.download_url);

      container.appendChild(file);
    }
  });
}

// Cargar markdown
async function loadMarkdown(url) {
  const res = await fetch(url);
  const text = await res.text();
  content.innerHTML = marked.parse(text);
}

// Inicializar
createTree("", sidebar);