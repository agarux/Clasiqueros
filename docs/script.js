const USER = "agarux";
const REPO = "Clasiqueros";

const tree = document.getElementById("tree");
const viewer = document.getElementById("viewer");

async function fetchRepo(path = "") {
  const res = await fetch(`https://api.github.com/repos/${USER}/${REPO}/contents/${path}`);
  return await res.json();
}

// 🔍 comprobar si carpeta tiene .md
async function hasMarkdown(path) {
  const items = await fetchRepo(path);

  for (let item of items) {
    if (item.type === "file" && item.name.endsWith(".md")) return true;
    if (item.type === "dir") {
      if (await hasMarkdown(item.path)) return true;
    }
  }
  return false;
}

// 🌳 árbol limpio
async function buildTree(path = "", container) {
  const items = await fetchRepo(path);

  for (let item of items) {

    if (item.type === "dir") {
      if (!(await hasMarkdown(item.path))) continue;

      const folder = document.createElement("div");
      folder.textContent = "📁 " + item.name;
      folder.className = "folder";

      const sub = document.createElement("div");
      sub.className = "subtree";

      folder.onclick = () => sub.classList.toggle("open");

      container.appendChild(folder);
      container.appendChild(sub);

      await buildTree(item.path, sub);
    }

    if (item.name.endsWith(".md")) {
      const file = document.createElement("div");
      file.textContent = "📄 " + item.name.replace(".md", "");
      file.className = "file";

      file.onclick = () => loadFile(item);

      container.appendChild(file);
    }
  }
}

// 🏷️ sacar tags correctamente
function extractTags(text) {
  return [...new Set(
    (text.match(/(^|\s)#([a-zA-Z0-9_-]+)/g) || [])
      .map(t => t.trim().substring(1))
  )];
}

// 📄 cargar archivo BIEN
async function loadFile(item) {

  // ⚠️ usamos download_url PERO calculamos base bien
  const res = await fetch(item.download_url);
  let text = await res.text();

  // 🔥 base REAL usando API path (esto es la clave)
  const basePath = `https://raw.githubusercontent.com/${USER}/${REPO}/main/${item.path.substring(0, item.path.lastIndexOf("/") + 1)}`;

  // 🖼️ resolver imágenes (ultra robusto)
  text = text.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, src) => {
    if (src.startsWith("http")) return match;

    try {
      const absolute = new URL(src, basePath).href;
      return `![${alt}](${absolute})`;
    } catch {
      return match;
    }
  });

  // 🏷️ tags
  const tags = extractTags(text);

  // ❗ quitar tags del texto (IMPORTANTE hacerlo después)
  text = text.replace(/(^|\s)#([a-zA-Z0-9_-]+)/g, "");

  let html = marked.parse(text);

  // 🎯 render de tags BONITO
  if (tags.length > 0) {
    html = `
      <div class="tag-box">
        <div class="tag-title">Tags</div>
        <div class="tag-container">
          ${tags.map(t => `<span class="tag">#${t}</span>`).join("")}
        </div>
      </div>
    ` + html;
  }

  viewer.innerHTML = html;
}

// 🚀 init
buildTree("", tree);