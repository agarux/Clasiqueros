const USER = "agarux";
const REPO = "Clasiqueros";

const tree = document.getElementById("tree");
const viewer = document.getElementById("viewer");
const searchInput = document.getElementById("search");

let allFiles = [];

// Obtener archivos
async function fetchRepo(path = "") {
  const res = await fetch(`https://api.github.com/repos/${USER}/${REPO}/contents/${path}`);
  return await res.json();
}

// Construir árbol
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

    if (item.name.endsWith(".md")) {
      const file = document.createElement("div");
      file.textContent = "📄 " + item.name;
      file.className = "file";

      file.onclick = () => loadFile(item.download_url);

      container.appendChild(file);

      allFiles.push({
        name: item.name,
        url: item.download_url
      });
    }
  }
}

// Cargar markdown
async function loadFile(url) {
  const res = await fetch(url);
  const text = await res.text();
  viewer.innerHTML = marked.parse(text);
}

// Buscador
searchInput.addEventListener("input", () => {
  const value = searchInput.value.toLowerCase();
  tree.innerHTML = "";

  const filtered = allFiles.filter(f => f.name.toLowerCase().includes(value));

  filtered.forEach(file => {
    const el = document.createElement("div");
    el.textContent = "📄 " + file.name;
    el.className = "file";
    el.onclick = () => loadFile(file.url);
    tree.appendChild(el);
  });
});

// Init
buildTree("", tree);