const USER = "agarux";
const REPO = "Clasiqueros";

const tree = document.getElementById("tree");
const viewer = document.getElementById("viewer");

async function fetchRepo(path = "") {
  const res = await fetch(`https://api.github.com/repos/${USER}/${REPO}/contents/${path}`);
  return await res.json();
}

async function buildTree(path = "", container) {
  const items = await fetchRepo(path);

  for (let item of items) {
    if (item.type === "dir") {
      const folder = document.createElement("div");
      folder.textContent = "📁 " + item.name;
      folder.className = "folder";

      const sub = document.createElement("div");
      sub.style.display = "none";

      folder.onclick = () => {
        sub.style.display = sub.style.display === "none" ? "block" : "none";
      };

      container.appendChild(folder);
      container.appendChild(sub);

      await buildTree(item.path, sub);
    }

    // Archivos .md o .base
    if (item.name.endsWith(".md") || item.name.endsWith(".base")) {
      const file = document.createElement("div");
      file.textContent = "📄 " + item.name;
      file.className = "file";

      file.onclick = () => loadFile(item.download_url);

      container.appendChild(file);
    }
  }
}

// Cargar y renderizar markdown
async function loadFile(url) {
  const res = await fetch(url);
  let text = await res.text();

  // Convertir tags Obsidian #tag en span
  text = text.replace(/#(\w+)/g, '<span class="tag">#$1</span>');

  viewer.innerHTML = marked.parse(text);
}

// Inicializar sidebar
buildTree("", tree);