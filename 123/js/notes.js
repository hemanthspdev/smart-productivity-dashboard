/* ------------ Toast + Error helper ------------ */
function toast(msg, isErr = false) {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    t.style.cssText =
      "position:fixed;right:16px;bottom:16px;background:#2b2f45;color:#fff;padding:10px 14px;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.35);opacity:0;transition:opacity .25s;z-index:9999";
    document.body.appendChild(t);
  }
  t.style.background = isErr ? "#8b2635" : "#2b2f45";
  t.textContent = msg;
  t.style.opacity = "1";
  setTimeout(() => (t.style.opacity = "0"), 1600);
}

function showFatal(err) {
  console.error(err);
  const box = document.getElementById("fileList");
  box.innerHTML = `<p style="color:#f66">Storage error: ${String(err)}</p>`;
  toast("Upload failed", true);
}

/* ------------ IndexedDB setup ------------ */
const DB_NAME = "myspace-files-v3";
const DB_VERSION = 1;
let db = null;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("files")) {
        const store = db.createObjectStore("files", {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("by_date", "addedAt");
      }
    };
    req.onsuccess = () => {
      db = req.result;
      resolve(db);
    };
    req.onerror = () => reject(req.error);
  });
}

const rw = (name) => db.transaction(name, "readwrite").objectStore(name);
const ro = (name) => db.transaction(name, "readonly").objectStore(name);

/* ------------ File helpers ------------ */
function readAsArrayBuffer(file) {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = () => rej(fr.error);
    fr.readAsArrayBuffer(file);
  });
}

/* ------------ Add Files (Fixed) ------------ */
async function addFiles(files) {
  await openDB();
  if (navigator.storage && navigator.storage.persist) {
    try {
      await navigator.storage.persist();
    } catch {}
  }

  for (const f of Array.from(files)) {
    const data = await readAsArrayBuffer(f);

    await new Promise((res, rej) => {
      const tx = db.transaction("files", "readwrite");
      const store = tx.objectStore("files");
      const r = store.add({
        name: f.name,
        size: f.size,
        type: f.type || "application/octet-stream",
        data,
        addedAt: Date.now(),
      });
      r.onsuccess = () => res();
      r.onerror = () => rej(r.error);
    });
  }
}

/* ------------ CRUD Helpers ------------ */
async function listFiles() {
  await openDB();
  return new Promise((res, rej) => {
    const r = ro("files").getAll();
    r.onsuccess = () => res(r.result || []);
    r.onerror = () => rej(r.error);
  });
}

async function deleteFile(id) {
  await openDB();
  return new Promise((res, rej) => {
    const r = rw("files").delete(id);
    r.onsuccess = () => res();
    r.onerror = () => rej(r.error);
  });
}

async function renameFile(id, newName) {
  await openDB();
  return new Promise((res, rej) => {
    const s = rw("files");
    const g = s.get(id);
    g.onsuccess = () => {
      const rec = g.result;
      if (!rec) return res();
      rec.name = newName || rec.name;
      const p = s.put(rec);
      p.onsuccess = () => res();
      p.onerror = () => rej(p.error);
    };
    g.onerror = () => rej(g.error);
  });
}

/* ------------ UI Elements ------------ */
const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const fileList = document.getElementById("fileList");

uploadBtn.onclick = async () => {
  if (!fileInput.files.length) return toast("No file selected");
  try {
    await addFiles(fileInput.files);
    fileInput.value = "";
    await renderFiles();
    toast("Uploaded ✅");
  } catch (err) {
    showFatal(err);
  }
};

/* ------------ Render UI ------------ */
async function renderFiles() {
  try {
    const files = await listFiles();
    fileList.innerHTML = "";
    if (!files.length) {
      fileList.innerHTML = "<p>No files yet.</p>";
      return;
    }

    files.sort((a, b) => b.addedAt - a.addedAt);

    for (const f of files) {
      const card = document.createElement("div");
      card.className = "file-card";

      const meta = document.createElement("div");
      meta.className = "file-meta";

      const nameInput = document.createElement("input");
      nameInput.className = "rename-input";
      nameInput.value = f.name;
      nameInput.title = "Click to rename";
      nameInput.onchange = async () => {
        try {
          await renameFile(f.id, nameInput.value.trim());
          toast("Renamed ✅");
        } catch (e) {
          showFatal(e);
        }
      };

      const info = document.createElement("span");
      info.textContent = `${(f.size / 1024).toFixed(1)} KB • ${
        f.type || "file"
      }`;

      meta.append(nameInput, info);

      const actions = document.createElement("div");
      actions.className = "file-actions";

      // Open file in new tab
      const openBtn = document.createElement("button");
      openBtn.textContent = "Open";
      openBtn.onclick = () => {
        try {
          const blob = new Blob([f.data], {
            type: f.type || "application/octet-stream",
          });
          const url = URL.createObjectURL(blob);
          window.open(url, "_blank");
          setTimeout(() => URL.revokeObjectURL(url), 60_000);
        } catch (e) {
          showFatal(e);
        }
      };

      // Download file
      const dlBtn = document.createElement("button");
      dlBtn.textContent = "Download";
      dlBtn.onclick = () => {
        try {
          const blob = new Blob([f.data], {
            type: f.type || "application/octet-stream",
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = f.name;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 2000);
        } catch (e) {
          showFatal(e);
        }
      };

      // Delete file
      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.onclick = async () => {
        try {
          await deleteFile(f.id);
          renderFiles();
          toast("Deleted 🗑️");
        } catch (e) {
          showFatal(e);
        }
      };

      actions.append(openBtn, dlBtn, delBtn);
      card.append(meta, actions);
      fileList.appendChild(card);
    }
  } catch (err) {
    showFatal(err);
  }
}

/* ------------ Initialize ------------ */
openDB()
  .then(renderFiles)
  .catch(showFatal);
